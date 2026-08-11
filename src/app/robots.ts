import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://quiknews.online').replace(/\/$/, '');
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/api/*', '/_next/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
