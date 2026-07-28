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
