import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with tailwind-merge to handle conflicts correctly.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Decodes numeric and named HTML entities (e.g. &#8217; -> ', &amp; -> &, &quot; -> ")
 */
export function decodeHtmlEntities(text: string): string {
    if (!text) return '';

    return text
        // Named entities
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&copy;/g, '©')
        .replace(/&reg;/g, '®')
        .replace(/&trade;/g, '™')
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–')

        // Common numeric smart quotes, apostrophes, dashes
        .replace(/&#8216;/g, "'")
        .replace(/&#8217;/g, "'")
        .replace(/&#8218;/g, ",")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&#8222;/g, '"')
        .replace(/&#8211;/g, '–')
        .replace(/&#8212;/g, '—')
        .replace(/&#8230;/g, '...')
        .replace(/&#39;/g, "'")
        .replace(/&#039;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')

        // Generic decimal entity regex: &#1234; -> String.fromCharCode(1234)
        .replace(/&#(\d+);/g, (_, dec) => {
            try {
                return String.fromCharCode(parseInt(dec, 10));
            } catch {
                return _;
            }
        })
        // Generic hex entity regex: &#x1f4a9; -> String.fromCodePoint(0x1f4a9)
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
            try {
                return String.fromCodePoint(parseInt(hex, 16));
            } catch {
                return _;
            }
        });
}

/**
 * Calculates word similarity between two headlines.
 * Returns true if they are >60% similar or share 75%+ of words.
 */
export function isSimilarHeadline(h1: string, h2: string, threshold = 0.60): boolean {
    if (!h1 || !h2) return false;

    const normalize = (text: string) =>
        text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/gi, '')
            .split(/\s+/)
            .filter(w => w.length > 2); // Ignore short 1-2 letter stop words

    const words1 = normalize(h1);
    const words2 = normalize(h2);

    if (words1.length === 0 || words2.length === 0) return false;

    const set1 = new Set(words1);
    const set2 = new Set(words2);

    // Calculate intersection (shared words)
    let sharedCount = 0;
    for (const w of set2) {
        if (set1.has(w)) sharedCount++;
    }

    // Jaccard similarity: shared / total_unique
    const unionSize = new Set([...words1, ...words2]).size;
    const jaccardScore = sharedCount / unionSize;

    // Inclusion ratio: shared / min_length (catches shortened versions of titles)
    const minLength = Math.min(set1.size, set2.size);
    const inclusionScore = minLength > 0 ? sharedCount / minLength : 0;

    return jaccardScore >= threshold || (minLength >= 3 && inclusionScore >= 0.75);
}

/**
 * Filters out duplicate or near-duplicate signal objects from an array.
 */
export function deduplicateSignals<T extends { headline?: string; title?: string }>(signals: T[]): T[] {
    if (!signals || signals.length === 0) return [];

    const unique: T[] = [];
    for (const item of signals) {
        const itemTitle = item.headline || item.title || '';
        const isDup = unique.some(existing => {
            const existingTitle = existing.headline || existing.title || '';
            return isSimilarHeadline(itemTitle, existingTitle);
        });

        if (!isDup) {
            unique.push(item);
        }
    }
    return unique;
}

/**
 * Efficiently serializes data to be passed to Client Components.
 */
export function serialize<T>(data: T): T {
    if (data === undefined || data === null) return data;
    return JSON.parse(JSON.stringify(data));
}

/**
 * Removes HTML tags and decodes HTML entities from a string.
 */
export function stripHtml(html: string): string {
    if (!html) return '';
    const cleaned = html.replace(/<[^>]*>?/gm, '');
    return decodeHtmlEntities(cleaned).trim();
}

/**
 * Converts text into a clean URL-friendly slug.
 */
export function slugify(text: string): string {
    if (!text) return '';
    return decodeHtmlEntities(text)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

/**
 * Formats a canonical news article URL using title slug and ID fallback.
 */
export function getNewsUrl(signal: { id: string; headline?: string; title?: string }): string {
    if (!signal || !signal.id) return '/news';
    const title = signal.headline || signal.title || '';
    const slug = slugify(title);
    if (slug) {
        return `/news/${slug}-${signal.id}`;
    }
    return `/news/${signal.id}`;
}

/**
 * Extracts signal ID from route param (handles both '/news/slug-sig_123' and '/news/sig_123').
 */
export function extractSignalIdFromParam(param: string): string {
    if (!param) return '';
    const decoded = decodeURIComponent(param);
    const sigMatch = decoded.match(/(sig_[a-zA-Z0-9_]+)$/);
    if (sigMatch) {
        return sigMatch[1];
    }
    const sigAnyMatch = decoded.match(/(sig_[a-zA-Z0-9_]+)/);
    if (sigAnyMatch) {
        return sigAnyMatch[1];
    }
    return decoded;
}

/**
 * Formats meta titles to fit strictly within target length (default 55 chars).
 */
export function formatMetaTitle(headline: string, suffix = ' | Quik', maxLen = 55): string {
    if (!headline) return `News${suffix}`;
    const cleanHeadline = decodeHtmlEntities(stripHtml(headline));
    const fullTitle = `${cleanHeadline}${suffix}`;
    
    if (fullTitle.length <= maxLen) {
        return fullTitle;
    }

    const targetHeadlineLen = maxLen - suffix.length;
    if (targetHeadlineLen <= 10) {
        return cleanHeadline.slice(0, maxLen);
    }

    const truncated = cleanHeadline.slice(0, targetHeadlineLen).replace(/\s+[^\s]*$/, '');
    return `${truncated}${suffix}`;
}

/**
 * Formats meta descriptions to fit strictly within target length (default 155 chars).
 */
export function formatMetaDescription(text: string, maxLen = 155): string {
    if (!text) return 'Latest real-time news and intelligence, synthesized by AI on Quik.';
    const clean = decodeHtmlEntities(stripHtml(text));
    if (clean.length <= maxLen) {
        return clean;
    }
    
    const truncated = clean.slice(0, maxLen - 3).replace(/\s+[^\s]*$/, '');
    return `${truncated}...`;
}

/**
 * Generates JSON-LD FAQPage Schema for structured rich snippet data.
 */
export function generateFaqSchema(signal: any, event?: any) {
    const headline = decodeHtmlEntities(signal.headline || '');
    const summary = decodeHtmlEntities(signal.summary || '');
    const category = event?.category || 'News';
    
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `What is the latest update on ${headline}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: summary || `Latest ${category} news report synthesized by Quik AI.`,
                },
            },
            {
                '@type': 'Question',
                name: `What category does this news story belong to?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `This article is categorized under ${category} news on Quik.`,
                },
            },
            {
                '@type': 'Question',
                name: `Where is this news signal sourced from?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `This real-time signal is aggregated and verified by Quik AI from leading global media sources.`,
                },
            },
        ],
    };
}

