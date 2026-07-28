import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NewsMonitor } from '@/lib/qie/monitor';
import { GeminiSynthesizer } from '@/lib/qie/gemini';
import { GoogleImageSearcher } from '@/lib/qie/image_search';
import { db } from '@/lib/qie/db';

import { CloudflareProvider, PollinationProvider } from '@/lib/qie/image-providers';
import { scrapeArticleContent } from '@/lib/qie/scraper';
import { stripHtml } from '@/lib/utils';
// import stringSimilarity from 'string-similarity'; // Removed to avoid edge compatibility issues

// Prevent vercel time out
export const maxDuration = 60;
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

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

            // Second pass: Deduplication
            if (recentHeadlines.length > 0 && item.headline) {
                const targetMatch = item.headline.toLowerCase().replace(/[^a-z0-9]/gi, '');
                for (const recent of recentHeadlines) {
                    const rMatch = recent.toLowerCase().replace(/[^a-z0-9]/gi, '');
                    if (targetMatch.includes(rMatch) || rMatch.includes(targetMatch)) {
                        console.log(`[Duplicate Prevented PRE-AI] Skipping "${item.headline}"`);
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

        // 3. Process the best item (1 trending story)
        // User requested 1 article per 15 min run = 96 articles/day
        console.log(`Analyzing ${newItems.length} new items to find the most trending story...`);
        const trendingIndex = await synthesizer.selectTrendingStory(newItems.map(i => ({
            headline: i.headline,
            contentSnippet: i.contentSnippet || ''
        })));
        
        const selectedItem = newItems[trendingIndex];
        const batch = [selectedItem];

        console.log(`Processing selected trending item: ${selectedItem.headline}`);

        // Check daily limit ONCE for the whole batch to save DB calls
        const todayCount = await db.getTodayCount();
        let googleSearchUsed = todayCount;

        // Process in parallel (though it's only 1 item now)
        const results = await Promise.all(batch.map(async (item) => {
            try {
                // 3. Scrape Full Content
                console.log(`[${item.source}] Scraping full content for: ${item.headline}...`);
                const scrapedData = await scrapeArticleContent(item.url);
                const fullText = scrapedData.content;
                const contextToAnalyze = fullText.length > 200 ? fullText : (item.contentSnippet || item.headline);

                // 4. Synthesize with Gemini (NO CATEGORIZATION - we use RSS feed category)
                console.log(`[${item.source}] Synthesizing...`);
                const aiResult = await synthesizer.rewriteStory(item.headline, contextToAnalyze);

                // POST-AI Similarity Check
                // AI titles should not highly match recent AI titles
                if (recentHeadlines.length > 0) {
                    const targetMatchAI = aiResult.headline.toLowerCase().replace(/[^a-z0-9]/gi, '');
                    const isSimilar = recentHeadlines.some((recent: string) => {
                        const rMatch = recent.toLowerCase().replace(/[^a-z0-9]/gi, '');
                        return targetMatchAI === rMatch;
                    });

                    if (isSimilar) {
                        console.log(`[Duplicate Prevented POST-AI] Skipping "${aiResult.headline}"`);
                        return null; // Don't save this item
                    }
                }

                // Add to recentHeadlines to prevent same-batch duplicated stories being saved
                recentHeadlines.push(aiResult.headline);


                // 3b. Image Handling
                // Priority: Scraped Metadata > RSS Feed Image > Google Image Search > Pollinations AI (Flux) > Category Fallback
                let finalImageUrl = '';

                // CRITICAL: Use RSS feed category, NOT Gemini's category
                const finalCategory = item.category || 'Technology'; // Trust the RSS source

                // Attempt 0: Source Image (Best Quality & Relevance)
                // Check Scraper result first (og:image is usually high quality)
                if (scrapedData.imageUrl && scrapedData.imageUrl.startsWith('http')) {
                    finalImageUrl = scrapedData.imageUrl;
                    console.log(`[${item.source}] Using Scraped Source Image: ${finalImageUrl}`);
                }
                // Check RSS Feed image next
                else if (item.imageUrl && item.imageUrl.startsWith('http')) {
                    finalImageUrl = item.imageUrl;
                    console.log(`[${item.source}] Using RSS Feed Image: ${finalImageUrl}`);
                }

                // If no source image, try generation/search
                if (!finalImageUrl) {

                    // Attempt 1: Google Image Search
                    // Limit: 100 free searches/day. We cap at 95 to be safe.
                    try {
                        if (googleSearchUsed < 95) {
                            googleSearchUsed++; // Increment
                            const visualKeywords = await synthesizer.extractVisualKeyword(aiResult.headline);
                            console.log(`[${item.source}] Google Search Keywords: ${visualKeywords}`);
                            const googleUrl = await imageSearcher.search(visualKeywords);

                            if (googleUrl) {
                                // Quickly verify
                                const check = await fetch(googleUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
                                if (check.ok && check.headers.get('content-type')?.startsWith('image/')) {
                                    finalImageUrl = googleUrl;
                                    console.log(`[${item.source}] Using Google Image:`, googleUrl);
                                }
                            }
                        } else {
                            console.log(`[${item.source}] Google Search daily limit reached/skipped.`);
                        }
                    } catch (gErr) {
                        console.warn(`[${item.source}] Google Image Search skipped or failed:`, gErr);
                    }

                    // Attempt 2: Load Balanced Image Generation (Pollinations vs Hercai)
                    if (!finalImageUrl) {
                        const providers = [
                            new PollinationProvider(), // Pollinations Flux (via internal API)
                            new CloudflareProvider(), // Cloudflare Flux (via internal API)
                        ];

                        for (const provider of providers) {
                            try {
                                console.log(`[${item.source}] Trying image provider: ${provider.name}...`);
                                const candidateUrl = await provider.generate(aiResult.headline, item.category || 'Technology');

                                if (!candidateUrl) {
                                    continue;
                                }

                                console.log(`[${item.source}] Verifying candidate URL: ${candidateUrl}`);

                                // We must use GET to check content-length and content
                                const check = await fetch(candidateUrl, {
                                    method: 'GET',
                                    headers: { 'User-Agent': 'QuikNews/1.0 (Monitor)' },
                                    signal: AbortSignal.timeout(30000) // 30s timeout per attempt (Flux can be slow)
                                });

                                if (check.redirected) {
                                    console.warn(`[${item.source}] Image redirected (suspicious): ${check.url}`);
                                    continue;
                                }

                                if (!check.ok) {
                                    console.warn(`[${item.source}] Image check failed: ${check.status}`);
                                    continue;
                                }

                                const size = parseInt(check.headers.get('content-length') || '0');
                                const contentType = check.headers.get('content-type') || '';

                                // Buffer check for error text
                                const buffer = await check.arrayBuffer();
                                let hasErrorText = false;

                                if (size < 150000) {
                                    const text = new TextDecoder().decode(buffer.slice(0, 2048)).toLowerCase();
                                    hasErrorText = text.includes('rate limit') ||
                                        text.includes('limit reached') ||
                                        (text.includes('error') && !text.includes('error: none'));
                                }

                                const isValidImage = contentType.startsWith('image/') &&
                                    size > 50000 && // Lowered slightly for Hercai potentially
                                    !hasErrorText;

                                if (isValidImage) {
                                    finalImageUrl = candidateUrl;
                                    console.log(`[${item.source}] Image verified (${provider.name}): ${size} bytes`);
                                    break; // Success!
                                } else {
                                    console.warn(`[${item.source}] Image rejected (${provider.name}): Size=${size}b, ErrorText=${hasErrorText}`);
                                }

                            } catch (err) {
                                console.warn(`[${item.source}] Image generation failed for ${provider.name}:`, err);
                            }
                        }
                    }
                }

                // Fallback if all extraction & AI attempts fail
                if (!finalImageUrl) {
                    console.warn(`[${item.source}] All image attempts failed. Using Category Fallback.`);

                    // Category-Specific Fallbacks (Unsplash Source)
                    const CATEGORY_FALLBACKS: Record<string, string> = {
                        'Pakistan': 'https://images.unsplash.com/photo-1568347877546-444654572239?q=80&w=1024&auto=format&fit=crop', // Pakistan Monument/Flag
                        'Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1024&auto=format&fit=crop', // Circuit/Tech
                        'AI': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1024&auto=format&fit=crop', // AI Brain/Chip
                        'Business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1024&auto=format&fit=crop', // Analytics/Graph
                        'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1024&auto=format&fit=crop', // Running/Sports
                        'Auto': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1024&auto=format&fit=crop', // Car
                        'Startups': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1024&auto=format&fit=crop', // Team working
                        'Global': 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=1024&auto=format&fit=crop', // World Map
                        'Science': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1024&auto=format&fit=crop', // Science/Space
                    };

                    const fallbackKey = finalCategory; // Already validated to be an EventCategory or string
                    finalImageUrl = CATEGORY_FALLBACKS[fallbackKey] ||
                        // Generic Fallback (Newspaper/Reading)
                        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1024&auto=format&fit=crop';
                }

                // 4. Save to DB
                const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;



                // Add Event
                await db.addEvent({
                    id: eventId,
                    title: aiResult.headline,
                    category: finalCategory, // Use RSS category directly!
                    status: 'Live',
                    detectedAt: new Date().toISOString(),
                    lastUpdatedAt: new Date().toISOString(),
                    confidenceScore: 0.9,
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
                    fullReport: stripHtml(aiResult.fullReport)
                };
                await db.addSignal(signal);
                return signal;

            } catch (innerError) {
                console.error(`Error processing item ${item.headline}:`, innerError);
                return null;
            }
        }));

        const newSignals = results.filter(s => s !== null);

        // Optimization: Only revalidate the homepage if we actually added new content
        // This ensures users see new news immediately without waiting for the 1-hour ISR cycle
        if (newSignals.length > 0) {
            revalidatePath('/');
            revalidateTag('signals');
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
