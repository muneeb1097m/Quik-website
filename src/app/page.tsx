
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
  // Fetch more initially to allow for filtering of items without images
  const rawTrending = await db.getTrending(20);
  const rawSignals = await db.getSignals();
  const allEvents = await db.getEvents();

  // Filter: Strictly "Only add the news on the main page which has the image"
  const validTrending = rawTrending.filter(s => !!s.imageUrl);
  const validSignals = rawSignals.filter(s => !!s.imageUrl);

  // 2. Derive view data
  const mainStory = validTrending[0];
  const gridStories = validTrending.slice(1, 3); // 2 items
  const sideStories = validTrending.slice(3, 7); // Max 4 side stories

  const mainStoryEvent = mainStory ? await db.getEvent(mainStory.eventId) : undefined;

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
