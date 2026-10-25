import 'dotenv/config';
import { supabase } from '../src/lib/qie/db';
import { getNewsUrl } from '../src/lib/utils';
import { TOPICS } from '../src/lib/topics';

async function submitSitemaps() {
    console.log('🚀 Starting Sitemap & URL Submission to Search Engines...\n');

    const host = 'www.quiknews.online';
    const key = '83b4c92a5d9146df';
    const keyLocation = `https://${host}/${key}.txt`;

    const sitemaps = [
        `https://${host}/sitemap.xml`,
        `https://${host}/news-sitemap.xml`
    ];

    // 1. Collect Core URLs
    const coreUrls = [
        `https://${host}/`,
        `https://${host}/news`,
        `https://${host}/site-directory`,
        `https://${host}/tech`,
        `https://${host}/business`,
        `https://${host}/ai`,
        `https://${host}/global`,
        `https://${host}/auto`,
        `https://${host}/pakistan`,
        `https://${host}/sports`,
        `https://${host}/archive`,
        `https://${host}/about`,
        `https://${host}/editorial-policy`,
        `https://${host}/authors`,
        `https://${host}/author/quik-editorial-team`,
        `https://${host}/author/muneeb`,
        `https://${host}/author/tech-desk`,
        `https://${host}/author/markets-desk`,
        `https://${host}/privacy`,
        `https://${host}/terms`,
    ];

    // 2. Add Topic URLs
    const topicUrls = Object.keys(TOPICS).map(slug => `https://${host}/topic/${slug}`);

    // 3. Fetch Recent Signal URLs from DB
    console.log('📦 Fetching latest articles from database...');
    const { data: signals, error } = await supabase
        .from('Signal')
        .select('id, headline, generatedAt')
        .order('generatedAt', { ascending: false })
        .limit(100);

    const articleUrls: string[] = [];
    if (signals && signals.length > 0) {
        for (const s of signals) {
            articleUrls.push(`https://${host}${getNewsUrl(s)}`);
        }
    }
    console.log(`Found ${articleUrls.length} recent news articles.`);

    const allUrls = Array.from(new Set([...coreUrls, ...topicUrls, ...articleUrls]));
    console.log(`Total URLs prepared for submission: ${allUrls.length}\n`);

    // 4. Submit to IndexNow (Bing, Yandex, Seznam, Naver)
    const indexNowEndpoints = [
        'https://api.indexnow.org/indexnow',
        'https://www.bing.com/indexnow',
        'https://yandex.com/indexnow'
    ];

    for (const endpoint of indexNowEndpoints) {
        try {
            console.log(`📡 Submitting ${allUrls.length} URLs to IndexNow at ${endpoint}...`);
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify({
                    host,
                    key,
                    keyLocation,
                    urlList: allUrls
                })
            });

            console.log(`   Result: HTTP ${res.status} ${res.statusText}`);
            if (res.status === 200 || res.status === 202) {
                console.log(`   ✅ Successfully submitted to ${endpoint}`);
            } else {
                const text = await res.text();
                console.log(`   ℹ️ Response details:`, text || 'None');
            }
        } catch (e: any) {
            console.error(`   ❌ Failed to ping ${endpoint}:`, e.message);
        }
    }

    // 5. Ping Search Engine Sitemap Endpoints
    console.log('\n📡 Pinging Search Engine Sitemap Endpoints...');
    for (const sitemapUrl of sitemaps) {
        // Bing Ping
        try {
            const bingPing = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
            const res = await fetch(bingPing);
            console.log(`   Bing Ping (${sitemapUrl.split('/').pop()}): HTTP ${res.status}`);
        } catch (e: any) {
            console.log(`   Bing Ping error:`, e.message);
        }

        // Google Ping (Notice: Google deprecated public ping endpoint in late 2023, but we log the status)
        try {
            const googlePing = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
            const res = await fetch(googlePing);
            console.log(`   Google Ping (${sitemapUrl.split('/').pop()}): HTTP ${res.status}`);
        } catch (e: any) {
            console.log(`   Google Ping error:`, e.message);
        }
    }

    console.log('\n🎉 Sitemap and IndexNow Submission Process Completed!');
}

submitSitemaps().catch(err => {
    console.error('Fatal submission error:', err);
    process.exit(1);
});
