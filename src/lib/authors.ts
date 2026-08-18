import { AuthorProfile } from '@/types';

export const AUTHORS: Record<string, AuthorProfile> = {
    'muneeb': {
        slug: 'muneeb',
        name: 'Muneeb',
        role: 'Founder & Editor-in-Chief',
        bio: 'Tech entrepreneur and software engineer focused on high-signal news synthesis and information density. Founded Quik to deliver real-time, verified global intelligence free of sensationalism.',
        areasOfCoverage: ['Artificial Intelligence', 'Global Technology', 'Macroeconomics', 'Startups'],
        type: 'Person',
        avatarUrl: '/authors/muneeb.jpg',
        socials: {
            twitter: 'https://x.com/quik_news',
            linkedin: 'https://www.linkedin.com/company/quik-official',
            website: 'https://www.quiknews.online/author/muneeb'
        }
    },
    'quik-editorial-team': {
        slug: 'quik-editorial-team',
        name: 'Quik Editorial Desk',
        role: 'Autonomous Newsroom & Verification Desk',
        bio: 'The Quik Editorial Desk oversees automated multi-source aggregation, factual corroboration, entity extraction, and structural intelligence synthesis across international media feeds.',
        areasOfCoverage: ['Breaking News', 'Global Affairs', 'Business', 'Technology', 'Science', 'Sports'],
        type: 'Organization',
        avatarUrl: '/logo.png',
        socials: {
            twitter: 'https://x.com/quik_news',
            linkedin: 'https://www.linkedin.com/company/quik-official',
            website: 'https://www.quiknews.online/about'
        }
    },
    'tech-desk': {
        slug: 'tech-desk',
        name: 'Quik Tech & AI Desk',
        role: 'Technology Intelligence Group',
        bio: 'Dedicated intelligence stream tracking foundational AI models, semiconductors, enterprise software, cybersecurity, and emerging technology breakthroughs.',
        areasOfCoverage: ['Artificial Intelligence', 'Semiconductors', 'Cloud Computing', 'Cybersecurity', 'Electric Vehicles'],
        type: 'Organization',
        avatarUrl: '/logo.png',
        socials: {
            twitter: 'https://x.com/quik_news',
            website: 'https://www.quiknews.online/tech'
        }
    },
    'markets-desk': {
        slug: 'markets-desk',
        name: 'Quik Markets & Economy Desk',
        role: 'Financial Intelligence Group',
        bio: 'Coverage of macroeconomic policy, central banks, corporate earnings, financial markets, venture capital, and international trade.',
        areasOfCoverage: ['Markets', 'Economy', 'Corporate Earnings', 'Venture Capital', 'Crypto'],
        type: 'Organization',
        avatarUrl: '/logo.png',
        socials: {
            twitter: 'https://x.com/quik_news',
            website: 'https://www.quiknews.online/business'
        }
    }
};

export const DEFAULT_AUTHOR = AUTHORS['quik-editorial-team'];

export function getAuthor(slug?: string): AuthorProfile {
    if (!slug) return DEFAULT_AUTHOR;
    return AUTHORS[slug.toLowerCase()] || DEFAULT_AUTHOR;
}

export function getAllAuthors(): AuthorProfile[] {
    return Object.values(AUTHORS);
}
