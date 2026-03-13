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

    // Performance: Removed DB call for all signal URLs to prevent build-time DB pool exhaustion
    // Dynamic routes handled natively via search console or indexnow
    return [...routes];
}
