import { MetadataRoute } from 'next';
import { db } from '@/lib/qie/db';

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://quiknews.online').replace(/\/$/, '');

    // 1. Static Routes
    const staticRoutes = [
        '',
        '/tech',
        '/business',
        '/global',
        '/ai',
        '/auto',
        '/pakistan',
        '/sports',
        '/privacy',
        '/terms',
        '/editorial-policy',
        '/authors',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));

    // 2. Dynamic News Routes
    // Fetch latest 500 signals to provide deep indexing for Google
    let newsRoutes: MetadataRoute.Sitemap = [];
    try {
        const latestSignals = await db.getSignals(undefined, 500);
        newsRoutes = latestSignals.map((signal: any) => ({
            url: `${baseUrl}/news/${signal.id}`,
            lastModified: new Date(signal.generatedAt || Date.now()),
            changeFrequency: 'monthly' as const, // News articles don't change much once published
            priority: 0.6,
        }));
    } catch (error) {
        console.error('Sitemap dynamic fetch error:', error);
    }

    return [...staticRoutes, ...newsRoutes];
}
