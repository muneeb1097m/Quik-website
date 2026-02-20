import { db } from '@/lib/qie/db';
import { notFound } from 'next/navigation';
import NewsDetailView from '@/components/NewsDetailView';
import { serialize } from '@/lib/utils';

import type { Metadata } from 'next';

// Performance: Enable ISR with 1-year revalidation (static content)
export const revalidate = 31536000;

// Performance: Generate static params for top news articles (ISR)
export async function generateStaticParams() {
    const signals = await db.getTrending(50);
    return signals.map((signal: any) => ({
        id: signal.id,
    }));
}

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
                    url: signal.imageUrl || 'https://quiknews.online/og-default.png', // Fallback image needed
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
        alternates: {
            canonical: `/news/${signal.id}`,
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
    const filteredRelated = related.filter((s: any) => s.id !== signal.id).slice(0, 3);

    // JSON-LD Structured Data for Google News
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: signal.headline,
        description: signal.summary,
        image: signal.imageUrl || 'https://quiknews.online/og-default.png',
        datePublished: signal.generatedAt.toISOString(),
        dateModified: signal.generatedAt.toISOString(),
        author: {
            '@type': 'Organization',
            name: 'Quik AI',
            url: 'https://quik.news',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Quik',
            url: 'https://quik.news',
            logo: {
                '@type': 'ImageObject',
                url: 'https://quiknews.online/logo.png',
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://quiknews.online/news/${signal.id}`,
        },
        articleSection: event.category,
        keywords: [event.category, 'AI News', 'Technology', 'Breaking News'].join(', '),
    };

    // 3. Render Client Component with Data
    return (
        <>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <NewsDetailView
                signal={serialize(signal)}
                event={serialize(event)}
                related={serialize(filteredRelated)}
            />
        </>
    );
}
