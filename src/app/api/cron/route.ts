import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { NewsMonitor } from '@/lib/qie/monitor';
import { GeminiSynthesizer } from '@/lib/qie/gemini';
import { GoogleImageSearcher } from '@/lib/qie/image_search';
import { db } from '@/lib/qie/db';
import { EventCategory } from '@/types';

import { CloudflareProvider, PollinationProvider } from '@/lib/qie/image-providers';
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

                // Attempt 2: Load Balanced Image Generation (Pollinations vs Hercai)
                // Note: Research showed Hercai is unstable (503). 
                // We prioritize Pollinations (Flux) and use Hercai as fallback.
                if (!finalImageUrl) {
                    // We prioritize API Keys first (Airforce), then Pollinations, then Hercai fallback.
                    const providers = [
                        new PollinationProvider(), // Pollinations Flux (via internal API)
                        new CloudflareProvider(), // Cloudflare Flux (via internal API)
                    ];

                    for (const provider of providers) {
                        try {
                            console.log(`[${item.source}] Trying image provider: ${provider.name}...`);
                            const candidateUrl = await provider.generate(aiResult.headline, item.category || 'Technology');

                            if (!candidateUrl) {
                                console.warn(`[${item.source}] Provider ${provider.name} returned no URL.`);
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

                // Fallback if all AI attempts fail
                if (!finalImageUrl) {
                    console.warn(`[${item.source}] All AI image generation attempts failed/limited. Using Safe Fallback.`);
                    // Picsum fallback (Guaranteed to work, never shows "limit exceeded")
                    // FIX: Removed grayscale&blur, switched to Unsplash source for better quality color images
                    finalImageUrl = `https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1024&auto=format&fit=crop`;
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

        // Optimization: Only revalidate the homepage if we actually added new content
        // This ensures users see new news immediately without waiting for the 1-hour ISR cycle
        if (newSignals.length > 0) {
            // revalidatePath('/'); // Temporarily disabled to reduce ISR Writes (Over Vercel Limit)
            console.log("Skipping revalidatePath('/') to save ISR Writes");
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
