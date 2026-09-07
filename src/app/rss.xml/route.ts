import { NextResponse } from 'next/server';
import { supabase } from '@/lib/qie/db';
import { getNewsUrl, decodeHtmlEntities, stripHtml } from '@/lib/utils';
import { getBaseUrl } from '@/lib/seo';

export const revalidate = 1800; // Cache for 30 minutes

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

    let articles: any[] = [];
    try {
        const { data, error } = await supabase
            .from('Signal')
            .select('id, headline, summary, imageUrl, generatedAt')
            .not('imageUrl', 'is', null)
            .order('generatedAt', { ascending: false })
            .limit(100);

        if (!error && data) {
            articles = data;
        }
    } catch (e) {
        console.error('Error fetching articles for RSS feed:', e);
    }

    const itemsXml = articles
        .map((signal) => {
            const path = getNewsUrl(signal);
            const fullUrl = `${baseUrl}${path}`;
            const cleanTitle = escapeXml(decodeHtmlEntities(stripHtml(signal.headline || 'Breaking News')));
            const cleanSummary = escapeXml(decodeHtmlEntities(stripHtml(signal.summary || signal.headline || '')));
            const pubDate = new Date(signal.generatedAt || Date.now()).toUTCString();
            const imageUrl = signal.imageUrl ? escapeXml(signal.imageUrl) : '';

            return `    <item>
      <title>${cleanTitle}</title>
      <link>${fullUrl}</link>
      <guid isPermaLink="true">${fullUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${cleanSummary}</description>
      ${imageUrl ? `<enclosure url="${imageUrl}" type="image/jpeg" length="0" />` : ''}
      ${imageUrl ? `<media:content url="${imageUrl}" medium="image" />` : ''}
    </item>`;
        })
        .join('\n');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Quik News</title>
    <link>${baseUrl}</link>
    <description>Real-time AI-powered global news and breaking headlines.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=86400',
        },
    });
}
