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

        // 3. Process the batch (Top 15 new items)
        // With an external cron running every 3 mins, this will populate all categories faster.
        // 15 items ensures good category distribution across Pakistan, Sports, AI, Auto, etc.
        const newSignals = [];
        const batch = newItems.slice(0, 15);

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
            // Priority: Real Image (Scraped/RSS) > AI (to avoid rate limits & "non-AI" look)
            let finalImageUrl = scrapedData.imageUrl || item.imageUrl;

            if (!finalImageUrl) {
                console.log('No real image found, generating fallback AI image...');
                finalImageUrl = generateNewsImage(aiResult.headline, item.category || 'Technology');
            } else {
                console.log('Using Real Image:', finalImageUrl);
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
