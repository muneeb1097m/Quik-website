import { db } from '@/lib/qie/db';
import { notFound } from 'next/navigation';
import NewsDetailView from '@/components/NewsDetailView';
import { serialize } from '@/lib/utils';

import type { Metadata } from 'next';

// Generate Metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const signal = await db.getSignal(decodedId);

    if (!signal) {
        return {
            title: 'News Not Found | Quik',
            description: 'The requested news article could not be found.',
        };
    }

    return {
        title: signal.headline,
        description: signal.summary.slice(0, 160), // SEO friendly truncated description
        openGraph: {
            title: signal.headline,
            description: signal.summary,
            type: 'article',
            publishedTime: signal.generatedAt.toISOString(),
            images: [
                {
                    url: signal.imageUrl || 'https://quik.news/og-default.png', // Fallback image needed
                    width: 1200,
                    height: 630,
                    alt: signal.headline,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: signal.headline,
            description: signal.summary.slice(0, 200),
            images: [signal.imageUrl || ''],
        },
    };
}

// Server Component (Async)
export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // 1. Unwrap Params
    const { id } = await params;
    const decodedId = decodeURIComponent(id);

    // 2. Fetch Data from DB (Server-side)
    const signal = await db.getSignal(decodedId);

    if (!signal) {
        notFound();
    }

    // Event is now included in signal fetch
    const event = signal.event;

    // Fetch related stories
    const related = await db.getSignals(event.category, 4);
    // Filter out current and limit (simple client-side filter logic for now, DB query ideal later)
    const filteredRelated = related.filter(s => s.id !== signal.id).slice(0, 3);

    // 3. Render Client Component with Data
    return (
        <NewsDetailView
            signal={serialize(signal)}
            event={serialize(event)}
            related={serialize(filteredRelated)}
        />
    );
}
