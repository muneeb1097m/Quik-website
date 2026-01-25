import { MetadataRoute } from 'next';
import { db } from '@/lib/qie/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://quik.news';

    // Static routes
    const routes = [
        '',
        '/tech',
        '/business',
        '/telecom',
        '/global',
        '/ai',
        '/auto',
        '/pakistan',
        '/sports',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'hourly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Fetch recent signals for news pages
    // Increased to 500 for better search engine coverage
    const signals = await db.getSignals(undefined, 500);

    const newsRoutes = signals.map((signal) => ({
        url: `${baseUrl}/news/${signal.id}`,
        lastModified: new Date(signal.generatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...routes, ...newsRoutes];
}
