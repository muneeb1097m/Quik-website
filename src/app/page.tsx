import { db, supabase } from '@/lib/qie/db';
import { LandingPage } from '@/components/LandingPage';
import { NewsEvent, Signal } from '@/types';
import { serialize } from '@/lib/utils';

export const runtime = 'edge';

// Force dynamic to bypass any build-time state capture
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function Home() {
  const data = await db.getHomePageData();
  
  const trendingSignals = data.trending || [];
  const allSignalsFromDb = data.signals || [];

  // Derive view data with fallback for thin feeds
  // Combine them to ensure we have enough to fill the page
  const combinedSignals = [...trendingSignals];
  const seenIds = new Set(combinedSignals.map(s => s.id));
  
  for (const s of allSignalsFromDb) {
    if (!seenIds.has(s.id)) {
      combinedSignals.push(s);
      seenIds.add(s.id);
    }
    if (combinedSignals.length >= 20) break;
  }

  // Handle completely empty state
  if (combinedSignals.length === 0) {
      console.warn('CRITICAL: combinedSignals is empty (No news found in DB)');
  }

  const mainStory = combinedSignals[0];
  const gridStories = combinedSignals.slice(1, 3);
  const sideStories = combinedSignals.slice(3, 7);
  // Important: Extract the event from the main signal if it exists
  const mainStoryEvent = mainStory ? (mainStory as any).event : undefined;

  const serializedSignals = serialize(allSignalsFromDb as any).slice(0, 20);
  const serializedEvents = serialize(data.events as any);

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
