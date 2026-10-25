import { db } from '@/lib/qie/db';
import { getAllTopics } from '@/lib/topics';
import { getNewsUrl, decodeHtmlEntities } from '@/lib/utils';
import Link from 'next/link';
import { Layers, Newspaper, Sparkles, ChevronRight, ShieldCheck, ArrowRight, FolderTree } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 43200; // 12-hour cache

export const metadata: Metadata = {
    title: 'Quik News Directory & HTML Sitemap | Quik',
    description: 'Explore the complete directory of news desks, topic intelligence hubs, editorial archives, and primary sections across Quik News.',
    openGraph: {
        title: 'Quik News Directory & HTML Sitemap | Quik',
        description: 'Explore the complete directory of news desks, topic intelligence hubs, editorial archives, and primary sections across Quik News.',
        url: 'https://www.quiknews.online/site-directory',
        type: 'website',
        images: [
            {
                url: 'https://www.quiknews.online/og-default.png',
                width: 1200,
                height: 630,
                alt: 'Quik News Directory & HTML Sitemap',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Quik News Directory & HTML Sitemap | Quik',
        description: 'Explore the complete directory of news desks, topic intelligence hubs, editorial archives, and primary sections across Quik News.',
        images: ['https://www.quiknews.online/og-default.png'],
    },
    alternates: {
        canonical: 'https://www.quiknews.online/site-directory',
    },
};

const NEWS_DESKS = [
    { name: 'Latest Breaking News', href: '/news', desc: 'Real-time global intelligence feed across all beats' },
    { name: 'Technology', href: '/tech', desc: 'Hardware, software, enterprise IT, and breakthrough science' },
    { name: 'Business & Markets', href: '/business', desc: 'Macroeconomics, central banks, stocks, and venture capital' },
    { name: 'Artificial Intelligence', href: '/ai', desc: 'Autonomous agents, foundation models, and machine learning' },
    { name: 'Global Affairs', href: '/global', desc: 'Geopolitics, diplomacy, international agreements, and trade' },
    { name: 'Automotive & EV', href: '/auto', desc: 'Next-gen mobility, electric vehicles, and autonomous driving' },
    { name: 'Startup Pakistan', href: '/pakistan', desc: 'Emerging tech hubs, funding rounds, and startup ecosystems' },
    { name: 'Sports Intelligence', href: '/sports', desc: 'Global athletics, tournament breakdowns, and sports business' },
    { name: 'Historical News Archive', href: '/archive', desc: 'Complete historical timeline of AI-verified news reports' },
];

const INSTITUTIONAL_PAGES = [
    { name: 'About Quik News', href: '/about', desc: 'Mission, architecture, and the future of autonomous journalism' },
    { name: 'Editorial & Verification Team', href: '/authors', desc: 'Meet our editorial desks and fact-checking specialists' },
    { name: 'Quik Editorial Desk Profile', href: '/author/quik-editorial-team', desc: 'Autonomous newsroom intelligence & verification byline' },
    { name: 'Editorial & Fact-Checking Policy', href: '/editorial-policy', desc: 'Standards for verification, sourcing, and AI disclosures' },
    { name: 'Privacy Policy', href: '/privacy', desc: 'How we collect, handle, and protect user data' },
    { name: 'Terms of Service', href: '/terms', desc: 'Terms governing access and usage of the Quik platform' },
];

export default async function SiteDirectoryPage() {
    const topics = getAllTopics();
    const latestArticles = await db.getSignals(undefined, 24);

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-green/20 selection:text-slate-900">
            {/* Top Bar Navigation */}
            <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="font-extrabold text-slate-900 text-lg hover:text-brand-blue transition-colors">
                    Quik News
                </Link>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:block">
                    HTML Site Directory &amp; Crawl Index
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
                {/* Header Section */}
                <div className="mb-14 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-wider mb-4">
                        <FolderTree className="w-3.5 h-3.5" />
                        Comprehensive Site Architecture
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                        Quik News Directory &amp; Sitemap
                    </h1>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                        An interconnected index of all news desks, specialized topic intelligence hubs, editorial policies, and live reporting signals.
                    </p>
                </div>

                {/* Grid of Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    {/* News Desks */}
                    <section className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                                <Newspaper className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">News Desks &amp; Beat Coverage</h2>
                                <p className="text-xs text-slate-500">Core categories updated in real-time</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                            {NEWS_DESKS.map((desk) => (
                                <Link
                                    key={desk.href}
                                    href={desk.href}
                                    className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-all group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors flex items-center justify-between text-sm mb-1">
                                            {desk.name}
                                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                        <p className="text-xs text-slate-500 leading-normal">{desk.desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Topic Intelligence Hubs */}
                    <section className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <Layers className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Topic Intelligence Hubs</h2>
                                <p className="text-xs text-slate-500">Dedicated entity feeds &amp; deep taxonomy</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                            {topics.map((topic) => (
                                <Link
                                    key={topic.slug}
                                    href={`/topic/${topic.slug}`}
                                    className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-all group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors flex items-center justify-between text-sm mb-1">
                                            #{topic.name}
                                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-normal">{topic.description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Institutional & Editorial Pages */}
                <section className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs mb-16">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Institutional Governance &amp; Editorial Transparency</h2>
                            <p className="text-xs text-slate-500">Corporate disclosures, policies, and authorship standards</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {INSTITUTIONAL_PAGES.map((page) => (
                            <Link
                                key={page.href}
                                href={page.href}
                                className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-all group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors flex items-center justify-between text-sm mb-1">
                                        {page.name}
                                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                    <p className="text-xs text-slate-500 leading-normal">{page.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Recent Intelligence Signals Index */}
                {latestArticles && latestArticles.length > 0 && (
                    <section className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Recent Breaking Intelligence Signals</h2>
                                    <p className="text-xs text-slate-500">Latest autonomous reports across global networks</p>
                                </div>
                            </div>
                            <Link
                                href="/news"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:underline"
                            >
                                View All News
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {latestArticles.map((article: any) => (
                                <Link
                                    key={article.id}
                                    href={getNewsUrl(article)}
                                    className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-all group flex flex-col justify-between"
                                >
                                    <h3 className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors text-sm line-clamp-2 leading-snug mb-2">
                                        {decodeHtmlEntities(article.headline)}
                                    </h3>
                                    <div className="text-[11px] text-slate-400 font-medium mt-auto" suppressHydrationWarning>
                                        {new Date(article.generatedAt || Date.now()).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
