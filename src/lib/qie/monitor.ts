import Parser from 'rss-parser';

// Real RSS Feeds configuration
const RSS_FEEDS = [
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Technology' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Technology' },
    { name: 'Dawn Business', url: 'https://www.dawn.com/feeds/business', category: 'Business' },
    { name: 'Geo News Tech', url: 'https://www.geo.tv/rss/5/53', category: 'Technology' },
    { name: 'BBC Business', url: 'http://feeds.bbci.co.uk/news/business/rss.xml', category: 'Business' },
    // New Feeds
    { name: 'ProPakistani', url: 'https://propakistani.pk/feed/', category: 'Technology' },
    { name: 'TechJuice', url: 'https://techjuice.pk/feed/', category: 'Technology' },
    { name: 'Profit', url: 'https://profit.pakistantoday.com.pk/feed/', category: 'Business' },
    { name: 'CNBC', url: 'https://www.cnbc.com/id/19854910/device/rss/rss.html', category: 'Technology' },
    { name: 'Wired Business', url: 'https://www.wired.com/feed/category/business/latest/rss', category: 'Business' },
    // International
    { name: 'NYT World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'International' },
    { name: 'BBC UK', url: 'http://feeds.bbci.co.uk/news/uk/rss.xml', category: 'International' },
    { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'International' },
    { name: 'The National UAE', url: 'https://www.thenationalnews.com/rss/', category: 'International' },
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

        const feedPromises = RSS_FEEDS.map(async (feed) => {
            try {
                const parsed = await this.parser.parseURL(feed.url);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return parsed.items.slice(0, 3).map((item: any) => {
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
            } catch (error) {
                console.error(`Error fetching ${feed.name}:`, error);
                return [];
            }
        });

        const results = await Promise.all(feedPromises);
        allItems = results.flat();

        return allItems;
    }
}
