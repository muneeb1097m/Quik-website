import { NextResponse } from 'next/server';
import { NewsMonitor } from '@/lib/qie/monitor';
import { GeminiSynthesizer } from '@/lib/qie/gemini';
import { GoogleImageSearcher } from '@/lib/qie/image_search';
import { db } from '@/lib/qie/db';
import { EventCategory } from '@/types';
import { generateNewsImage } from '@/lib/image-gen';
import { scrapeArticleContent } from '@/lib/qie/scraper';
import { stripHtml } from '@/lib/utils';

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

        const newItems = rawItems.filter(item => !existingUrls.has(item.url));
        console.log(`Found ${newItems.length} new items to process (after dedupe).`);

        if (newItems.length === 0) {
            return NextResponse.json({ success: true, message: 'No new items to process.' });
        }

        // 3. Process the batch (Top 15 new items)
        // User requested 500+ images/day. 
        // 15 items * 24h * 4 (15min runs) = 1440 items/day capacity
        const batch = newItems.slice(0, 15);

        console.log(`Processing batch of ${batch.length} items in parallel...`);

        // Check daily limit ONCE for the whole batch to save DB calls
        // It's okay if we go slightly over 95 for Google Images due to concurrency
        const todayCount = await db.getTodayCount();
        let googleSearchUsed = todayCount;

        // Process in parallel
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

                // 3b. Image Handling
                // Priority: Google Image Search (First 95/day) > Pollinations AI (Flux) > Safe Fallback
                let finalImageUrl = '';

                // Attempt 1: Google Image Search
                // Limit: 100 free searches/day. We cap at 95 to be safe.
                try {
                    if (googleSearchUsed < 95) {
                        // Optimistically increment local counter to distribute "slots"
                        googleSearchUsed++;

                        const visualKeywords = await synthesizer.extractVisualKeyword(aiResult.headline);
                        console.log(`[${item.source}] Google Search Keywords: ${visualKeywords}`);
                        const googleUrl = await imageSearcher.search(visualKeywords);

                        if (googleUrl) {
                            // Quickly verify the Google image is accessible
                            const check = await fetch(googleUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
                            if (check.ok && check.headers.get('content-type')?.startsWith('image/')) {
                                finalImageUrl = googleUrl;
                                console.log('[${item.source}] Using Google Image:', googleUrl);
                            }
                        }
                    } else {
                        console.log(`[${item.source}] Google Search daily limit reached/skipped.`);
                    }
                } catch (gErr) {
                    console.warn(`[${item.source}] Google Image Search skipped or failed:`, gErr);
                }

                // Attempt 2: Pollinations AI (If Google failed)
                let attempts = 0;
                const maxAttempts = 4;

                while (!finalImageUrl && attempts < maxAttempts) {
                    // Generate a new URL (random seed selects random model)
                    const candidateUrl = generateNewsImage(aiResult.headline, item.category || 'Technology');

                    try {
                        // We must use GET, not HEAD, to check content-length reliably on some CDNs
                        // and ensure we trigger the generation to catch the error image if it occurs.
                        const check = await fetch(candidateUrl, {
                            method: 'GET',
                            headers: { 'User-Agent': 'QuikNews/1.0 (Monitor)' }, // Polite UA
                            signal: AbortSignal.timeout(8000) // 8s timeout for generation
                        });

                        const size = parseInt(check.headers.get('content-length') || '0');
                        const contentType = check.headers.get('content-type') || '';

                        // Validation Rules:
                        // 1. Must be 200 OK
                        // 2. Must be an image
                        // 3. Must be > 50KB (Error images are small ~10-15KB, Real images are >100KB)
                        const isValidImage = check.ok &&
                            contentType.startsWith('image/') &&
                            size > 50000;

                        if (isValidImage) {
                            finalImageUrl = candidateUrl;
                            console.log(`[${item.source}] Image verified: ${size} bytes`);
                            break;
                        }

                        console.warn(`[${item.source}] Image generation attempt ${attempts + 1} rejected: Size=${size}b`);
                    } catch (err) {
                        console.warn(`[${item.source}] Image generation attempt ${attempts + 1} error:`, err);
                    }
                    attempts++;
                }

                // Fallback if all AI attempts fail
                if (!finalImageUrl) {
                    console.warn(`[${item.source}] All AI image generation attempts failed/limited. Using Safe Fallback.`);
                    // Picsum fallback (Guaranteed to work, never shows "limit exceeded")
                    finalImageUrl = `https://picsum.photos/seed/${Date.now()}/1024/1024?grayscale&blur=2`;
                }

                // 4. Save to DB
                const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

                // CRITICAL: Use RSS feed category, NOT Gemini's category
                const finalCategory = item.category || 'Technology'; // Trust the RSS source

                // Add Event
                await db.addEvent({
                    id: eventId,
                    title: aiResult.headline,
                    category: finalCategory as EventCategory, // Use RSS category directly!
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
