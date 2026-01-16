
import { db } from '@/lib/qie/db';
import { LandingPage } from '@/components/LandingPage';
import { NewsEvent, Signal } from '@/types';

// Helper to serialize Prisma objects to match strict JSON/Client component requirements
const serialize = (data: any): any => {
  if (data === undefined || data === null) return null;
  return JSON.parse(JSON.stringify(data));
};

export default async function Home() {
  // 1. Fetch all data needed for the landing page
  const trending = await db.getTrending(7);
  const allSignals = await db.getSignals();
  const allEvents = await db.getEvents();

  // 2. Derive view data
  const mainStory = trending[0];
  const gridStories = trending.slice(1, 3); // 2 items
  const sideStories = trending.slice(3);

  const mainStoryEvent = mainStory ? await db.getEvent(mainStory.eventId) : undefined;

  // 3. Serialize Data (Fixes "Date object" error)
  // We must serialize because Prisma returns Date objects, which cannot be passed directly to Client Components
  const serializedSignals = serialize(allSignals).slice(0, 20);
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
