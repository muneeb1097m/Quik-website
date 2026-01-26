import { db } from '@/lib/qie/db';

export interface NewsSearchResult {
    message: string;
    articles: Array<{
        id: string;
        headline: string;
        summary: string;
        category: string;
        url: string;
    }>;
}

export async function searchNews(userQuery: string, category?: string): Promise<NewsSearchResult> {
    try {
        // Determine search category
        let searchCategory = category;

        if (!searchCategory) {
            // Extract category from query
            const lowerQuery = userQuery.toLowerCase();
            const categoryMap: Record<string, string> = {
                'tech': 'Technology',
                'technology': 'Technology',
                'business': 'Business',
                'sports': 'Sports',
                'ai': 'AI',
                'artificial intelligence': 'AI',
                'auto': 'Auto',
                'automotive': 'Auto',
                'car': 'Auto',
                'pakistan': 'Pakistan',
                'global': 'Global',
                'world': 'Global',
                'international': 'Global'
            };

            for (const [keyword, cat] of Object.entries(categoryMap)) {
                if (lowerQuery.includes(keyword)) {
                    searchCategory = cat;
                    break;
                }
            }
        }

        // Fetch signals - limit to 5 most recent
        const signals = await db.getSignals(searchCategory, 5);

        if (signals.length === 0) {
            return {
                message: searchCategory
                    ? `I couldn't find recent news in the ${searchCategory} category. Try asking about a different topic!`
                    : "I couldn't find news matching your query. Try asking about Technology, Business, Sports, AI, Auto, Pakistan, or Global news.",
                articles: []
            };
        }

        // Format results
        const articles = signals.map(signal => ({
            id: signal.id,
            headline: signal.headline,
            summary: signal.summary,
            category: signal.event.category,
            url: `/news/${signal.id}`
        }));

        const categoryText = searchCategory ? ` in ${searchCategory}` : '';
        const message = `Here are the latest ${articles.length} news articles${categoryText}:`;

        return {
            message,
            articles
        };

    } catch (error) {
        console.error('News search error:', error);
        return {
            message: 'Sorry, I encountered an error while searching for news. Please try again.',
            articles: []
        };
    }
}
