// FAQ responses for common questions about Quik
export const FAQ_RESPONSES: Record<string, string> = {
    'update_frequency': 'Quik updates every 15 minutes with the latest news from trusted global sources. Our AI monitors 50+ RSS feeds across Technology, Business, Sports, and more.',

    'news_sources': 'We aggregate news from premium sources including TechCrunch, Bloomberg, Reuters, BBC, Al Jazeera, and 45+ other verified outlets.',

    'how_it_works': 'Quik uses AI to monitor global news feeds, synthesize stories, and generate intelligent summaries. Each article is processed by Google Gemini to deliver concise, signal-rich content.',

    'advertising': "Interested in advertising on Quik? We'd love to hear from you! Please share your email and we'll send you our media kit with pricing and reach information.",

    'partnership': "Want to partner with Quik? Great! Please provide your email and a brief description of your proposal, and our team will reach out within 24 hours.",

    'contact': 'You can reach us at contact@quik.news or through this chat. For business inquiries, please share your email and we\'ll respond promptly.',

    'categories': 'Quik covers 7 major categories: Technology, Business, Global Affairs, AI, Automotive, Pakistan, and Sports. You can browse by category from our navigation menu.',

    'ai_accuracy': 'Our AI synthesizes news from multiple verified sources and cross-references facts. Each story includes source links so you can verify the original reporting.',
};

export function findFAQMatch(userMessage: string): string | null {
    const lowerMessage = userMessage.toLowerCase();

    // Update frequency
    if (lowerMessage.includes('how often') || lowerMessage.includes('update') || lowerMessage.includes('frequency')) {
        return FAQ_RESPONSES.update_frequency;
    }

    // News sources
    if (lowerMessage.includes('source') && !lowerMessage.includes('i want') && !lowerMessage.includes('need')) {
        return FAQ_RESPONSES.news_sources;
    }

    // How it works
    if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('generate'))) {
        return FAQ_RESPONSES.how_it_works;
    }

    // Advertising
    if (lowerMessage.includes('advertis') || lowerMessage.includes('sponsor')) {
        return FAQ_RESPONSES.advertising;
    }

    // Partnership
    if (lowerMessage.includes('partner') || lowerMessage.includes('collaborat')) {
        return FAQ_RESPONSES.partnership;
    }

    // Contact
    if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('email')) {
        return FAQ_RESPONSES.contact;
    }

    // Categories
    if (lowerMessage.includes('categor') || lowerMessage.includes('topic')) {
        return FAQ_RESPONSES.categories;
    }

    // AI accuracy
    if (lowerMessage.includes('accura') || lowerMessage.includes('reliable') || lowerMessage.includes('trust')) {
        return FAQ_RESPONSES.ai_accuracy;
    }

    return null;
}
