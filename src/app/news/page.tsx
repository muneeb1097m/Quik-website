import { db } from '@/lib/qie/db';
import { SignalCard } from '@/components/SignalCard';
import { NewsEvent } from '@/types';
import type { Metadata } from 'next';
import Link from 'next/link';

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
    const params = await searchParams;
    const pageNum = parseInt(params.page || '1');
    const pageStr = pageNum > 1 ? ` - Page ${pageNum}` : '';
    const canonicalUrl = pageNum > 1 ? `https://www.quiknews.online/news?page=${pageNum}` : 'https://www.quiknews.online/news';
    const description = 'Browse the latest real-time global news headlines, breaking intelligence signals, and AI-synthesized analysis across technology, business, and global events.';

    return {
        title: `Latest News & Signals${pageStr} | Quik`,
        description,
        openGraph: {
            title: `Latest News & Signals${pageStr} | Quik`,
            description,
            url: canonicalUrl,
            type: 'website',
            images: [
                {
                    url: 'https://www.quiknews.online/og-default.png',
                    width: 1200,
                    height: 630,
                    alt: 'Quik News - Latest News & Signals',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `Latest News & Signals${pageStr} | Quik`,
            description,
            images: ['https://www.quiknews.online/og-default.png'],
        },
        alternates: {
            canonical: canonicalUrl,
        },
    };
}

export default async function NewsIndexPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const limit = 36;
    const skip = (page - 1) * limit;

    const signals = await db.getSignals(undefined, limit, skip);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed top-[-10%] left-[-10%] w-[800px] h-[800px] bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed top-[20%] right-[-10%] w-[600px] h-[600px] bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />

            <main className="max-w-[1400px] mx-auto px-6 pt-40 pb-20 relative z-10">
                <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                    Latest News &amp; Real-Time Signals
                </h1>
                <p className="text-slate-500 mb-8 text-lg">
                    Real-time global news intelligence, synthesized by AI.{page > 1 ? ` Showing page ${page}.` : ''}
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {signals.map((signal: any) => {
                        const event = signal.event as unknown as NewsEvent;
                        if (!event) return null;
                        return <SignalCard key={signal.id} signal={signal as any} event={event} />;
                    })}
                    {signals.length === 0 && (
                        <p className="text-slate-500 col-span-full">No news signals available at the moment.</p>
                    )}
                </div>

                {/* Server-rendered pagination links for crawlers and internal link authority */}
                <div className="mt-16 flex items-center justify-center gap-4">
                    {page > 1 && (
                        <Link
                            href={page === 2 ? '/news' : `/news?page=${page - 1}`}
                            className="px-6 py-3 bg-white border border-slate-200 rounded-full font-bold text-slate-900 shadow-sm hover:shadow-md transition-all"
                        >
                            ← Previous Page
                        </Link>
                    )}
                    {signals.length === limit && (
                        <Link
                            href={`/news?page=${page + 1}`}
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
