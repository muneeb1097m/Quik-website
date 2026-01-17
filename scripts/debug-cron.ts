import * as dotenv from 'dotenv';
dotenv.config();

import { NewsMonitor } from '@/lib/qie/monitor';
import { GeminiSynthesizer } from '@/lib/qie/gemini';
import { db } from '@/lib/qie/db';
import { EventCategory } from '@/types';

// Mock types if needed, or rely on tsx interpreting @ alias via tsconfig
// To ensure it works, we should check/ensure tsconfig.json has paths configured (standard in Next.js)

async function runDebug() {
    console.log('DEBUG: Starting Cron Logic...');
    const start = Date.now();

    try {
        const monitor = new NewsMonitor();
        const synthesizer = new GeminiSynthesizer();

        // 1. Fetch RSS
        console.log('DEBUG: Fetching RSS...');
        const rawItems = await monitor.fetchLatestNews();
        console.log(`DEBUG: Fetched ${rawItems.length} items.`);

        if (rawItems.length === 0) {
            console.error('DEBUG: No items fetched. Check RSS URLs or Network.');
            return;
        }

        // 2. Process Subset (First 1 only for debugging speed)
        const batch = rawItems.slice(0, 1);

        for (const item of batch) {
            console.log(`DEBUG: Processing item: ${item.headline}`);
            console.log(`DEBUG: Source URL: ${item.url}`);

            // DB Check
            const allEvents = await db.getEvents();
            const exists = allEvents.find(e => e.sources.some(s => s.url === item.url));
            if (exists) {
                console.log('DEBUG: Duplicate found, skipping.');
                continue;
            }

            // Synthesize
            console.log('DEBUG: Synthesizing...');
            const aiResult = await synthesizer.rewriteStory(item.headline, item.contentSnippet || '');
            console.log('DEBUG: AI Result:', aiResult);

            // Save
            const eventId = `evt_${Date.now()}_debug`;
            console.log('DEBUG: Saving to DB...');
            await db.addEvent({
                id: eventId,
                title: aiResult.headline,
                category: aiResult.category as EventCategory,
                status: 'Live',
                detectedAt: new Date().toISOString(),
                confidenceScore: 0.9,
                sources: [{
                    name: item.source,
                    url: item.url,
                    reliabilityScore: 1,
                    type: 'Media'
                }],
                imageUrl: item.imageUrl
            });
            console.log('DEBUG: Saved Event.');

            await db.addSignal({
                id: `sig_${eventId}`,
                eventId: eventId,
                headline: aiResult.headline,
                summary: aiResult.summary,
                generatedAt: new Date().toISOString(),
                imageUrl: item.imageUrl
            });
            console.log('DEBUG: Saved Signal.');
        }

    } catch (error) {
        console.error('DEBUG CRITICAL FAILURE:', error);
    } finally {
        console.log(`DEBUG: Finished in ${(Date.now() - start) / 1000}s`);
    }
}

runDebug();
