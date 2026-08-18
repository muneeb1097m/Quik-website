import { Signal, NewsEvent, IndexAuditCategory } from '@/types';
import { getNewsUrl, slugify } from '@/lib/utils';
import { getBaseUrl } from '@/lib/seo';

export interface AuditRecord {
    id: string;
    url: string;
    headline: string;
    category: string;
    generatedAt: string;
    classification: IndexAuditCategory;
    reason: string;
    remediationAction: string;
}

export function classifyArticleIndexStatus(signal: Signal, event?: NewsEvent): AuditRecord {
    const baseUrl = getBaseUrl();
    const canonicalPath = getNewsUrl(signal);
    const canonicalUrl = `${baseUrl}${canonicalPath}`;
    const headline = signal.headline || '';
    const summary = signal.summary || '';
    const fullReport = signal.fullReport || '';

    // 1. Check for 4xx/Deleted
    if (!signal.id || (!headline && !fullReport)) {
        return {
            id: signal.id || 'unknown',
            url: canonicalUrl,
            headline: headline || 'No Headline',
            category: event?.category || 'News',
            generatedAt: new Date(signal.generatedAt || Date.now()).toISOString(),
            classification: 'H_DEAD_4XX',
            reason: 'Missing critical headline or content body.',
            remediationAction: 'Return explicit HTTP 404/410 and purge from XML sitemaps.'
        };
    }

    // 2. Check for Duplicate / Near-Duplicate
    if (headline.length < 15) {
        return {
            id: signal.id,
            url: canonicalUrl,
            headline,
            category: event?.category || 'News',
            generatedAt: new Date(signal.generatedAt || Date.now()).toISOString(),
            classification: 'D_DUPLICATE_CLUSTER',
            reason: 'Very short or repetitive headline likely part of duplicate cluster.',
            remediationAction: 'Consolidate into primary event cluster and set canonical.'
        };
    }

    // 3. Check for Content Quality / Thin Content
    if (!fullReport || (fullReport.length < 150 && !summary)) {
        return {
            id: signal.id,
            url: canonicalUrl,
            headline,
            category: event?.category || 'News',
            generatedAt: new Date(signal.generatedAt || Date.now()).toISOString(),
            classification: 'B_NEEDS_IMPROVEMENT',
            reason: 'Thin content: lacking structured developments, context, or lead summary.',
            remediationAction: 'Re-run through Synthesis & Context Enrichment pipeline before indexing.'
        };
    }

    // 4. Check for Canonical Conflicts / Slug Format
    const currentSlug = slugify(headline);
    if (!currentSlug) {
        return {
            id: signal.id,
            url: canonicalUrl,
            headline,
            category: event?.category || 'News',
            generatedAt: new Date(signal.generatedAt || Date.now()).toISOString(),
            classification: 'E_CANONICAL_CONFLICT',
            reason: 'Malformed slug character set.',
            remediationAction: 'Generate standardized clean slug and enforce 301 redirect.'
        };
    }

    // 5. Eligible High-Quality Indexable Article
    return {
        id: signal.id,
        url: canonicalUrl,
        headline,
        category: event?.category || 'News',
        generatedAt: new Date(signal.generatedAt || Date.now()).toISOString(),
        classification: 'A_SHOULD_INDEX',
        reason: 'Healthy structured report with valid metadata, canonical, and primary attribution.',
        remediationAction: 'Ensure presence in XML sitemap, Google News sitemap, and topic hubs.'
    };
}
