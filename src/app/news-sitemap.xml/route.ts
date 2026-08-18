import { NextResponse } from 'next/server';
import { supabase } from '@/lib/qie/db';
import { getNewsUrl, decodeHtmlEntities, stripHtml } from '@/lib/utils';
import { getBaseUrl } from '@/lib/seo';

export const revalidate = 1800; // Revalidate every 30 minutes for Google News

function escapeXml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export async function GET() {
    const baseUrl = getBaseUrl();
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    let articles: any[] = [];
    try {
        const { data, error } = await supabase
            .from('Signal')
            .select('id, headline, generatedAt')
            .gte('generatedAt', fortyEightHoursAgo)
            .order('generatedAt', { ascending: false })
            .limit(200);

        if (!error && data) {
            articles = data;
        }
    } catch (e) {
        console.error('Error fetching news sitemap articles:', e);
    }

    const xmlItems = articles
        .map((signal) => {
            const path = getNewsUrl(signal);
            const fullUrl = `${baseUrl}${path}`;
            const cleanTitle = escapeXml(decodeHtmlEntities(stripHtml(signal.headline || 'Breaking News')));
            const pubDate = new Date(signal.generatedAt || Date.now()).toISOString();

            return `  <url>
    <loc>${fullUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>Quik News</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${cleanTitle}</news:title>
    </news:news>
  </url>`;
        })
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${xmlItems}
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600',
        },
    });
}
