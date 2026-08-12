import { MetadataRoute } from 'next';
import { supabase } from '@/lib/qie/db';
import { getNewsUrl } from '@/lib/utils';

export const revalidate = 43200; // Revalidate every 12 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.quiknews.online').replace(/\/$/, '');

    // 1. Static Routes
    const staticRoutes = [
        '',
        '/about',
        '/archive',
        '/news',
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
        priority: route === '' ? 1.0 : (['/tech', '/business', '/global', '/ai', '/sports', '/pakistan', '/auto'].includes(route) ? 0.9 : 0.8),
    }));

    // 2. Dynamic News Routes
    // Fetch latest 500 signals to provide deep indexing for Google (lightweight select)
    let newsRoutes: MetadataRoute.Sitemap = [];
    try {
        const { data: latestSignals } = await supabase
            .from('Signal')
            .select('id, headline, generatedAt')
            .order('generatedAt', { ascending: false })
            .limit(500);

        if (latestSignals && latestSignals.length > 0) {
            const seenUrls = new Set<string>(staticRoutes.map(r => r.url));

            for (const signal of latestSignals) {
                const path = getNewsUrl(signal);
                const fullUrl = `${baseUrl}${path}`;
                if (!seenUrls.has(fullUrl)) {
                    seenUrls.add(fullUrl);
                    newsRoutes.push({
                        url: fullUrl,
                        lastModified: new Date(signal.generatedAt || Date.now()),
                        changeFrequency: 'weekly' as const,
                        priority: 0.7,
                    });
                }
            }
        }
    } catch (error) {
        console.error('Sitemap dynamic fetch error:', error);
    }

    return [...staticRoutes, ...newsRoutes];
}
