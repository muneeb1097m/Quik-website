import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Quik News',
    description: 'Privacy Policy for Quik News. Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            <main className="max-w-4xl mx-auto px-6 py-24">
                <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
                <p className="text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <div className="prose prose-slate max-w-none pb-12">
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Introduction</h2>
                        <p className="text-slate-600 mb-4">
                            Welcome to Quik News ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website quik.news.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Information We Collect</h2>
                        <p className="text-slate-600 mb-4">
                            We collect information that serves to improve our services and user experience.
                        </p>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">Usage Data</h3>
                        <p className="text-slate-600 mb-4">
                            We may automatically collect certain information when you visit, use, or navigate the Website. This information does not reveal your specific identity (like your name or contact information)
                            but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location,
                            information about how and when you use our Website, and other technical information.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-5 text-slate-600 space-y-2">
                            <li>To facilitate account creation and logon process.</li>
                            <li>To send you administrative information.</li>
                            <li>To protect our Services.</li>
                            <li>To improve our website functionality and user experience through analytics.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Third-Party Services</h2>
                        <p className="text-slate-600 mb-4">
                            We may share information with third parties that perform services for us or on our behalf, including:
                        </p>
                        <ul className="list-disc pl-5 text-slate-600 space-y-2">
                            <li><strong>Vercel Analytics:</strong> To understand user behavior and improve website performance.</li>
                            <li><strong>AI Providers:</strong> To synthesize and process news content.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Contact Us</h2>
                        <p className="text-slate-600">
                            If you have questions or comments about this policy, you may email us at support@quik.news.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
