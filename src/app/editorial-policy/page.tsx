import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Scale, CheckCircle2, AlertCircle, RefreshCw, FileText } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Editorial Policy & Standards | Quik News',
    description: 'Our commitment to journalistic accuracy, multi-source verification, ethical AI synthesis, transparency, and error corrections.',
    alternates: {
        canonical: 'https://www.quiknews.online/editorial-policy',
    },
};

export default function EditorialPolicyPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 pt-36 md:pt-44 pb-24 px-4 sm:px-6 lg:px-8 selection:bg-brand-green/20 selection:text-slate-900 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-4">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Editorial Standards &amp; Trust Guidelines
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                        Editorial Policy, Verification &amp; AI Transparency
                    </h1>
                    <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                        At Quik News, we operate a hybrid newsroom that couples autonomous real-time signal extraction with rigorous editorial principles: factual accuracy, multi-source verification, transparent attribution, and ethical AI deployment.
                    </p>
                </div>

                <div className="space-y-10">
                    {/* Section 1: AI & Editorial Oversight */}
                    <section className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4 text-brand-blue">
                            <Scale className="w-6 h-6" />
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                1. AI-Assisted Synthesis &amp; Editorial Oversight
                            </h2>
                        </div>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Quik uses advanced AI models to scan, extract, and synthesize real-time data from 50+ accredited global news feeds. Our systems are engineered with strict editorial boundaries:
                        </p>
                        <ul className="space-y-3 text-slate-700 text-sm md:text-base">
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <span><strong>Anti-Hallucination Guardrails:</strong> AI is never permitted to invent facts, create quotes, or fabricate sources. Every article is grounded in verifiable external reporting.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <span><strong>Fact-Based Next Steps:</strong> Analysis regarding future developments is strictly restricted to confirmed public schedules, legal deadlines, or official press announcements. Unsubstantiated speculation is banned.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <span><strong>Human Editorial Leadership:</strong> Editorial governance, taxonomy guidelines, and risk policies are set by human editors led by our Founder &amp; Editor-in-Chief.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 2: Source Verification & Attribution */}
                    <section className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4 text-brand-blue">
                            <FileText className="w-6 h-6" />
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                2. Source Attribution &amp; Independent Verification
                            </h2>
                        </div>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Original reporting belongs to the journalists and media organizations that uncover it. We practice transparent attribution:
                        </p>
                        <ul className="space-y-3 text-slate-700 text-sm md:text-base">
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <span><strong>Clear Source Cards:</strong> Every story displays the primary reporting outlet(s) with direct links back to original publications.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <span><strong>Cross-Source Verification:</strong> Breaking events are corroborated across independent wire services (such as Reuters, Associated Press, BBC, Bloomberg) before cluster confirmation.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 3: Corrections & Updates */}
                    <section className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4 text-brand-blue">
                            <RefreshCw className="w-6 h-6" />
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                3. Corrections Policy &amp; Error Reporting
                            </h2>
                        </div>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            When factual inaccuracies occur, we correct them promptly with full transparency.
                        </p>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-sm text-slate-700">
                            <strong>How to report an error:</strong> If you identify a factual error, misattribution, or outdated signal, email our editorial desk at{' '}
                            <a href="mailto:corrections@quiknews.online" className="text-brand-blue font-bold hover:underline">
                                corrections@quiknews.online
                            </a>
                            . We review reports within 2 hours.
                        </div>
                        <p className="text-slate-600 text-xs leading-normal">
                            When an article undergoes a material factual revision, the updated timestamp and schema `dateModified` are updated to reflect the revision date.
                        </p>
                    </section>

                    {/* Section 4: High-Risk Topics & Editorial Neutrality */}
                    <section className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4 text-brand-blue">
                            <AlertCircle className="w-6 h-6" />
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                4. High-Risk Story Reviews &amp; Objectivity
                            </h2>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-sm md:text-base mb-4">
                            Stories involving legal disputes, conflict casualties, financial fraud, or unverified claims are routed through a high-risk evaluation gate. We strictly refrain from editorializing, sensationalism, clickbait, or partisan bias.
                        </p>
                    </section>
                </div>

                {/* Footer Note */}
                <div className="mt-12 text-center text-xs text-slate-500">
                    <p>Last Revised: August 2026 • Quik Editorial Board</p>
                    <p className="mt-1">
                        Questions regarding our editorial policy? Contact{' '}
                        <a href="mailto:editor@quiknews.online" className="text-brand-blue underline">
                            editor@quiknews.online
                        </a>
                    </p>
                </div>
            </div>
        </main>
    );
}
