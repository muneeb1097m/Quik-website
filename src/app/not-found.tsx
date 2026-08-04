import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Page Not Found | Quik',
    description: 'The requested page could not be found on Quik News.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-24">
            <div className="text-center max-w-lg">
                <p className="text-sm font-bold text-brand-green tracking-widest uppercase mb-2">404 Error</p>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    Page Not Found
                </h1>
                <p className="text-slate-500 mb-8 text-base leading-relaxed">
                    Sorry, the page or article you are looking for does not exist, has been removed, or is temporarily unavailable.
                </p>
                <div className="flex justify-center gap-4">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-slate-900 text-white font-bold rounded-full shadow-md hover:bg-slate-800 transition-all"
                    >
                        Back to Home
                    </Link>
                    <Link
                        href="/archive"
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-900 font-bold rounded-full shadow-sm hover:shadow-md transition-all"
                    >
                        View Archive
                    </Link>
                </div>
            </div>
        </div>
    );
}
