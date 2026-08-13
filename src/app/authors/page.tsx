import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Our Team | Quik',
    description: 'Meet the team and AI behind Quik News.',
    alternates: {
        canonical: 'https://www.quiknews.online/authors',
    },
};

export default function AuthorsPage() {
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
                    <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-snug">
                        The humans and machines behind your daily intelligence.
                    </h1>
                </div>

                {/* Team Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Founder / Human Editor */}
                    <div className="bg-white border border-slate-200/80 rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/40 flex flex-col justify-between hover:shadow-2xl hover:border-slate-300 transition-all duration-300 group">
                        <div>
                            <div className="flex items-center gap-6 mb-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
                                    M
                                </div>
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Muneeb</h2>
                                    <p className="text-blue-600 font-bold text-sm mt-1">Founder &amp; Editor-in-Chief</p>
                                </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-8 font-medium">
                                Tech entrepreneur and full-stack engineer passionate about information density. Muneeb built Quik to solve the problem of &quot;doomscrolling&quot; by using AI to extract only the most valuable signals from the global noise.
                            </p>
                        </div>
                        <div className="flex gap-6 items-center pt-4 border-t border-slate-100">
                            <a
                                href="https://x.com/quik_news"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                Twitter / X
                            </a>
                            <a
                                href="https://www.linkedin.com/company/quik-official"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                LinkedIn
                            </a>
                        </div>
                    </div>

                    {/* AI Editor */}
                    <div className="bg-white border border-slate-200/80 rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/40 flex flex-col justify-between hover:shadow-2xl hover:border-slate-300 transition-all duration-300 group">
                        <div>
                            <div className="flex items-center gap-6 mb-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-pink-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-purple-500/20 shrink-0 group-hover:scale-105 transition-transform">
                                    AI
                                </div>
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quik AI</h2>
                                    <p className="text-purple-600 font-bold text-sm mt-1">Head of Synthesis</p>
                                </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-8 font-medium">
                                Powered by Google&apos;s Gemini 1.5 Flash, Quik AI processes millions of data points daily. It never sleeps, has no political bias, and is optimized purely for finding the &quot;So What?&quot; in every story.
                            </p>
                        </div>
                        <div className="flex gap-4 items-center pt-4 border-t border-slate-100">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold shadow-sm">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Online Now
                            </span>
                        </div>
                    </div>
                </div>

                {/* Join Us Banner */}
                <div className="bg-white border border-slate-200/80 rounded-[2rem] p-10 md:p-14 text-center shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Want to join us?</h3>
                    <p className="text-slate-500 text-base md:text-lg mb-8 font-medium max-w-xl mx-auto">
                        We are looking for human editors to work alongside our AI.
                    </p>
                    <a
                        href="mailto:jobs@quiknews.online"
                        className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-base rounded-xl transition-all shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Apply Now
                    </a>
                </div>
            </div>
        </main>
    );
}
