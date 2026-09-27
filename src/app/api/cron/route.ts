import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NewsMonitor } from '@/lib/qie/monitor';
import { GeminiSynthesizer } from '@/lib/qie/gemini';
import { GoogleImageSearcher } from '@/lib/qie/image_search';
import { db } from '@/lib/qie/db';
import { CloudflareProvider, PollinationProvider } from '@/lib/qie/image-providers';
import { scrapeArticleContent } from '@/lib/qie/scraper';
import { stripHtml, isSimilarHeadline } from '@/lib/utils';
import { evaluateSeoQuality } from '@/lib/seo';

// Prevent vercel time out
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET() {
    console.log('Cron Job Started: fetching news...');

    const monitor = new NewsMonitor();
    const synthesizer = new GeminiSynthesizer();
    const imageSearcher = new GoogleImageSearcher();

    try {
        // 1. Fetch Raw RSS
        const rawItems = await monitor.fetchLatestNews();
        console.log(`Fetched ${rawItems.length} items from RSS.`);

        // 2. Efficiently De-duplicate (Batch Check)
        const allUrls = rawItems.map(i => i.url);
        const existingUrls = await db.getExistingUrls(allUrls);

        // Fetch recent headlines to check string similarity
        const recentHeadlines = await db.getRecentHeadlines(500);

        const seenUrls = new Set<string>();
        const seenHeadlines = new Set<string>();

        const newItems = rawItems.filter(item => {
            // First pass: Direct URL deduplication against DB and current batch
            if (existingUrls.has(item.url) || seenUrls.has(item.url)) return false;
            seenUrls.add(item.url);

            // Exact match headline deduplication in current batch
            if (seenHeadlines.has(item.headline)) return false;
            seenHeadlines.add(item.headline);

            // Second pass: Deduplication against DB recent headlines (Smart similarity match)
            if (recentHeadlines.length > 0 && item.headline) {
                for (const recent of recentHeadlines) {
                    if (isSimilarHeadline(item.headline, recent)) {
                        console.log(`[Duplicate Prevented PRE-AI] Skipping similar duplicate "${item.headline}" ~ "${recent}"`);
                        return false;
                    }
                }
            }

            return true;
        });

        console.log(`Found ${newItems.length} new items to process (after dedupe).`);

        if (newItems.length === 0) {
            return NextResponse.json({ success: true, message: 'No new items to process.' });
        }

        // Category Balancing: Check recent 5 signals to maintain healthy category distribution
        let candidateItems = newItems;
        try {
            const recentSignals = await db.getSignals(undefined, 5);
            const pakistanCount = recentSignals.filter((s: any) => s.event?.category === 'Pakistan').length;
            
            if (pakistanCount >= 2) {
                const nonPakistanItems = newItems.filter(i => i.category !== 'Pakistan');
                if (nonPakistanItems.length > 0) {
                    console.log(`[Category Balancing] Recent Pakistan stories=${pakistanCount}/5. Prioritizing ${nonPakistanItems.length} international/tech candidates.`);
                    candidateItems = nonPakistanItems;
                }
            }
        } catch (e) {
            console.warn('[Category Balancing Error]:', e);
        }

        // 3. Process the best item (1 trending story)
        console.log(`Analyzing ${candidateItems.length} candidate items to find the most trending story...`);
        const trendingIndex = await synthesizer.selectTrendingStory(candidateItems.map(i => ({
            headline: i.headline,
            contentSnippet: i.contentSnippet || ''
        })));

        const selectedItem = candidateItems[trendingIndex];
        const batch = [selectedItem];

        console.log(`Processing selected trending item: ${selectedItem.headline}`);

        const todayCount = await db.getTodayCount();
        let googleSearchUsed = todayCount;

        const results = await Promise.all(batch.map(async (item) => {
            try {
                // Scrape Full Content
                console.log(`[${item.source}] Scraping full content for: ${item.headline}...`);
                const scrapedData = await scrapeArticleContent(item.url);
                const fullText = scrapedData.content;
                const contextToAnalyze = fullText.length > 200 ? fullText : (item.contentSnippet || item.headline);

                // Synthesize with Gemini
                console.log(`[${item.source}] Synthesizing...`);
                const aiResult = await synthesizer.rewriteStory(item.headline, contextToAnalyze);

                const wordCount = aiResult.fullReport.split(/\s+/).filter(Boolean).length;
                if (wordCount < 400) {
                    console.warn(`[Quality Gate Reject] Article "${aiResult.headline}" only has ${wordCount} words. Skipping publication.`);
                    return null;
                }
                console.log(`[${item.source}] Successfully synthesized article (${wordCount} words).`);

                // POST-AI Similarity Check
                if (recentHeadlines.length > 0) {
                    const isSimilar = recentHeadlines.some((recent: string) => isSimilarHeadline(aiResult.headline, recent));
                    if (isSimilar) {
                        console.log(`[Duplicate Prevented POST-AI] Skipping similar AI title "${aiResult.headline}"`);
                        return null;
                    }
                }
                recentHeadlines.push(aiResult.headline);

                // Image Handling
                let finalImageUrl = '';
                const finalCategory = item.category || 'Technology';

                if (scrapedData.imageUrl && scrapedData.imageUrl.startsWith('http')) {
                    finalImageUrl = scrapedData.imageUrl;
                } else if (item.imageUrl && item.imageUrl.startsWith('http')) {
                    finalImageUrl = item.imageUrl;
                }

                if (!finalImageUrl) {
                    try {
                        if (googleSearchUsed < 95) {
                            googleSearchUsed++;
                            const visualKeywords = await synthesizer.extractVisualKeyword(aiResult.headline);
                            const googleUrl = await imageSearcher.search(visualKeywords);
                            if (googleUrl) {
                                const check = await fetch(googleUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
                                if (check.ok && check.headers.get('content-type')?.startsWith('image/')) {
                                    finalImageUrl = googleUrl;
                                }
                            }
                        }
                    } catch (gErr) {
                        console.warn(`[${item.source}] Google Image Search skipped or failed:`, gErr);
                    }

                    if (!finalImageUrl) {
                        const providers = [
                            new PollinationProvider(),
                            new CloudflareProvider(),
                        ];

                        for (const provider of providers) {
                            try {
                                const candidateUrl = await provider.generate(aiResult.headline, item.category || 'Technology');
                                if (!candidateUrl) continue;

                                const check = await fetch(candidateUrl, {
                                    method: 'GET',
                                    headers: { 'User-Agent': 'QuikNews/1.0 (Monitor)' },
                                    signal: AbortSignal.timeout(30000)
                                });

                                if (!check.ok || check.redirected) continue;
                                const size = parseInt(check.headers.get('content-length') || '0');
                                const contentType = check.headers.get('content-type') || '';

                                if (contentType.startsWith('image/') && size > 50000) {
                                    finalImageUrl = candidateUrl;
                                    break;
                                }
                            } catch (err) {
                                console.warn(`[${item.source}] Image generation failed for ${provider.name}:`, err);
                            }
                        }
                    }
                }

                if (!finalImageUrl) {
                    const CATEGORY_FALLBACKS: Record<string, string> = {
                        'Pakistan': 'https://images.unsplash.com/photo-1568347877546-444654572239?q=80&w=1024&auto=format&fit=crop',
                        'Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1024&auto=format&fit=crop',
                        'AI': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1024&auto=format&fit=crop',
                        'Business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1024&auto=format&fit=crop',
                        'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1024&auto=format&fit=crop',
                        'Auto': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1024&auto=format&fit=crop',
                        'Startups': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1024&auto=format&fit=crop',
                        'Global': 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=1024&auto=format&fit=crop',
                    };
                    finalImageUrl = CATEGORY_FALLBACKS[finalCategory] || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1024&auto=format&fit=crop';
                }

                // 4. SEO Quality Scoring Gate
                const sourceData = [{
                    name: item.source,
                    url: item.url,
                }];

                const qualityReport = evaluateSeoQuality({
                    headline: aiResult.headline,
                    summary: aiResult.summary,
                    fullReport: aiResult.fullReport,
                    category: finalCategory,
                    sources: sourceData,
                    imageUrl: finalImageUrl
                });

                console.log(`[SEO Quality Gate] Score: ${qualityReport.score}/100 | Passed: ${qualityReport.passed} | Risk: ${qualityReport.riskLevel}`);

                const eventStatus = qualityReport.riskLevel === 'High' ? 'PendingReview' : 'Live';

                // 5. Save to DB
                const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

                // Add Event
                await db.addEvent({
                    id: eventId,
                    title: aiResult.headline,
                    category: finalCategory,
                    status: eventStatus,
                    detectedAt: new Date().toISOString(),
                    lastUpdatedAt: new Date().toISOString(),
                    confidenceScore: qualityReport.score / 100,
                    sources: [{
                        id: `src_${Date.now()}`,
                        name: item.source,
                        url: item.url,
                        reliabilityScore: 1,
                        type: 'Media'
                    }],
                    imageUrl: finalImageUrl
                });

                // Add Signal
                const signal = {
                    id: `sig_${eventId}`,
                    eventId: eventId,
                    headline: aiResult.headline,
                    summary: aiResult.summary,
                    generatedAt: new Date().toISOString(),
                    imageUrl: finalImageUrl,
                    fullReport: aiResult.fullReport
                };
                await db.addSignal(signal);
                return signal;

            } catch (innerError) {
                console.error(`Error processing item ${item.headline}:`, innerError);
                return null;
            }
        }));

        const newSignals = results.filter(s => s !== null);

        if (newSignals.length > 0) {
            revalidatePath('/', 'page');
            (revalidateTag as any)('signals');
            console.log("Revalidated '/' path and 'signals' cache tag.");
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${batch.length} items. Created ${newSignals.length} new signals.`,
            signals: newSignals
        });

    } catch (error) {
        console.error('Cron job failed:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
