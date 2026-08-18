import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllAuthors } from '@/lib/authors';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Editorial Team & Authors | Quik News',
    description: 'Meet the editorial desks, journalists, and intelligence systems behind Quik News.',
    alternates: {
        canonical: 'https://www.quiknews.online/authors',
    },
};

export default function AuthorsDirectoryPage() {
    const authors = getAllAuthors();

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 pt-36 md:pt-44 pb-24 px-4 sm:px-6 lg:px-8 selection:bg-brand-green/20 selection:text-slate-900 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Heading */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200/60 text-slate-700 text-xs font-bold mb-4">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Transparent Editorial Architecture
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-snug">
                        Editorial Leadership &amp; Specialized Intelligence Desks
                    </h1>
                    <p className="text-slate-500 text-base md:text-lg mt-4 max-w-2xl mx-auto">
                        Learn about our editorial board, human leadership, and autonomous newsrooms dedicated to factual, high-signal reporting.
                    </p>
                </div>

                {/* Team Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {authors.map((author) => (
                        <div
                            key={author.slug}
                            className="bg-white border border-slate-200/80 rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/40 flex flex-col justify-between hover:shadow-2xl hover:border-slate-300 transition-all duration-300 group"
                        >
                            <div>
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center text-white text-2xl font-extrabold shadow-md shrink-0 group-hover:scale-105 transition-transform">
                                        {author.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                            {author.name}
                                        </h2>
                                        <p className="text-brand-blue font-bold text-sm mt-0.5">
                                            {author.role}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-6 font-medium">
                                    {author.bio}
                                </p>

                                <div className="flex flex-wrap gap-1.5 mb-6">
                                    {author.areasOfCoverage.map((area) => (
                                        <span
                                            key={area}
                                            className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-600"
                                        >
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <Link
                                    href={`/author/${author.slug}`}
                                    className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors"
                                >
                                    View Full Profile &amp; Articles
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Editorial Standards Card */}
                <div className="bg-white border border-slate-200/80 rounded-[2rem] p-8 md:p-12 text-center shadow-xl shadow-slate-200/40">
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
                        Our Commitment to Factual Integrity
                    </h3>
                    <p className="text-slate-500 text-base mb-6 max-w-xl mx-auto">
                        Every article on Quik is synthesized from verifiable global news sources with full attribution and human editorial oversight.
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Link
                            href="/editorial-policy"
                            className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-md"
                        >
                            Read Editorial Policy
                        </Link>
                        <Link
                            href="/about"
                            className="inline-flex items-center justify-center px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-sm rounded-xl transition-all shadow-sm"
                        >
                            About Quik Intelligence
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
