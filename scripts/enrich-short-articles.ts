import 'dotenv/config';
import { supabase } from '@/lib/qie/db';
import { GeminiSynthesizer } from '@/lib/qie/gemini';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function enrichShortArticles() {
    const args = process.argv.slice(2);
    const limitArg = args.find(a => a.startsWith('--limit='));
    const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 25;
    const maxWords = 350;

    console.log(`=== Scanning for articles with < ${maxWords} words (Target: up to ${limit}) ===`);

    const { data: signals, error } = await supabase
        .from('Signal')
        .select('id, headline, summary, fullReport, eventId, generatedAt')
        .order('generatedAt', { ascending: false })
        .limit(1000);

    if (error || !signals) {
        console.error('Failed to fetch signals from Supabase:', error);
        process.exit(1);
    }

    const shortSignals = signals.filter(s => {
        const words = (s.fullReport || '').split(/\s+/).filter(Boolean).length;
        return words < maxWords;
    });

    console.log(`Found ${shortSignals.length} short articles in total.`);
    const toProcess = shortSignals.slice(0, limit);
    console.log(`Processing top ${toProcess.length} most recent short articles...\n`);

    const synthesizer = new GeminiSynthesizer();
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < toProcess.length; i++) {
        const signal = toProcess[i];
        const oldWordCount = (signal.fullReport || '').split(/\s+/).filter(Boolean).length;
        const context = (signal.fullReport && signal.fullReport.length > 50) 
            ? signal.fullReport 
            : (signal.summary || signal.headline);

        console.log(`[${i + 1}/${toProcess.length}] Enriching: "${signal.headline}" (Current: ${oldWordCount} words)`);

        try {
            const enriched = await synthesizer.rewriteStory(signal.headline, context);
            const newWordCount = enriched.wordCount;

            const { error: updateError } = await supabase
                .from('Signal')
                .update({
                    summary: enriched.summary || signal.summary,
                    fullReport: enriched.fullReport,
                })
                .eq('id', signal.id);

            if (updateError) {
                console.error(`  ❌ Failed to update Supabase for "${signal.id}":`, updateError);
                failCount++;
            } else {
                console.log(`  ✅ Successfully updated! New word count: ${newWordCount} words (was ${oldWordCount}).`);
                successCount++;
            }
        } catch (err: any) {
            console.error(`  ❌ Synthesis error:`, err?.message || err);
            failCount++;
        }

        // Polite delay between AI calls to prevent rate limits
        await delay(1200);
    }

    console.log(`\n=== Enrichment Complete ===`);
    console.log(`Successfully upgraded: ${successCount}`);
    console.log(`Failed/Skipped: ${failCount}`);
    console.log(`Remaining short articles: ${shortSignals.length - successCount}`);
}

enrichShortArticles()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
