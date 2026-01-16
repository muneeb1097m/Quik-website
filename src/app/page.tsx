
import { db } from '@/lib/qie/db';
import { LandingPage } from '@/components/LandingPage';
import { NewsEvent, Signal } from '@/types';

// Helper to serialize Prisma objects to match strict JSON/Client component requirements
const serialize = (data: any): any => {
  return JSON.parse(JSON.stringify(data));
};

export default async function Home() {
  // 1. Fetch all data needed for the landing page
  const trending = await db.getTrending(7);
  const allSignals = await db.getSignals();
  const allEvents = await db.getEvents();

  // 2. Derive view data
  const mainStory = trending[0];
  const gridStories = trending.slice(1, 4); // 3 items
  const sideStories = trending.slice(4);

  const mainStoryEvent = mainStory ? await db.getEvent(mainStory.eventId) : undefined;

  // 3. Render Client Component with Serialized Data
  // We must serialize because Prisma returns Date objects, which cannot be passed directly to Client Components
  return (
    <LandingPage
      signals={serialize(allSignals)}
      events={serialize(allEvents)}
      mainStory={serialize(mainStory)}
      mainStoryEvent={serialize(mainStoryEvent)}
      gridStories={serialize(gridStories)}
      sideStories={serialize(sideStories)}
    />
  );
}
