import Parser from 'rss-parser';

// Real RSS Feeds configuration
const RSS_FEEDS = [
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Technology' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Technology' },
    { name: 'Dawn Business', url: 'https://www.dawn.com/feeds/business', category: 'Business' },
    { name: 'Geo News Tech', url: 'https://www.geo.tv/rss/5/53', category: 'Technology' }, // Verify availability or use proxy if needed, usually Geo is standard
    { name: 'BBC Business', url: 'http://feeds.bbci.co.uk/news/business/rss.xml', category: 'Business' },
];

export interface ExternalNewsItem {
    headline: string;
    url: string;
    source: string;
    timestamp: string;
    contentSnippet?: string;
    category?: string;
    imageUrl?: string;
}

export class NewsMonitor {
    private parser: Parser;

    constructor() {
        this.parser = new Parser({
            customFields: {
                item: [
                    ['media:content', 'media:content', { keepArray: false }],
                    ['media:thumbnail', 'media:thumbnail', { keepArray: false }],
                ]
            }
        });
    }

    async fetchLatestNews(): Promise<ExternalNewsItem[]> {
        console.log('QIE Monitor: Fetching RSS feeds...');
        let allItems: ExternalNewsItem[] = [];

        for (const feed of RSS_FEEDS) {
            try {
                const parsed = await this.parser.parseURL(feed.url);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const items = parsed.items.slice(0, 3).map((item: any) => {
                    // Extract Image Logic
                    let img = '';
                    if (item.enclosure?.url) img = item.enclosure.url;
                    else if (item['media:content']?.$.url) img = item['media:content'].$.url;
                    else if (item['media:thumbnail']?.$.url) img = item['media:thumbnail'].$.url;

                    return {
                        headline: item.title || 'No Title',
                        url: item.link || '',
                        source: feed.name,
                        timestamp: item.pubDate || new Date().toISOString(),
                        contentSnippet: item.contentSnippet || item.content || '',
                        category: feed.category,
                        imageUrl: img
                    };
                });
                allItems = [...allItems, ...items];
            } catch (error) {
                console.error(`Error fetching ${feed.name}:`, error);
            }
        }

        return allItems;
    }
}
