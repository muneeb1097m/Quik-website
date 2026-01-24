import { NextResponse } from 'next/server';
import { NewsMonitor } from '@/lib/qie/monitor';
import { GeminiSynthesizer } from '@/lib/qie/gemini';
import { GoogleImageSearcher } from '@/lib/qie/image_search';
import { db } from '@/lib/qie/db';
import { EventCategory } from '@/types';
import { generateNewsImage } from '@/lib/image-gen';
import { scrapeArticleContent } from '@/lib/qie/scraper';

// Prevent vercel time out
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET() {
    console.log('Cron Job Started: fetching news...');

    const monitor = new NewsMonitor();
    const synthesizer = new GeminiSynthesizer();
    // const imageSearcher = new GoogleImageSearcher(); // Unused

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

        // 3. Process the batch (Top 5 new items)
        // User requested 5-7 items. 5 is safe for 60s timeout.
        const newSignals = [];
        const batch = newItems.slice(0, 5);

        for (const item of batch) {
            // Already checked deduplication above
            // Proceed directly to synthesis

            // 3. Scrape Full Content
            console.log(`Scraping full content for: ${item.headline}...`);
            const scrapedData = await scrapeArticleContent(item.url);
            const fullText = scrapedData.content;
            const contextToAnalyze = fullText.length > 200 ? fullText : (item.contentSnippet || item.headline);

            // 4. Synthesize with Gemini (NO CATEGORIZATION - we use RSS feed category)
            console.log(`Synthesizing with ${(fullText.length > 200 ? 'FULL TEXT' : 'SNIPPET')}...`);
            const aiResult = await synthesizer.rewriteStory(item.headline, contextToAnalyze);

            // 3b. Image Handling
            // Priority: AI Generated (clean, no text) > Scraped (often has text that conflicts)
            // Implementation: multi-model rotation with STRICT availability & content check
            let finalImageUrl = '';
            let attempts = 0;
            const maxAttempts = 4; // Increased attempts to find a working model

            while (attempts < maxAttempts) {
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
                    // 3. Must be > 15KB (Error images are usually small optimized SVGs/PNGs ~5-10KB)
                    //    Real 1024x1024 AI images are typically > 100KB
                    const isValidImage = check.ok &&
                        contentType.startsWith('image/') &&
                        size > 15000;

                    if (isValidImage) {
                        finalImageUrl = candidateUrl;
                        console.log(`Image verified: ${size} bytes, Type: ${contentType}`);
                        break;
                    }

                    console.warn(`Image generation attempt ${attempts + 1} rejected: Status=${check.status}, Size=${size}b, Type=${contentType}`);
                } catch (err) {
                    console.warn(`Image generation attempt ${attempts + 1} error:`, err);
                }
                attempts++;
            }

            // Fallback if all AI attempts fail
            if (!finalImageUrl) {
                console.warn('All AI image generation attempts failed/limited. Using Safe Fallback.');
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
                fullReport: aiResult.fullReport
            };
            await db.addSignal(signal);
            newSignals.push(signal);
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
