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
  
  // LOGGING: This will show up in Vercel logs
  console.log('--- HOME PAGE DATA DEBUG ---');
  console.log('Object Keys:', Object.keys(data));
  console.log('Trending Count:', data.trending?.length || 0);
  console.log('Signals Count:', data.signals?.length || 0);
  
  const rawTrending = data.trending || [];
  const rawSignals = data.signals || [];
  const allEvents = data.events || [];

  // Derive view data with fallback for thin feeds
  const combinedSignals = [...rawTrending];
  const seenIds = new Set(combinedSignals.map(s => s.id));
  
  for (const s of rawSignals) {
    if (!seenIds.has(s.id)) {
      combinedSignals.push(s);
      seenIds.add(s.id);
    }
    if (combinedSignals.length >= 20) break;
  }

  // Handle completely empty state
  if (combinedSignals.length === 0) {
      console.warn('CRITICAL: combinedSignals is empty');
  }

  const mainStory = combinedSignals[0];
  const gridStories = combinedSignals.slice(1, 3);
  const sideStories = combinedSignals.slice(3, 7);
  const mainStoryEvent = mainStory ? (mainStory as any).event : undefined;

  const serializedSignals = serialize(rawSignals as any).slice(0, 20);
  const serializedEvents = serialize(allEvents as any);

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
