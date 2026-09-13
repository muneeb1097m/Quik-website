// Edge-compatible scraper using regex (no cheerio/stream needed)

function extractMetaTag(html: string, property: string, attr: 'content' | 'href' = 'content'): string | undefined {
    // Match both property="" and name="" attributes, and content/href value
    const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(
        `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+${attr}=["']([^"']+)["']|` +
        `<meta[^>]+${attr}=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`,
        'i'
    );
    const match = html.match(regex);
    return match ? (match[1] || match[2]) : undefined;
}

function extractLinkTag(html: string, rel: string): string | undefined {
    const escaped = rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`<link[^>]+rel=["']${escaped}["'][^>]+href=["']([^"']+)["']`, 'i');
    const match = html.match(regex);
    return match ? match[1] : undefined;
}

function extractParagraphs(html: string): string {
    // Remove script/style blocks first
    const cleaned = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');

    // Common junk patterns to filter out
    const junkPatterns = [
        /follow us on/i,
        /copyright/i,
        /all rights reserved/i,
        /read more:/i,
        /subscribe to/i,
        /click here/i,
        /join our/i,
        /the post .* appeared first on/i,
        /show you notifications/i,
        /please log in again/i,
        /sign up for our newsletter/i,
        /download the app/i,
        /advertisement/i,
        /the login page will open/i,
        /recommended for you/i,
        /trending now/i,
        /scroll through your favourite content/i,
        /whatsapp group/i,
    ];

    // Extract <p> tag content and strip inner tags
    const paragraphs = [...cleaned.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
        .map(m => m[1].replace(/<[^>]+>/g, '').trim())
        .filter(p => {
            // skip short/empty paragraphs
            if (p.length < 35) return false;
            
            // Skip if it matches any junk pattern
            if (junkPatterns.some(pattern => pattern.test(p))) return false;

            return true;
        });

    return paragraphs.join('\n\n');
}

export async function scrapeArticleContent(url: string): Promise<{ content: string, imageUrl?: string }> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.warn(`Failed to fetch ${url}: ${response.status}`);
            return { content: '' };
        }

        const html = await response.text();

        // Extract og:image / twitter:image
        const imageUrl =
            extractMetaTag(html, 'og:image') ||
            extractMetaTag(html, 'twitter:image') ||
            extractLinkTag(html, 'image_src');

        // Extract article text from paragraphs
        const content = extractParagraphs(html);

        return { content: content.trim(), imageUrl };

    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        return { content: '' };
    }
}

