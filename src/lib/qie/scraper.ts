import * as cheerio from 'cheerio';

export async function scrapeArticleContent(url: string): Promise<string> {
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
            return '';
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove unwanted elements
        $('script, style, nav, footer, header, aside, .advertisement, .ads, .social-share').remove();

        // Try to find the main content container
        // Common selectors for article bodies
        const selectors = [
            'article',
            'main',
            '.post-content',
            '.article-body',
            '.entry-content',
            '.story-body',
            '#content'
        ];

        let content = '';

        for (const selector of selectors) {
            const element = $(selector);
            if (element.length > 0) {
                // Get text from paragraphs to maintain structure
                content = element.find('p').map((_, el) => $(el).text().trim()).get().join('\n\n');
                if (content.length > 500) break; // Found substantial content
            }
        }

        // Fallback: simple p tag extraction from body if specific selectors fail
        if (content.length < 200) {
            content = $('body').find('p').map((_, el) => $(el).text().trim()).get().join('\n\n');
        }

        return content.trim();

    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        return '';
    }
}
