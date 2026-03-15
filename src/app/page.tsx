import { db } from '@/lib/qie/db';
import { LandingPage } from '@/components/LandingPage';
import { NewsEvent, Signal } from '@/types';
import { serialize } from '@/lib/utils';

export const runtime = 'edge';

// Performance: Force dynamic at build time to prevent DB pool exhaustion
// We rely on unstable_cache in db.ts for performance instead of full page ISR
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function Home() {
  // Optimized: Single database call instead of 3 separate queries
  // This significantly reduces TTFB by minimizing database round trips
  const { trending: rawTrending = [], signals: rawSignals = [], events: allEvents = [] } = await db.getHomePageData();

  const validTrending = rawTrending;
  const validSignals = rawSignals;

  // 2. Derive view data with fallback for thin feeds
  // If trending is thin (e.g. only 1 item), we pull from generic signals to fill the grid/side sections
  const combinedSignals = [...rawTrending];
  const seenIds = new Set(combinedSignals.map(s => s.id));
  
  for (const s of rawSignals) {
    if (!seenIds.has(s.id)) {
      combinedSignals.push(s);
      seenIds.add(s.id);
    }
    if (combinedSignals.length >= 10) break;
  }

  const mainStory = combinedSignals[0];
  const gridStories = combinedSignals.slice(1, 3);
  const sideStories = combinedSignals.slice(3, 7);
  const mainStoryEvent = mainStory ? (mainStory as any).event : undefined;

  // 3. Serialize Data
  const serializedSignals = serialize(rawSignals as any).slice(0, 20);
  const serializedEvents = serialize(allEvents as any);

  // 4. Render Client Component
  return (
    <LandingPage
      signals={serializedSignals}
      events={serializedEvents}
      mainStory={serialize(mainStory as any)}
      mainStoryEvent={serialize(mainStoryEvent as any)}
      gridStories={serialize(gridStories as any)}
      sideStories={serialize(sideStories as any)}
    />
  );
}
