import { db } from '@/lib/qie/db';
import { notFound, redirect, RedirectType } from 'next/navigation';
import NewsDetailView from '@/components/NewsDetailView';
import { serialize, extractSignalIdFromParam, formatMetaTitle, formatMetaDescription, getNewsUrl, generateFaqSchema } from '@/lib/utils';

import type { Metadata } from 'next';

// Performance: Enable ISR with 1-year revalidation (static content)
export const revalidate = 31536000;

// Generate Metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const signalId = extractSignalIdFromParam(id);
    const signal = await db.getSignal(signalId);

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

    const metaTitle = formatMetaTitle(signal.headline, ' | Quik', 55);
    const metaDescription = formatMetaDescription(signal.summary, 155);
    const canonicalUrl = `https://quiknews.online${getNewsUrl(signal)}`;

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
                    url: signal.imageUrl || 'https://quiknews.online/og-default.png',
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
            images: [signal.imageUrl || ''],
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

    // 2. Fetch Data from DB (Server-side)
    const signal = await db.getSignal(signalId);

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
    const event = signal.event || { category: 'News' };

    // Fetch related stories
    const related = await db.getSignals(event.category, 4);
    const filteredRelated = related.filter((s: any) => s.id !== signal.id).slice(0, 3);

    // JSON-LD Structured Data for Google News (NewsArticle Schema)
    const canonicalUrl = `https://quiknews.online${canonicalPath}`;
    const newsArticleJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: signal.headline,
        description: formatMetaDescription(signal.summary, 155),
        image: signal.imageUrl || 'https://quiknews.online/og-default.png',
        datePublished: new Date(signal.generatedAt).toISOString(),
        dateModified: new Date(signal.generatedAt).toISOString(),
        author: {
            '@type': 'Organization',
            name: 'Quik AI',
            url: 'https://quiknews.online',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Quik',
            url: 'https://quiknews.online',
            logo: {
                '@type': 'ImageObject',
                url: 'https://quiknews.online/logo.png',
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl,
        },
        articleSection: event.category,
        keywords: [event.category, 'AI News', 'Technology', 'Breaking News'].join(', '),
    };

    // JSON-LD BreadcrumbList Schema for Google Search Console
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://quiknews.online',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: event.category || 'News',
                item: `https://quiknews.online/${(event.category || 'news').toLowerCase()}`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: signal.headline,
                item: canonicalUrl,
            },
        ],
    };

    // JSON-LD FAQ Schema for Google Rich Results
    const faqJsonLd = generateFaqSchema(signal, event);

    return (
        <>
            {/* NewsArticle Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
            />
            {/* BreadcrumbList Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {/* FAQPage Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <NewsDetailView
                signal={serialize(signal)}
                event={serialize(event)}
                related={serialize(filteredRelated)}
            />
        </>
    );
}

