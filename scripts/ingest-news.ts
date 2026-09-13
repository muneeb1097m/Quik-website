import 'dotenv/config';
import { NewsMonitor } from '@/lib/qie/monitor';
import { GeminiSynthesizer } from '@/lib/qie/gemini';
import { GoogleImageSearcher } from '@/lib/qie/image_search';
import { db } from '@/lib/qie/db';
import { CloudflareProvider, PollinationProvider } from '@/lib/qie/image-providers';
import { scrapeArticleContent } from '@/lib/qie/scraper';
import { isSimilarHeadline } from '@/lib/utils';
import { evaluateSeoQuality } from '@/lib/seo';

async function triggerVercelRevalidation() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
    const secret = process.env.CRON_SECRET || process.env.REVALIDATE_SECRET;

    if (!appUrl || !secret) {
        console.log('[Revalidation] Skipped: APP_URL or CRON_SECRET not provided.');
        return;
    }

    try {
        const revalidateEndpoint = `${appUrl.replace(/\/$/, '')}/api/revalidate?secret=${encodeURIComponent(secret)}`;
        console.log(`[Revalidation] Triggering Vercel cache purge at: ${revalidateEndpoint}...`);
        const res = await fetch(revalidateEndpoint, { method: 'POST' });
        if (res.ok) {
            console.log('[Revalidation] Vercel cache successfully revalidated.');
        } else {
            console.warn(`[Revalidation] Warning: Response status ${res.status} - ${await res.text()}`);
        }
    } catch (err) {
        console.warn('[Revalidation] Failed to trigger revalidation endpoint:', err);
    }
}

export async function runIngestion() {
    console.log('=== News Ingestion Pipeline Started ===');
    const startTime = Date.now();

    const monitor = new NewsMonitor();
    const synthesizer = new GeminiSynthesizer();
    const imageSearcher = new GoogleImageSearcher();

    try {
        // 1. Fetch Raw RSS
        const rawItems = await monitor.fetchLatestNews();
        console.log(`[RSS] Fetched ${rawItems.length} items from RSS feeds.`);

        if (rawItems.length === 0) {
            console.log('[RSS] No items fetched. Exiting.');
            return;
        }

        // 2. Efficiently De-duplicate (Batch Check)
        const allUrls = rawItems.map(i => i.url);
        const existingUrls = await db.getExistingUrls(allUrls);
        const recentHeadlines = await db.getRecentHeadlines(500);

        const seenUrls = new Set<string>();
        const seenHeadlines = new Set<string>();

        const newItems = rawItems.filter(item => {
            if (existingUrls.has(item.url) || seenUrls.has(item.url)) return false;
            seenUrls.add(item.url);

            if (seenHeadlines.has(item.headline)) return false;
            seenHeadlines.add(item.headline);

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

        console.log(`[Deduplication] Found ${newItems.length} new candidates to process.`);

        if (newItems.length === 0) {
            console.log('[Ingestion] No new unique items to process. Exiting.');
            return;
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
        console.log(`[AI Trending] Analyzing ${candidateItems.length} candidate items to find the top trending story...`);
        const trendingIndex = await synthesizer.selectTrendingStory(candidateItems.map(i => ({
            headline: i.headline,
            contentSnippet: i.contentSnippet || ''
        })));

        const selectedItem = candidateItems[trendingIndex] || candidateItems[0];
        console.log(`[Selected Story] Headline: "${selectedItem.headline}" (${selectedItem.source})`);

        const todayCount = await db.getTodayCount();
        let googleSearchUsed = todayCount;

        // Scrape Full Content
        console.log(`[Scraper] Scraping full content from: ${selectedItem.url}...`);
        const scrapedData = await scrapeArticleContent(selectedItem.url);
        const fullText = scrapedData.content;
        const contextToAnalyze = fullText.length > 200 ? fullText : (selectedItem.contentSnippet || selectedItem.headline);

        // Synthesize with Gemini
        console.log('[AI Synthesizer] Rewriting and analyzing story with Gemini...');
        const aiResult = await synthesizer.rewriteStory(selectedItem.headline, contextToAnalyze);

        // POST-AI Similarity Check
        if (recentHeadlines.length > 0) {
            const isSimilar = recentHeadlines.some((recent: string) => isSimilarHeadline(aiResult.headline, recent));
            if (isSimilar) {
                console.log(`[Duplicate Prevented POST-AI] Skipping similar AI title "${aiResult.headline}"`);
                return;
            }
        }

        // Image Handling
        let finalImageUrl = '';
        const finalCategory = selectedItem.category || 'Technology';

        if (scrapedData.imageUrl && scrapedData.imageUrl.startsWith('http')) {
            finalImageUrl = scrapedData.imageUrl;
        } else if (selectedItem.imageUrl && selectedItem.imageUrl.startsWith('http')) {
            finalImageUrl = selectedItem.imageUrl;
        }

        if (!finalImageUrl) {
            try {
                if (googleSearchUsed < 95) {
                    googleSearchUsed++;
                    const visualKeywords = await synthesizer.extractVisualKeyword(aiResult.headline);
                    const googleUrl = await imageSearcher.search(visualKeywords);
                    if (googleUrl) {
                        const check = await fetch(googleUrl, { method: 'HEAD', signal: AbortSignal.timeout(4000) });
                        if (check.ok && check.headers.get('content-type')?.startsWith('image/')) {
                            finalImageUrl = googleUrl;
                        }
                    }
                }
            } catch (gErr) {
                console.warn('[Image Search] Google Image Search skipped or failed:', gErr);
            }

            if (!finalImageUrl) {
                const providers = [
                    new PollinationProvider(),
                    new CloudflareProvider(),
                ];

                for (const provider of providers) {
                    try {
                        const candidateUrl = await provider.generate(aiResult.headline, selectedItem.category || 'Technology');
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
                        console.warn(`[Image Provider] Image generation failed for ${provider.name}:`, err);
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

        // SEO Quality Scoring Gate
        const sourceData = [{
            name: selectedItem.source,
            url: selectedItem.url,
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

        // 4. Save to Database
        const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

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
                name: selectedItem.source,
                url: selectedItem.url,
                reliabilityScore: 1,
                type: 'Media'
            }],
            imageUrl: finalImageUrl
        });

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
        console.log(`[Database] Successfully saved new signal: "${signal.headline}"`);

        // 5. Trigger Vercel on-demand ISR revalidation
        await triggerVercelRevalidation();

        console.log(`=== Ingestion Finished in ${((Date.now() - startTime) / 1000).toFixed(2)}s ===`);

    } catch (error) {
        console.error('[Ingestion Error] Fatal error in ingestion pipeline:', error);
        process.exit(1);
    }
}

// Execute when called directly
runIngestion().then(() => {
    process.exit(0);
}).catch((err) => {
    console.error('Unhandled ingestion rejection:', err);
    process.exit(1);
});
