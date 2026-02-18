import { MetadataRoute } from 'next';
import { db } from '@/lib/qie/db';

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quiknews.online';

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
        '/editorial-policy',
        '/authors',
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
