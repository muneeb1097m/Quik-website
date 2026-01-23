import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | Quik News',
    description: 'Terms of Service for Quik News. Please read our terms and conditions carefully.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <main className="max-w-4xl mx-auto px-6 pt-40 pb-20">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Terms of Service</h1>
                <p className="text-slate-500 mb-12">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <div className="prose prose-lg prose-slate max-w-none bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Agreement to Terms</h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Quik News ("we," "us" or "our"), concerning your access to and use of the Quik News website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these terms of service, then you are expressly prohibited from using the Site and you must discontinue use immediately.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Intellectual Property Rights</h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws of the United States, international copyright laws, and international conventions.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            The Content and the Marks are provided on the Site "AS IS" for your information and personal use only. Except as expressly provided in these Terms of Service, no part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. AI-Generated Content & Accuracy</h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            Quik News utilizes advanced artificial intelligence (AI) technologies to aggregate, synthesize, and summarize news from various public sources. While we employ sophisticated verification algorithms and confidence scoring mechanisms, you acknowledge that:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-4">
                            <li>The content generated is automated and may occasionally contain inaccuracies, hallucinations, or errors.</li>
                            <li>Summaries are interpretations of third-party reporting and do not reflect the opinions of Quik News.</li>
                            <li>We do not independently verify every single fact presented in the real-time feed.</li>
                        </ul>
                        <p className="text-slate-600 leading-relaxed">
                            We cannot guarantee the complete accuracy, reliability, or timeliness of the synthesized content. Users should verify critical information through official sources.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. User Representations</h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            By using the Site, you represent and warrant that:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600">
                            <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                            <li>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise, except for standard search engine indexing.</li>
                            <li>You will not use the Site for any illegal or unauthorized purpose.</li>
                            <li>Your use of the Site will not violate any applicable law or regulation.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Disclaimer</h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SITE AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SITE AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Limitation of Liability</h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SITE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Modifications to Terms</h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. We also reserve the right to modify these Terms of Service at any time. All changes are effective immediately when we post them, and you waive any right to receive specific notice of each such change.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Contact Us</h2>
                        <p className="text-slate-600 leading-relaxed">
                            In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <a href="mailto:support@quik.news" className="text-brand-blue hover:text-brand-red underline">support@quik.news</a>
                        </p>
                    </section>

                </div>
            </main>
        </div>
    );
}
