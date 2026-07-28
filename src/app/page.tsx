import { db } from '@/lib/qie/db';
import { LandingPage } from '@/components/LandingPage';
import { serialize } from '@/lib/utils';
import { Suspense } from 'react';
import { RawFeedSection, SidebarSection } from '@/components/HomeStreaming';
import { SignalCardSkeleton, SidebarSkeleton } from '@/components/Skeletons';

// Instant Live Updates: Set revalidate to 0 so new news signals appear immediately when fetched
export const revalidate = 0;
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function Home() {
  // Fetch only Hero data (Trending) for fast LCP
  const trendingData = await db.getSignals(undefined, 3);
  
  if (!trendingData || trendingData.length === 0) {
      console.warn('CRITICAL: trendingData is empty');
  }

  const mainStory = trendingData[0];
  const gridStories = trendingData.slice(1, 3);
  
  // Note: mainStory.event is already included if using the updated db.ts logic
  const mainStoryEvent = mainStory ? (mainStory as any).event : undefined;

  return (
    <LandingPage
      mainStory={serialize(mainStory as any)}
      mainStoryEvent={serialize(mainStoryEvent as any)}
      gridStories={serialize(gridStories as any)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <Suspense fallback={
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <SignalCardSkeleton />
            <SignalCardSkeleton />
            <SignalCardSkeleton />
            <SignalCardSkeleton />
          </div>
        }>
          <RawFeedSection />
        </Suspense>

        <Suspense fallback={<SidebarSkeleton />}>
          <SidebarSection />
        </Suspense>
      </div>
    </LandingPage>
  );
}
