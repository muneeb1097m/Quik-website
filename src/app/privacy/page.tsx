import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Quik News',
    description: 'Privacy Policy for Quik News. Learn how we collect, use, and protect your data.',
    alternates: {
        canonical: 'https://www.quiknews.online/privacy',
    },
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <main className="max-w-4xl mx-auto px-6 pt-40 pb-20">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
                <p className="text-slate-500 mb-12">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <div className="prose prose-lg prose-slate max-w-none bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            Welcome to Quik News ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website quiknews.online (the "Site"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            We collect information that serves to improve our services and user experience.
                        </p>

                        <h3 className="text-xl font-bold text-slate-800 mb-2 mt-6">A. Personal Data</h3>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            While using our Site, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you, such as your email address (if you subscribe to our newsletter). We do not collect sensitive personal data such as financial information or social security numbers.
                        </p>

                        <h3 className="text-xl font-bold text-slate-800 mb-2 mt-6">B. Derivatives & Usage Data</h3>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            Our servers automatically collect information when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Use of Your Information</h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. We use information collected via the Site to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600">
                            <li>Create and manage your account.</li>
                            <li>Compile anonymous statistical data and analysis for use internally.</li>
                            <li>Deliver targeted advertising, coupons, newsletters, and other information regarding promotions.</li>
                            <li>Email you regarding your account or order.</li>
                            <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                            <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Disclosure of Your Information</h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600">
                            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
                            <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including data analysis (e.g. Vercel Analytics), email delivery, hosting services, and customer service.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Cookies and Tracking</h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            We use cookies, web beacons, tracking pixels, and other tracking technologies on the Site to help customize the Site and improve your experience. When you access the Site, your personal information is not collected through the use of tracking technology. Most browsers are set to accept cookies by default. You can remove or reject cookies, but be aware that such action could affect the availability and functionality of the Site.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Security of Your Information</h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Contact Us</h2>
                        <p className="text-slate-600 leading-relaxed">
                            If you have questions or comments about this privacy policy, please contact us at: <a href="mailto:support@quiknews.online" className="text-brand-blue hover:text-brand-red underline">support@quiknews.online</a>
                        </p>
                    </section>

                </div>
            </main>
        </div>
    );
}
