import { XMLParser } from 'fast-xml-parser';
import { decodeHtmlEntities, stripHtml } from '@/lib/utils';

// RSS Feeds - Category-Specific Sources
const RSS_FEEDS = [
    // === PAKISTAN ===
    { name: 'Dawn Pakistan', url: 'https://www.dawn.com/feeds/home', category: 'Pakistan' },
    { name: 'ProPakistani Tech', url: 'https://propakistani.pk/feed/', category: 'Pakistan' },

    // === GLOBAL/INTERNATIONAL ===
    { name: 'NYT World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'Global' },
    { name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'Global' },
    { name: 'Guardian World', url: 'https://www.theguardian.com/world/rss', category: 'Global' },
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
    { name: 'Electrek', url: 'https://electrek.co/feed/', category: 'Auto' },

    // === BUSINESS ===
    { name: 'NYT Business', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', category: 'Business' },
    { name: 'Financial Times', url: 'https://www.ft.com/?format=rss', category: 'Business' },

    // === STARTUPS ===
    { name: 'TechCrunch Startups', url: 'https://techcrunch.com/category/startups/feed/', category: 'Startups' },
    { name: 'VentureBeat', url: 'https://venturebeat.com/feed/', category: 'Startups' },

    // === TECHNOLOGY (General) ===
    { name: 'NYT Technology', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'Technology' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Technology' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Technology' },
    { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'Technology' },
    { name: 'Ars Technica', url: 'http://feeds.arstechnica.com/arstechnica/index', category: 'Technology' },
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
    private parser: XMLParser;

    constructor() {
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
        });
    }

    async fetchLatestNews(): Promise<ExternalNewsItem[]> {
        console.log('QIE Monitor: Fetching RSS feeds...');
        let allItems: ExternalNewsItem[] = [];

        const feedPromises = RSS_FEEDS.map(async (feed) => {
            try {
                // Fetch RSS raw text
                const response = await fetch(feed.url, {
                    headers: { 'User-Agent': 'QuikNews/1.0' },
                    next: { revalidate: 3600 }
                });
                const xmlData = await response.text();

                // Parse it
                const result = this.parser.parse(xmlData);

                // Handle both RSS/Atom feeds conditionally
                let itemsList = [];
                if (result.rss?.channel?.item) {
                    itemsList = Array.isArray(result.rss.channel.item) ? result.rss.channel.item : [result.rss.channel.item];
                } else if (result.feed?.entry) {
                    itemsList = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return itemsList.slice(0, 3).map((item: any) => {
                    // Extract Image Logic (Custom property traversing for fast-xml-parser)
                    let img = '';
                    if (item.enclosure && item.enclosure['@_url']) img = item.enclosure['@_url'];
                    else if (item['media:content'] && item['media:content']['@_url']) img = item['media:content']['@_url'];
                    else if (item['media:thumbnail'] && item['media:thumbnail']['@_url']) img = item['media:thumbnail']['@_url'];

                    // RSS title vs Atom title
                    const rawHeadline = item.title?.['#text'] || item.title || 'No Title';
                    const headline = decodeHtmlEntities(stripHtml(String(rawHeadline)));
                    const link = item.link?.['@_href'] || item.link || '';
                    const rawContent = item.description || item.content || item.summary || item['content:encoded'] || '';
                    const content = decodeHtmlEntities(stripHtml(String(rawContent)));
                    const timestamp = item.pubDate || item.published || item.updated || new Date().toISOString();

                    return {
                        headline,
                        url: link,
                        source: feed.name,
                        timestamp,
                        contentSnippet: content,
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
