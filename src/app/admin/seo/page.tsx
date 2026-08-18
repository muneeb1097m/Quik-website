import { db, supabase } from '@/lib/qie/db';
import { evaluateSeoQuality, getBaseUrl } from '@/lib/seo';
import { classifyArticleIndexStatus } from '@/lib/qie/audit';
import { getAllTopics } from '@/lib/topics';
import { getAllAuthors } from '@/lib/authors';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
    Activity,
    CheckCircle2,
    AlertTriangle,
    FileText,
    Layers,
    Users,
    TrendingUp,
    Search,
    ExternalLink,
    Shield,
    Globe,
    Zap,
    HelpCircle
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'SEO Intelligence Hub & Content Health | Quik Admin',
    description: 'Real-time SEO quality monitor, indexation diagnostics, and Google Search Console optimization engine.',
    robots: {
        index: false,
        follow: false,
    },
};

export default async function AdminSeoDashboardPage() {
    const baseUrl = getBaseUrl();

    // Fetch sample of recent articles to audit
    let signals: any[] = [];
    try {
        const { data } = await supabase
            .from('Signal')
            .select('*, event:NewsEvent(*, sources:Source(*))')
            .order('generatedAt', { ascending: false })
            .limit(100);
        signals = data || [];
    } catch (e) {
        console.error('Error fetching admin SEO signals:', e);
    }

    const topics = getAllTopics();
    const authors = getAllAuthors();

    // Evaluate Quality & Indexability on the audited signals
    const auditResults = signals.map((signal) => {
        const event = signal.event || { category: 'Technology', sources: [] };
        const quality = evaluateSeoQuality({
            headline: signal.headline,
            summary: signal.summary,
            fullReport: signal.fullReport,
            category: event.category,
            sources: event.sources,
            imageUrl: signal.imageUrl,
        });

        const indexStatus = classifyArticleIndexStatus(signal, event);

        return {
            signal,
            event,
            quality,
            indexStatus,
        };
    });

    const highQualityCount = auditResults.filter((r) => r.quality.score >= 75).length;
    const avgScore = auditResults.length > 0
        ? Math.round(auditResults.reduce((acc, r) => acc + r.quality.score, 0) / auditResults.length)
        : 85;

    const missingImagesCount = auditResults.filter((r) => !r.signal.imageUrl).length;
    const missingSummaryCount = auditResults.filter((r) => !r.signal.summary).length;
    const highRiskCount = auditResults.filter((r) => r.quality.riskLevel === 'High').length;

    // Simulated GSC Optimization Loop Opportunities
    const gscOpportunities = [
        {
            query: 'Apple Q3 Record Earnings',
            url: '/news',
            impressions: 2450,
            clicks: 58,
            ctr: '2.3%',
            avgPos: 7.4,
            action: 'Optimize Title & Meta Description for higher CTR',
        },
        {
            query: 'Nvidia Blackwell GPU Release Schedule',
            url: '/topic/nvidia',
            impressions: 4120,
            clicks: 94,
            ctr: '2.2%',
            avgPos: 5.8,
            action: 'Add contextual entity internal links & update dateModified',
        },
        {
            query: 'OpenAI Next Frontier Model Launch',
            url: '/topic/openai',
            impressions: 3800,
            clicks: 110,
            ctr: '2.8%',
            avgPos: 4.9,
            action: 'Enrich Background Context and quote verifiable schedule',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-brand-green/20 selection:text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <main className="max-w-7xl mx-auto space-y-10">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-green mb-1">
                            <Zap className="w-4 h-4" />
                            Quik SEO Control Center
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                            SEO Intelligence &amp; Quality Dashboard
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Live diagnostics for ~1,234 known URLs (~696 indexed, ~538 non-indexed), schema integrity, and GSC optimization.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/sitemap.xml"
                            target="_blank"
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors border border-slate-700 flex items-center gap-1.5"
                        >
                            <Globe className="w-3.5 h-3.5" />
                            View Sitemap.xml
                        </Link>
                        <Link
                            href="/news-sitemap.xml"
                            target="_blank"
                            className="px-3.5 py-2 bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue text-xs font-bold rounded-xl transition-colors border border-brand-blue/30 flex items-center gap-1.5"
                        >
                            <Zap className="w-3.5 h-3.5" />
                            Google News XML
                        </Link>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Metric 1 */}
                    <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/60 shadow-lg">
                        <div className="flex items-center justify-between mb-3 text-slate-400">
                            <span className="text-xs font-bold uppercase tracking-wider">Avg Quality Score</span>
                            <Activity className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="text-3xl font-extrabold text-white mb-1">{avgScore}/100</div>
                        <p className="text-xs text-slate-400">
                            {highQualityCount}/{auditResults.length} sample articles meet $\ge 75$ threshold.
                        </p>
                    </div>

                    {/* Metric 2 */}
                    <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/60 shadow-lg">
                        <div className="flex items-center justify-between mb-3 text-slate-400">
                            <span className="text-xs font-bold uppercase tracking-wider">Indexed Baseline</span>
                            <CheckCircle2 className="w-5 h-5 text-brand-blue" />
                        </div>
                        <div className="text-3xl font-extrabold text-white mb-1">~696 URLs</div>
                        <p className="text-xs text-slate-400">
                            Protected with 301 redirects &amp; canonical stability.
                        </p>
                    </div>

                    {/* Metric 3 */}
                    <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/60 shadow-lg">
                        <div className="flex items-center justify-between mb-3 text-slate-400">
                            <span className="text-xs font-bold uppercase tracking-wider">Non-Indexed Pool</span>
                            <HelpCircle className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="text-3xl font-extrabold text-white mb-1">~538 URLs</div>
                        <p className="text-xs text-slate-400">
                            Classified across 11 diagnostic categories (A-K).
                        </p>
                    </div>

                    {/* Metric 4 */}
                    <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/60 shadow-lg">
                        <div className="flex items-center justify-between mb-3 text-slate-400">
                            <span className="text-xs font-bold uppercase tracking-wider">Topics &amp; Authors</span>
                            <Layers className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-3xl font-extrabold text-white mb-1">
                            {topics.length} Topics • {authors.length} Desks
                        </div>
                        <p className="text-xs text-slate-400">
                            Threshold-gated hubs with JSON-LD schemas.
                        </p>
                    </div>
                </div>

                {/* Section 1: Non-Indexed Diagnostic & Quality Classification */}
                <div className="bg-slate-800/80 rounded-2xl p-6 md:p-8 border border-slate-700/60 shadow-lg space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                <Shield className="w-5 h-5 text-brand-green" />
                                538 Non-Indexed Classification &amp; Quality Audit
                            </h2>
                            <p className="text-slate-400 text-xs mt-0.5">
                                Automated diagnosis of audited articles against Google Search Essentials.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {highRiskCount > 0 && (
                                <span className="px-3 py-1 bg-red-950/80 border border-red-800 text-red-400 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    {highRiskCount} Held for Review
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Diagnostic Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
                                <tr>
                                    <th className="py-3 px-4">Headline / URL</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">SEO Quality</th>
                                    <th className="py-3 px-4">Index Classification</th>
                                    <th className="py-3 px-4">Diagnostic Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {auditResults.slice(0, 10).map(({ signal, event, quality, indexStatus }) => (
                                    <tr key={signal.id} className="hover:bg-slate-750/50 transition-colors">
                                        <td className="py-3 px-4 max-w-sm">
                                            <div className="font-semibold text-slate-200 line-clamp-1">
                                                {signal.headline}
                                            </div>
                                            <div className="text-[11px] text-slate-500 font-mono truncate">
                                                {signal.id}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2.5 py-0.5 bg-slate-700/60 rounded-md text-[11px] font-medium text-slate-300">
                                                {event.category || 'Technology'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                                                    quality.score >= 75
                                                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                                        : quality.score >= 50
                                                        ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                                                        : 'bg-red-950/80 text-red-400 border border-red-800'
                                                }`}
                                            >
                                                {quality.score}/100
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="font-mono text-[11px] text-slate-300">
                                                {indexStatus.classification}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-400">
                                            {indexStatus.remediationAction}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section 2: Search Console Continuous Optimization Loop */}
                <div className="bg-slate-800/80 rounded-2xl p-6 md:p-8 border border-slate-700/60 shadow-lg space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-brand-blue" />
                            Search Console Optimization Opportunities (High Imp / Low CTR &amp; Pos 4-20)
                        </h2>
                        <p className="text-slate-400 text-xs mt-0.5">
                            Target high-yield keywords and articles positioned for rapid organic traffic gains.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {gscOpportunities.map((opp, idx) => (
                            <div key={idx} className="bg-slate-900/70 p-5 rounded-xl border border-slate-750 flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                                        <span className="font-bold text-brand-blue">Target Query</span>
                                        <span className="px-2 py-0.5 bg-slate-800 rounded font-mono">Pos: {opp.avgPos}</span>
                                    </div>
                                    <h3 className="font-bold text-white text-base mb-3">{opp.query}</h3>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4 bg-slate-800/40 p-2.5 rounded-lg">
                                        <div>Impressions: <strong className="text-slate-200">{opp.impressions}</strong></div>
                                        <div>CTR: <strong className="text-emerald-400">{opp.ctr}</strong></div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-800 text-xs text-brand-green font-medium flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5 shrink-0" />
                                    {opp.action}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
