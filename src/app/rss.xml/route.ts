import { NextResponse } from 'next/server';
import { supabase } from '@/lib/qie/db';
import { getNewsUrl, decodeHtmlEntities, stripHtml } from '@/lib/utils';
import { getBaseUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 600; // Cache for 10 minutes

function escapeXml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function getImageMimeType(url: string): string {
    const cleanUrl = url.toLowerCase().split('?')[0];
    if (cleanUrl.endsWith('.png')) return 'image/png';
    if (cleanUrl.endsWith('.webp')) return 'image/webp';
    if (cleanUrl.endsWith('.gif')) return 'image/gif';
    return 'image/jpeg';
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
            // Only include articles that actually have a valid HTTP(S) image
            articles = data.filter((item: any) => 
                typeof item.imageUrl === 'string' && 
                item.imageUrl.trim().startsWith('http')
            );
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
            const imageUrl = signal.imageUrl.trim();
            const mimeType = getImageMimeType(imageUrl);

            return `    <item>
      <title>${cleanTitle}</title>
      <link>${fullUrl}</link>
      <guid isPermaLink="true">${fullUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[<img src="${imageUrl}" alt="${decodeHtmlEntities(stripHtml(signal.headline || ''))}" /><p>${decodeHtmlEntities(stripHtml(signal.summary || ''))}</p>]]></description>
      <content:encoded><![CDATA[<img src="${imageUrl}" alt="${decodeHtmlEntities(stripHtml(signal.headline || ''))}" /><p>${decodeHtmlEntities(stripHtml(signal.summary || ''))}</p>]]></content:encoded>
      <enclosure url="${escapeXml(imageUrl)}" type="${mimeType}" length="250000" />
      <media:content url="${escapeXml(imageUrl)}" medium="image" type="${mimeType}" width="1200" height="675">
        <media:title type="plain">${cleanTitle}</media:title>
        <media:description type="plain">${cleanSummary}</media:description>
        <media:thumbnail url="${escapeXml(imageUrl)}" />
      </media:content>
      <media:thumbnail url="${escapeXml(imageUrl)}" />
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
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=600, s-maxage=600, stale-while-revalidate=86400',
        },
    });
}
