import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | Quik News',
    description: 'Terms of Service for Quik News. Please read our terms and conditions carefully.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white">
            <main className="max-w-4xl mx-auto px-6 py-24">
                <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>
                <p className="text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <div className="prose prose-slate max-w-none pb-12">
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Agreement to Terms</h2>
                        <p className="text-slate-600 mb-4">
                            These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Quik News ("we," "us" or "our"),
                            concerning your access to and use of the quik.news website. By accessing the Site, you read, understood, and agree to be bound by all of these Terms of Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Intellectual Property Rights</h2>
                        <p className="text-slate-600 mb-4">
                            Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content")
                            and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Automated News Aggregation</h2>
                        <p className="text-slate-600 mb-4">
                            Quik News utilizes artificial intelligence to aggregate and synthesize news from various public sources. While we strive for accuracy, we cannot guarantee the complete accuracy, reliability, or timeliness of the synthesized content.
                            The original sources are cited where applicable, and we claim no ownership over the original reporting from third-party sources.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Limitation of Liability</h2>
                        <p className="text-slate-600 mb-4">
                            In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages,
                            including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Contact Us</h2>
                        <p className="text-slate-600">
                            In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at support@quik.news.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
