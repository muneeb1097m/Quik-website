import { MetadataRoute } from 'next';
import { supabase } from '@/lib/qie/db';
import { getNewsUrl } from '@/lib/utils';
import { getAllAuthors } from '@/lib/authors';
import { getAllTopics } from '@/lib/topics';
import { getBaseUrl } from '@/lib/seo';

export const revalidate = 43200; // 12 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseUrl();

    // 1. Static Routes
    const staticRoutes: MetadataRoute.Sitemap = [
        '',
        '/about',
        '/editorial-policy',
        '/authors',
        '/archive',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));

    // 2. Category Hub Routes
    const categoryRoutes: MetadataRoute.Sitemap = [
        '/tech',
        '/business',
        '/global',
        '/ai',
        '/auto',
        '/pakistan',
        '/sports',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    // 3. Topic Hub Routes
    const topicRoutes: MetadataRoute.Sitemap = getAllTopics().map((topic) => ({
        url: `${baseUrl}/topic/${topic.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.85,
    }));

    // 4. Author Profile Routes
    const authorRoutes: MetadataRoute.Sitemap = getAllAuthors().map((author) => ({
        url: `${baseUrl}/author/${author.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 5. Dynamic Indexable News Articles
    // Fetches all eligible canonical indexable articles with accurate lastModified timestamps
    let newsRoutes: MetadataRoute.Sitemap = [];
    try {
        const { data: allSignals } = await supabase
            .from('Signal')
            .select('id, headline, generatedAt')
            .order('generatedAt', { ascending: false })
            .limit(10000);

        if (allSignals && allSignals.length > 0) {
            const seenUrls = new Set<string>([
                ...staticRoutes.map(r => r.url),
                ...categoryRoutes.map(r => r.url),
                ...topicRoutes.map(r => r.url),
                ...authorRoutes.map(r => r.url),
            ]);

            for (const signal of allSignals) {
                if (!signal.headline) continue;
                const path = getNewsUrl(signal);
                const fullUrl = `${baseUrl}${path}`;

                if (!seenUrls.has(fullUrl)) {
                    seenUrls.add(fullUrl);
                    newsRoutes.push({
                        url: fullUrl,
                        lastModified: new Date(signal.generatedAt || Date.now()),
                        changeFrequency: 'weekly' as const,
                        priority: 0.75,
                    });
                }
            }
        }
    } catch (error) {
        console.error('Sitemap dynamic fetch error:', error);
    }

    return [
        ...staticRoutes,
        ...categoryRoutes,
        ...topicRoutes,
        ...authorRoutes,
        ...newsRoutes,
    ];
}
