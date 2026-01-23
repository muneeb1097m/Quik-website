import Parser from 'rss-parser';

// RSS Feeds - Category-Specific Sources
const RSS_FEEDS = [
    // === PAKISTAN ===
    { name: 'Dawn Pakistan', url: 'https://www.dawn.com/feeds/home', category: 'Pakistan' },
    { name: 'The News Pakistan', url: 'https://www.thenews.com.pk/rss/1/1', category: 'Pakistan' },
    { name: 'ProPakistani Tech', url: 'https://propakistani.pk/feed/', category: 'Pakistan' },
    { name: 'TechJuice', url: 'https://techjuice.pk/feed/', category: 'Pakistan' },

    // === GLOBAL/INTERNATIONAL ===
    { name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'Global' },
    { name: 'Reuters World', url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best', category: 'Global' },
    { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'Global' },
    { name: 'CNN World', url: 'http://rss.cnn.com/rss/edition_world.rss', category: 'Global' },

    // === SPORTS ===
    { name: 'BBC Sport', url: 'http://feeds.bbci.co.uk/sport/rss.xml', category: 'Sports' },
    { name: 'ESPN', url: 'https://www.espn.com/espn/rss/news', category: 'Sports' },
    { name: 'Sky Sports', url: 'https://www.skysports.com/rss/12040', category: 'Sports' },
    { name: 'Cricbuzz', url: 'https://www.cricbuzz.com/rss-feed/all.xml', category: 'Sports' },

    // === AI ===
    { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'AI' },
    { name: 'Wired AI', url: 'https://www.wired.com/feed/tag/ai/latest/rss', category: 'AI' },
    { name: 'The Verge AI', url: 'https://www.theverge.com/rss/artificial-intelligence/index.xml', category: 'AI' },
    { name: 'MIT Tech Review AI', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', category: 'AI' },

    // === AUTO ===
    { name: 'Autoblog', url: 'https://www.autoblog.com/rss.xml', category: 'Auto' },
    { name: 'Motor1', url: 'https://www.motor1.com/rss/', category: 'Auto' },
    { name: 'Car and Driver', url: 'https://www.caranddriver.com/rss/all.xml/', category: 'Auto' },
    { name: 'Electrek', url: 'https://electrek.co/feed/', category: 'Auto' },

    // === BUSINESS ===
    { name: 'Bloomberg', url: 'https://www.bloomberg.com/feed/podcast/bloomberg-surveillance.xml', category: 'Business' },
    { name: 'Financial Times', url: 'https://www.ft.com/?format=rss', category: 'Business' },
    { name: 'Wall Street Journal', url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', category: 'Business' },
    { name: 'Dawn Business', url: 'https://www.dawn.com/feeds/business', category: 'Business' },

    // === STARTUPS ===
    { name: 'TechCrunch Startups', url: 'https://techcrunch.com/category/startups/feed/', category: 'Startups' },
    { name: 'VentureBeat', url: 'https://venturebeat.com/feed/', category: 'Startups' },
    { name: 'The Hustle', url: 'https://thehustle.co/feed/', category: 'Startups' },

    // === TECHNOLOGY (General) ===
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Technology' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Technology' },
    { name: 'Ars Technica', url: 'http://feeds.arstechnica.com/arstechnica/index', category: 'Technology' },
    { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'Technology' },
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
