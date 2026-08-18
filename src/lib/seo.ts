import { Signal, NewsEvent, AuthorProfile, TopicHub, SeoQualityReport } from '@/types';
import { DEFAULT_AUTHOR } from './authors';
import { getAllTopics } from './topics';
import { decodeHtmlEntities, stripHtml, slugify, getNewsUrl } from './utils';

export function getBaseUrl(): string {
    return (process.env.NEXT_PUBLIC_APP_URL || 'https://www.quiknews.online').replace(/\/$/, '');
}

/**
 * Generates Google-compliant NewsArticle Structured Data (schema.org/NewsArticle)
 */
export function generateNewsArticleSchema(
    signal: Signal,
    event?: NewsEvent,
    authorParam?: AuthorProfile
) {
    const baseUrl = getBaseUrl();
    const canonicalPath = getNewsUrl(signal);
    const canonicalUrl = `${baseUrl}${canonicalPath}`;
    const author = authorParam || DEFAULT_AUTHOR;
    const category = event?.category || 'Technology';

    const cleanHeadline = decodeHtmlEntities(stripHtml(signal.headline || ''));
    const cleanSummary = decodeHtmlEntities(stripHtml(signal.summary || signal.fullReport?.slice(0, 160) || cleanHeadline));

    const publishedDate = signal.generatedAt ? new Date(signal.generatedAt).toISOString() : new Date().toISOString();
    const modifiedDate = event?.lastUpdatedAt ? new Date(event.lastUpdatedAt).toISOString() : publishedDate;

    // High quality image object representation
    const defaultImage = `${baseUrl}/og-default.png`;
    const articleImage = signal.imageUrl || defaultImage;

    const authorSchema = author.type === 'Person'
        ? {
            '@type': 'Person',
            name: author.name,
            jobTitle: author.role,
            url: author.socials?.website || `${baseUrl}/author/${author.slug}`,
            sameAs: Object.values(author.socials || {}).filter(Boolean),
        }
        : {
            '@type': 'NewsMediaOrganization',
            name: author.name,
            url: author.socials?.website || `${baseUrl}/author/${author.slug}`,
        };

    return {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: cleanHeadline,
        description: cleanSummary.slice(0, 160),
        image: [
            articleImage
        ],
        datePublished: publishedDate,
        dateModified: modifiedDate,
        author: authorSchema,
        publisher: {
            '@type': 'NewsMediaOrganization',
            name: 'Quik News',
            url: baseUrl,
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/logo.png`,
                width: 600,
                height: 60,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl,
        },
        articleSection: category,
        keywords: [category, 'Breaking News', 'Quik Intelligence', 'Real-Time News'].join(', '),
        isAccessibleForFree: true,
    };
}

/**
 * Generates BreadcrumbList Structured Data
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    const baseUrl = getBaseUrl();
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
        })),
    };
}

/**
 * Generates ProfilePage Structured Data for Author Pages
 */
export function generateAuthorProfileSchema(author: AuthorProfile) {
    const baseUrl = getBaseUrl();
    const authorUrl = `${baseUrl}/author/${author.slug}`;

    return {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
            '@type': author.type === 'Person' ? 'Person' : 'NewsMediaOrganization',
            name: author.name,
            description: author.bio,
            jobTitle: author.role,
            url: authorUrl,
            sameAs: Object.values(author.socials || {}).filter(Boolean),
            knowsAbout: author.areasOfCoverage,
        },
    };
}

/**
 * Generates CollectionPage Structured Data for Topic Pages
 */
export function generateTopicCollectionSchema(topic: TopicHub, articles: any[]) {
    const baseUrl = getBaseUrl();
    const topicUrl = `${baseUrl}/topic/${topic.slug}`;

    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${topic.name} Intelligence & News | Quik`,
        description: topic.description,
        url: topicUrl,
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: articles.slice(0, 10).map((signal, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${baseUrl}${getNewsUrl(signal)}`,
                name: signal.headline,
            })),
        },
    };
}

/**
 * Extracts matched topics and entities from article text
 */
export function extractEntities(text: string): TopicHub[] {
    if (!text) return [];
    const normalized = text.toLowerCase();
    const matchedTopics: TopicHub[] = [];

    for (const topic of getAllTopics()) {
        const hasKeywordMatch = topic.keywords.some(kw => {
            // Match word boundaries to prevent substring collisions
            const regex = new RegExp(`\\b${kw.toLowerCase()}\\b`, 'i');
            return regex.test(normalized);
        });

        if (hasKeywordMatch) {
            matchedTopics.push(topic);
        }
    }

    return matchedTopics.slice(0, 4); // Max 4 relevant topics
}

/**
 * Contextual Entity Linker: Inserts 1-3 natural first-mention links to /topic/[slug]
 */
export function linkFirstMentionEntities(htmlContent: string): string {
    if (!htmlContent) return '';

    let processed = htmlContent;
    let linkCount = 0;
    const maxLinks = 3;
    const linkedSlugs = new Set<string>();

    for (const topic of getAllTopics()) {
        if (linkCount >= maxLinks) break;
        if (linkedSlugs.has(topic.slug)) continue;

        // Find the primary keyword of the topic
        const primaryKeyword = topic.name;
        // Match first case-insensitive occurrence not inside an existing HTML tag or link
        const regex = new RegExp(`(?<!<[^>]*)\\b(${primaryKeyword})\\b(?![^<]*>|[^<>]*<\\/a>)`, 'i');

        if (regex.test(processed)) {
            processed = processed.replace(regex, `<a href="/topic/${topic.slug}" class="text-brand-blue hover:underline font-semibold">$1</a>`);
            linkedSlugs.add(topic.slug);
            linkCount++;
        }
    }

    return processed;
}

/**
 * Comprehensive 100-Point SEO Quality Scoring Engine
 * 
 * Dimensions:
 * - Content Usefulness & Completeness: 25 pts
 * - Original Value / Context: 20 pts
 * - Technical SEO: 15 pts
 * - Source Verification & Attribution: 15 pts
 * - Internal Linking & Entities: 10 pts
 * - Metadata & Structured Data: 10 pts
 * - Image / Media Quality: 5 pts
 * 
 * Word count is strictly NOT a scoring requirement.
 */
export function evaluateSeoQuality(data: {
    headline: string;
    summary?: string;
    fullReport?: string;
    category?: string;
    sources?: Array<{ name: string; url: string }>;
    imageUrl?: string;
}): SeoQualityReport {
    const feedback: string[] = [];
    let contentUsefulness = 0;
    let originalValue = 0;
    let technicalSeo = 0;
    let sourceVerification = 0;
    let internalLinking = 0;
    let structuredData = 0;
    let mediaQuality = 0;

    const headline = data.headline?.trim() || '';
    const summary = data.summary?.trim() || '';
    const fullReport = data.fullReport?.trim() || '';
    const totalText = `${summary} ${fullReport}`;

    // 1. Content Usefulness & Completeness (Max 25 pts)
    if (headline.length >= 25 && headline.length <= 110) {
        contentUsefulness += 10;
    } else {
        feedback.push('Headline length should ideally be between 25 and 110 characters.');
    }

    if (fullReport.includes('###') || fullReport.includes('Key Developments') || fullReport.includes('- ')) {
        contentUsefulness += 10; // Structured key details/developments present
    } else {
        feedback.push('Article lacks structured key details or bullet points.');
    }

    if (summary.length >= 50) {
        contentUsefulness += 5;
    }

    // 2. Original Value & Context (Max 20 pts)
    if (fullReport.includes('Why It Matters') || fullReport.includes('Strategic Impact') || fullReport.includes('Impact')) {
        originalValue += 10;
    } else {
        feedback.push('Missing "Why It Matters" / strategic significance analysis.');
    }

    if (fullReport.includes('Background') || fullReport.includes('Context') || fullReport.includes('Historical')) {
        originalValue += 10;
    } else {
        feedback.push('Missing background or historical context.');
    }

    // 3. Technical SEO (Max 15 pts)
    const slug = slugify(headline);
    if (slug && slug.length >= 5) {
        technicalSeo += 8;
    }
    if (data.category && data.category.length > 0) {
        technicalSeo += 7;
    }

    // 4. Source Verification & Attribution (Max 15 pts)
    if (data.sources && data.sources.length > 0) {
        const validSources = data.sources.filter(s => s.name && s.url && s.url.startsWith('http'));
        if (validSources.length >= 1) {
            sourceVerification += 10;
            if (validSources.length >= 2) {
                sourceVerification += 5; // Multi-source corroboration bonus
            }
        }
    } else {
        feedback.push('No verifiable primary sources attached to signal.');
    }

    // 5. Internal Linking & Entity Relevance (Max 10 pts)
    const detectedEntities = extractEntities(totalText);
    if (detectedEntities.length >= 1) {
        internalLinking += 10;
    } else {
        internalLinking += 5;
        feedback.push('No recognized high-value topic entities matched.');
    }

    // 6. Metadata & Structured Data Readiness (Max 10 pts)
    if (headline && (summary || fullReport)) {
        structuredData += 10;
    }

    // 7. Image / Media Quality (Max 5 pts)
    if (data.imageUrl && data.imageUrl.startsWith('http')) {
        mediaQuality += 5;
    } else {
        feedback.push('Missing featured image.');
    }

    const totalScore = contentUsefulness + originalValue + technicalSeo + sourceVerification + internalLinking + structuredData + mediaQuality;

    // High-Risk Content Detection
    const highRiskKeywords = [
        'killed', 'casualties', 'dead', 'death toll', 'fatalities',
        'lawsuit', 'allegations', 'accused', 'fraud', 'arrested',
        'breaking conflict', 'airstrike', 'bombing', 'assassination'
    ];
    const isHighRisk = highRiskKeywords.some(kw => totalText.toLowerCase().includes(kw));

    return {
        score: totalScore,
        passed: totalScore >= 70 && !isHighRisk,
        breakdown: {
            contentUsefulness,
            originalValue,
            technicalSeo,
            sourceVerification,
            internalLinking,
            structuredData,
            mediaQuality,
        },
        feedback,
        riskLevel: isHighRisk ? 'High' : (totalScore < 70 ? 'Medium' : 'Low')
    };
}
