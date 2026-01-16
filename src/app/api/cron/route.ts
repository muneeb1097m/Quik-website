import { NextResponse } from 'next/server';
import { NewsMonitor } from '@/lib/qie/monitor';
import { GeminiSynthesizer } from '@/lib/qie/gemini';
import { GoogleImageSearcher } from '@/lib/qie/image_search';
import { db } from '@/lib/qie/db';
import { EventCategory } from '@/types';

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

        // 2. Process a subset (first 3 for demo speed)
        const newSignals = [];
        let imageSearchCount = 0;
        const MAX_IMAGE_SEARCHES = 1; // Strict safety limit for free tier (100/day)

        // Take top 3 recent items
        const batch = rawItems.slice(0, 3);

        for (const item of batch) {
            // Check deduplication (basic check by url)
            const allEvents = await db.getEvents();
            const exists = allEvents.find(e => e.sources.some(s => s.url === item.url));
            if (exists) {
                console.log('Skipping duplicate:', item.headline);
                continue;
            }

            // 3. Synthesize with Gemini
            console.log(`Synthesizing: ${item.headline}...`);
            const aiResult = await synthesizer.rewriteStory(item.headline, item.contentSnippet || '');

            // 3b. Image Fallback
            let finalImageUrl = item.imageUrl;
            if (!finalImageUrl) {
                if (imageSearchCount < MAX_IMAGE_SEARCHES) {
                    console.log('No RSS image. Attempting fallback search...');
                    const visualKeyword = await synthesizer.extractVisualKeyword(item.headline);
                    finalImageUrl = await imageSearcher.search(visualKeyword);
                    if (finalImageUrl) imageSearchCount++;
                } else {
                    console.log('Skipping image search to conserve API quota.');
                }
            }

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
                imageUrl: finalImageUrl
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
