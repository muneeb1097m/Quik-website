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

    // Extract <p> tag content and strip inner tags
    const paragraphs = [...cleaned.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
        .map(m => m[1].replace(/<[^>]+>/g, '').trim())
        .filter(p => p.length > 30); // skip short/empty paragraphs

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

