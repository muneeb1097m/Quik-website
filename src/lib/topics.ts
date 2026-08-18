import { TopicHub } from '@/types';

export const TOPICS: Record<string, TopicHub> = {
    'artificial-intelligence': {
        slug: 'artificial-intelligence',
        name: 'Artificial Intelligence',
        parentCategory: 'Technology',
        description: 'Comprehensive coverage of generative AI, large language models, machine learning breakthroughs, AI safety, and enterprise adoption.',
        keywords: ['artificial intelligence', 'ai', 'llm', 'machine learning', 'neural network', 'deep learning', 'generative ai', 'chatgpt', 'gemini', 'claude'],
        relatedTopics: ['openai', 'google', 'nvidia', 'cybersecurity'],
        minArticleThreshold: 3
    },
    'openai': {
        slug: 'openai',
        name: 'OpenAI',
        parentCategory: 'Technology',
        description: 'Breaking news, model releases, research milestones, corporate partnerships, and executive updates from OpenAI.',
        keywords: ['openai', 'chatgpt', 'gpt-4', 'gpt-5', 'sam altman', 'sora', 'dall-e'],
        relatedTopics: ['artificial-intelligence', 'microsoft', 'google'],
        minArticleThreshold: 3
    },
    'google': {
        slug: 'google',
        name: 'Google & Alphabet',
        parentCategory: 'Technology',
        description: 'Intelligence on Google, Alphabet, Gemini AI, DeepMind, Android, Search, and cloud computing initiatives.',
        keywords: ['google', 'alphabet', 'gemini', 'deepmind', 'sundar pichai', 'android', 'pixel'],
        relatedTopics: ['artificial-intelligence', 'apple', 'openai'],
        minArticleThreshold: 3
    },
    'apple': {
        slug: 'apple',
        name: 'Apple',
        parentCategory: 'Technology',
        description: 'Real-time reporting on Apple devices, iOS updates, Apple Intelligence, financial earnings, and supply chain movements.',
        keywords: ['apple', 'iphone', 'tim cook', 'macbook', 'ipad', 'ios', 'apple intelligence', 'wwdc'],
        relatedTopics: ['google', 'nvidia', 'markets'],
        minArticleThreshold: 3
    },
    'nvidia': {
        slug: 'nvidia',
        name: 'Nvidia & Semiconductors',
        parentCategory: 'Technology',
        description: 'Analysis and breaking coverage of Nvidia, AI graphics processors, Blackwell architecture, semiconductor supply chains, and TSMC.',
        keywords: ['nvidia', 'jensen huang', 'gpu', 'semiconductor', 'blackwell', 'tsmc', 'ai chip'],
        relatedTopics: ['artificial-intelligence', 'markets', 'apple'],
        minArticleThreshold: 3
    },
    'markets': {
        slug: 'markets',
        name: 'Global Markets & Economy',
        parentCategory: 'Business',
        description: 'Real-time macroeconomic intelligence, central bank decisions, interest rate forecasts, stock market trends, and inflation reports.',
        keywords: ['markets', 'wall street', 'federal reserve', 'inflation', 'stocks', 'interest rates', 'nasdaq', 's&p 500', 'economy'],
        relatedTopics: ['nvidia', 'apple', 'startups'],
        minArticleThreshold: 3
    },
    'cybersecurity': {
        slug: 'cybersecurity',
        name: 'Cybersecurity',
        parentCategory: 'Technology',
        description: 'Tracking zero-day vulnerabilities, nation-state cyber warfare, ransomware campaigns, data breaches, and enterprise defense.',
        keywords: ['cybersecurity', 'ransomware', 'hack', 'data breach', 'vulnerability', 'zero-day', 'malware', 'cisa'],
        relatedTopics: ['artificial-intelligence', 'google'],
        minArticleThreshold: 3
    },
    'electric-vehicles': {
        slug: 'electric-vehicles',
        name: 'Electric Vehicles & Mobility',
        parentCategory: 'Auto',
        description: 'Updates on EV innovation, battery technology, Tesla, BYD, charging infrastructure, and autonomous driving.',
        keywords: ['electric vehicle', 'ev', 'tesla', 'elon musk', 'byd', 'battery', 'charging', 'autonomous driving'],
        relatedTopics: ['markets', 'technology'],
        minArticleThreshold: 3
    },
    'cricket': {
        slug: 'cricket',
        name: 'Cricket World',
        parentCategory: 'Sports',
        description: 'Coverage of international cricket, ICC tournaments, Test series, T20 leagues, and match intelligence.',
        keywords: ['cricket', 'icc', 'pcb', 'bcci', 'psl', 'ipl', 't20', 'test match', 'world cup'],
        relatedTopics: ['sports'],
        minArticleThreshold: 3
    }
};

export function getTopic(slug: string): TopicHub | undefined {
    return TOPICS[slug.toLowerCase()];
}

export function getAllTopics(): TopicHub[] {
    return Object.values(TOPICS);
}

/**
 * Validates whether a topic meets the comprehensive indexability threshold.
 * Requires:
 * 1. Matching topic definition in registry
 * 2. Meaningful description and context
 * 3. Sufficient article count (>= minArticleThreshold)
 */
export function isTopicIndexable(topic: TopicHub, articleCount: number): boolean {
    if (!topic || !topic.description || topic.description.length < 30) {
        return false;
    }
    return articleCount >= topic.minArticleThreshold;
}
