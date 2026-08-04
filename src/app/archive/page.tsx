import { db } from '@/lib/qie/db';
import { SignalCard } from '@/components/SignalCard';
import { NewsEvent, Signal } from '@/types';
import { serialize } from '@/lib/utils';
import Link from 'next/link';

import type { Metadata } from 'next';

export const revalidate = 43200; // Revalidate every 12 hours

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
    const params = await searchParams;
    const page = params.page ? ` - Page ${params.page}` : '';
    const pageNum = parseInt(params.page || '1');
    const canonicalUrl = pageNum > 1 ? `https://quiknews.online/archive?page=${pageNum}` : 'https://quiknews.online/archive';

    return {
        title: `News Archive${page} | Quik`,
        description: 'Browse the complete history of AI-generated global news coverage on Quik.',
        openGraph: {
            title: `News Archive${page} | Quik`,
            description: 'Browse the complete history of AI-generated global news coverage on Quik.',
            url: canonicalUrl,
        },
        alternates: {
            canonical: canonicalUrl,
        },
    };
}

export default async function ArchivePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const limit = 40; // Load 40 signals per page
    const skip = (page - 1) * limit;

    // We fetch a bit more (e.g. 500 total) to allow broad crawling
    const signals = await db.getSignals(undefined, limit, skip);
    const serializedSignals = serialize(signals);

    // Fetch related events for the signals. Prisma includes events in `getSignals` if configured right,
    // assuming it returns an array where each signal has an attached `event`.
    // In our `LandingPage.tsx` we saw it accesses `signal.event` directly.

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20">
            <main className="max-w-[1600px] mx-auto px-4 md:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                        News Archive
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl">
                        Browse our complete history of AI-generated global news coverage.
                        Page {page}.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {serializedSignals.map((signal: any) => {
                        const event = signal.event || {
                            id: signal.eventId || 'unknown',
                            title: 'News',
                            category: 'Trending',
                            status: 'Live',
                            detectedAt: new Date(),
                            lastUpdatedAt: new Date(),
                            confidenceScore: 0,
                            sources: []
                        };
                        return (
                            <div key={signal.id}>
                                <SignalCard signal={signal} event={event} />
                            </div>
                        );
                    })}
                </div>

                {/* Server- rendered Pagination Links for GoogleBot */}
                <div className="mt-16 flex items-center justify-center gap-4">
                    {page > 1 && (
                        <Link
                            href={`/archive?page=${page - 1}`}
                            className="px-6 py-3 bg-white border border-slate-200 rounded-full font-bold text-slate-900 shadow-sm hover:shadow-md transition-all"
                        >
                            ← Previous Page
                        </Link>
                    )}
                    {signals.length === limit && (
                        <Link
                            href={`/archive?page=${page + 1}`}
                            className="px-6 py-3 bg-white border border-slate-200 rounded-full font-bold text-slate-900 shadow-sm hover:shadow-md transition-all"
                        >
                            Next Page →
                        </Link>
                    )}
                </div>
            </main>
        </div>
    );
}
