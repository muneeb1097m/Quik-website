import { db } from '@/lib/qie/db';
import { LandingPage } from '@/components/LandingPage';
import { NewsEvent, Signal } from '@/types';
import { serialize } from '@/lib/utils';

// Enable ISR (Incremental Static Regeneration)
// Revalidate page every 1 hour (3600s) to reduce ISR writes
// Revalidate page every 3600 seconds (1 hour)
export const revalidate = 3600;

import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function Home() {
  // Optimized: Single database call instead of 3 separate queries
  // This significantly reduces TTFB by minimizing database round trips
  const { trending: rawTrending, signals: rawSignals, events: allEvents } = await db.getHomePageData();

  const validTrending = rawTrending;
  const validSignals = rawSignals;

  // 2. Derive view data
  const mainStory = validTrending[0];
  const gridStories = validTrending.slice(1, 3); // 2 items
  const sideStories = validTrending.slice(3, 7); // Max 4 side stories

  const mainStoryEvent = mainStory ? mainStory.event : undefined;

  // 3. Serialize Data (Fixes "Date object" error)
  // We must serialize because Prisma returns Date objects, which cannot be passed directly to Client Components
  // Casting to any to bypass strict type definition of full DB objects vs selected partials
  const serializedSignals = serialize(validSignals as any).slice(0, 20);
  const serializedEvents = serialize(allEvents as any);

  // 4. Render Client Component with Serialized Data
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
