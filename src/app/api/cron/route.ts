import { NextResponse } from 'next/server';
import { NewsMonitor } from '@/lib/qie/monitor';
import { GeminiSynthesizer } from '@/lib/qie/gemini';
import { GoogleImageSearcher } from '@/lib/qie/image_search';
import { db } from '@/lib/qie/db';
import { EventCategory } from '@/types';
import { generateNewsImage } from '@/lib/image-gen';

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
        // With an external cron running every 3 mins, this will quickly clear any backlog.
        // No need to shuffle; we prioritize the freshest or most relevant news.
        const newSignals = [];
        const batch = newItems.slice(0, 5);

        for (const item of batch) {
            // Already checked deduplication above
            // Proceed directly to synthesis

            // 3. Synthesize with Gemini
            console.log(`Synthesizing: ${item.headline}...`);
            const aiResult = await synthesizer.rewriteStory(item.headline, item.contentSnippet || '');

            // 3b. Image Handling
            // Priority: ALWAYS use AI Generated (Pollinations/Flux) as per user request
            console.log('Generating AI image...');
            const finalImageUrl = generateNewsImage(aiResult.headline, aiResult.category);

            // 4. Save to DB
            const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

            // Add Event
            await db.addEvent({
                id: eventId,
                title: aiResult.headline,
                category: aiResult.category as EventCategory, // "Technology" | "Business" etc
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
