// Intent classification for chatbot messages
export type UserIntent =
    | 'NEWS_SEARCH'
    | 'BUSINESS_INQUIRY'
    | 'FAQ'
    | 'GENERAL';

export interface IntentResult {
    intent: UserIntent;
    confidence: number;
    metadata?: {
        category?: string;
        keywords?: string[];
    };
}

export function detectIntent(userMessage: string): IntentResult {
    const lowerMessage = userMessage.toLowerCase();

    // BUSINESS_INQUIRY - High priority
    const businessKeywords = [
        'advertis', 'sponsor', 'partner', 'collaborat',
        'business', 'invest', 'pitch', 'proposal',
        'media kit', 'pricing', 'rate', 'package'
    ];

    if (businessKeywords.some(kw => lowerMessage.includes(kw))) {
        return {
            intent: 'BUSINESS_INQUIRY',
            confidence: 0.9
        };
    }

    // NEWS_SEARCH - Look for search patterns
    const searchKeywords = [
        'show me', 'find', 'search', 'news about',
        'latest', 'recent', 'articles about', 'what\'s happening',
        'tell me about', 'any news'
    ];

    const categories = ['tech', 'business', 'sports', 'ai', 'auto', 'pakistan', 'global'];
    const hasSearchIntent = searchKeywords.some(kw => lowerMessage.includes(kw));
    const mentionsCategory = categories.some(cat => lowerMessage.includes(cat));

    if (hasSearchIntent || mentionsCategory) {
        // Extract category if mentioned
        const category = categories.find(cat => lowerMessage.includes(cat));

        return {
            intent: 'NEWS_SEARCH',
            confidence: 0.85,
            metadata: {
                category: category ? category.charAt(0).toUpperCase() + category.slice(1) : undefined
            }
        };
    }

    // FAQ - Common question patterns
    const faqKeywords = [
        'how often', 'how does', 'what is', 'who are',
        'source', 'update', 'frequency', 'contact',
        'categor', 'topic', 'accurate', 'reliable'
    ];

    if (faqKeywords.some(kw => lowerMessage.includes(kw))) {
        return {
            intent: 'FAQ',
            confidence: 0.8
        };
    }

    // GENERAL - Everything else
    return {
        intent: 'GENERAL',
        confidence: 0.6
    };
}
