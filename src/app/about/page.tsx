import type { Metadata } from 'next';
import AboutClient from '@/components/AboutClient';

export const metadata: Metadata = {
    title: 'About Quik | AI-Powered Global Intelligence Platform',
    description: 'Learn about Quik News mission to deliver real-time, verified global news and intelligence synthesized by autonomous AI agents.',
    keywords: [
        'About Quik',
        'AI Journalism',
        'News Intelligence Platform',
        'Autonomous AI Agents',
        'Real-time News Synthesis',
        'Quik News Mission'
    ],
    openGraph: {
        title: 'About Quik | AI-Powered Global Intelligence Platform',
        description: 'Learn about Quik News mission to deliver real-time, verified global news and intelligence synthesized by autonomous AI agents.',
        url: 'https://quiknews.online/about',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About Quik | AI-Powered Global Intelligence Platform',
        description: 'Learn about Quik News mission to deliver real-time, verified global news.',
    },
    alternates: {
        canonical: 'https://quiknews.online/about',
    },
};

export default function AboutPage() {
    return <AboutClient />;
}
