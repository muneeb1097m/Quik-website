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

const BLOCKED_HOTLINK_DOMAINS = [
    'static01.nyt.com',
    'aljazeera.com',
    'www.aljazeera.com',
    'propakistani.pk',
];

const CATEGORY_SAFE_IMAGES: Record<string, string> = {
    'Pakistan': 'https://images.unsplash.com/photo-1568347877546-444654572239?q=80&w=1200&auto=format&fit=crop',
    'Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    'AI': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop',
    'Business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
    'Auto': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop',
    'Startups': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop',
    'Global': 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=1200&auto=format&fit=crop',
};

function getSafeImageUrl(url: string, category?: string): string {
    try {
        const parsed = new URL(url);
        if (BLOCKED_HOTLINK_DOMAINS.some(d => parsed.hostname.includes(d))) {
            const cat = category || 'Technology';
            return CATEGORY_SAFE_IMAGES[cat] || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format&fit=crop';
        }
    } catch {}
    return url;
}

export async function GET() {
    const baseUrl = getBaseUrl();

    let articles: any[] = [];
    try {
        const { data, error } = await supabase
            .from('Signal')
            .select('id, headline, summary, imageUrl, generatedAt, event:NewsEvent(category)')
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
            const category = signal.event?.category || 'Technology';
            const imageUrl = getSafeImageUrl(signal.imageUrl.trim(), category);
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
