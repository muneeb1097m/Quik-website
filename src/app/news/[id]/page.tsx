import { cache } from 'react';
import { db } from '@/lib/qie/db';
import { notFound, redirect, RedirectType } from 'next/navigation';
import NewsDetailView from '@/components/NewsDetailView';
import { serialize, extractSignalIdFromParam, formatMetaTitle, formatMetaDescription, getNewsUrl } from '@/lib/utils';
import { generateNewsArticleSchema, generateBreadcrumbSchema, getBaseUrl } from '@/lib/seo';
import { DEFAULT_AUTHOR } from '@/lib/authors';

import type { Metadata } from 'next';

// Performance: Enable ISR with 1-year revalidation (static content)
export const revalidate = 31536000;
export const dynamicParams = true;

// React per-request cache to deduplicate DB lookups between generateMetadata and NewsDetailPage
const getCachedSignal = cache(async (signalId: string) => {
    return await db.getSignal(signalId);
});

// React per-request cache for related stories
const getCachedRelated = cache(async (category: string, currentSignalId: string) => {
    const related = await db.getSignals(category, 6);
    return related.filter((s: any) => s.id !== currentSignalId).slice(0, 4);
});

// Pre-render top recent news articles at build time to serve from CDN (0 server load)
export async function generateStaticParams() {
    try {
        const recentSignals = await db.getSignals(undefined, 30);
        return recentSignals.map((signal: any) => {
            const canonicalPath = getNewsUrl(signal);
            const slug = canonicalPath.replace('/news/', '');
            return { id: slug };
        });
    } catch (e) {
        console.error('generateStaticParams error in /news/[id]:', e);
        return [];
    }
}

// Generate Metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const signalId = extractSignalIdFromParam(id);
    const signal = await getCachedSignal(signalId);

    if (!signal) {
        return {
            title: 'News Not Found | Quik',
            description: 'The requested news article could not be found.',
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    const baseUrl = getBaseUrl();
    const metaTitle = formatMetaTitle(signal.headline, ' | Quik', 55);
    const metaDescription = formatMetaDescription(signal.summary || signal.fullReport || signal.headline, 155);
    const canonicalUrl = `${baseUrl}${getNewsUrl(signal)}`;

    return {
        title: metaTitle,
        description: metaDescription,
        openGraph: {
            title: metaTitle,
            description: metaDescription,
            type: 'article',
            url: canonicalUrl,
            publishedTime: new Date(signal.generatedAt).toISOString(),
            images: [
                {
                    url: signal.imageUrl || `${baseUrl}/og-default.png`,
                    width: 1200,
                    height: 630,
                    alt: signal.headline,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: metaTitle,
            description: metaDescription,
            images: [signal.imageUrl || `${baseUrl}/og-default.png`],
        },
        alternates: {
            canonical: canonicalUrl,
        },
    };
}

// Server Component (Async)
export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // 1. Unwrap Params & Extract Signal ID
    const { id } = await params;
    const signalId = extractSignalIdFromParam(id);

    // 2. Fetch Data from DB (Deduplicated via React cache)
    const signal = await getCachedSignal(signalId);

    if (!signal) {
        notFound();
    }

    // 3. Ensure Canonical Slug Redirect (301 Permanent Redirect for non-canonical URLs)
    const canonicalPath = getNewsUrl(signal);
    const canonicalSlug = canonicalPath.replace('/news/', '');
    if (id !== canonicalSlug) {
        redirect(canonicalPath, RedirectType.replace);
    }

    // Event is included in signal fetch
    const rawEvent: any = signal.event;
    const event: any = (Array.isArray(rawEvent) ? rawEvent[0] : rawEvent) || { category: 'Technology', lastUpdatedAt: signal.generatedAt, sources: [] };
    const author = DEFAULT_AUTHOR;

    // Fetch related stories (Cached)
    const filteredRelated = await getCachedRelated(event?.category || 'Technology', signal.id);

    // JSON-LD Structured Data (NewsArticle & BreadcrumbList)
    const newsArticleJsonLd = generateNewsArticleSchema(signal as any, event as any, author);
    const breadcrumbJsonLd = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: event?.category || 'News', url: `/${(event?.category || 'news').toLowerCase()}` },
        { name: signal.headline, url: canonicalPath },
    ]);

    return (
        <>
            {/* NewsArticle Structured Data (schema.org/NewsArticle) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
            />
            {/* BreadcrumbList Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <NewsDetailView
                signal={serialize(signal)}
                event={serialize(event)}
                author={serialize(author)}
                related={serialize(filteredRelated)}
            />
        </>
    );
}
