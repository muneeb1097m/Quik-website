
import { db } from '@/lib/qie/db';
import { LandingPage } from '@/components/LandingPage';
import { NewsEvent, Signal } from '@/types';

// Helper to serialize Prisma objects to match strict JSON/Client component requirements
const serialize = (data: any): any => {
  if (data === undefined || data === null) return null;
  return JSON.parse(JSON.stringify(data));
};

// Enable ISR (Incremental Static Regeneration)
// Revalidate page every 10 seconds for better performance
export const revalidate = 10;

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
  const serializedSignals = serialize(validSignals).slice(0, 20);
  const serializedEvents = serialize(allEvents);

  // 4. Render Client Component with Serialized Data
  return (
    <LandingPage
      signals={serializedSignals}
      events={serializedEvents}
      mainStory={serialize(mainStory)}
      mainStoryEvent={serialize(mainStoryEvent)}
      gridStories={serialize(gridStories)}
      sideStories={serialize(sideStories)}
    />
  );
}
