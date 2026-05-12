'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AppFooter() {
    return (
        <footer className="w-full bg-slate-50 border-t border-slate-200 mt-20">
            <div className="max-w-[1600px] mx-auto px-8 py-16">

                {/* Newsletter Signup Section */}
                <div className="bg-slate-900 rounded-3xl p-8 md:p-12 mb-16">
                    <div className="max-w-2xl mx-auto text-center">
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                            Get Daily Intelligence Updates
                        </h3>
                        <p className="text-slate-400 mb-8">
                            Join our community and receive personalized news based on your interests. Free. No spam.
                        </p>

                        <NewsletterForm />

                        <p className="text-xs text-slate-500 mt-4">
                            Free forever. No credit card required.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6 group">
                            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Quik News</span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Real-time global intelligence, synthesized by AI. Delivered with precision and speed from reliable sources.
                        </p>
                        <div className="flex gap-4">
                            {/* Static SVG for X (Twitter) */}
                            <SocialLink href="https://x.com/quik_news">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </SocialLink>
                            
                            {/* Static SVG for Instagram */}
                            <SocialLink href="https://www.instagram.com/quikn.ews/">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                            </SocialLink>

                            {/* Static SVG for Facebook */}
                            <SocialLink href="https://www.facebook.com/people/Quik-News/61586617626892/">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                            </SocialLink>

                            {/* Static SVG for LinkedIn */}
                            <SocialLink href="https://www.linkedin.com/company/quik-official">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                            </SocialLink>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">News</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><FooterLink href="/pakistan">Pakistan</FooterLink></li>
                            <li><FooterLink href="/global">Global</FooterLink></li>
                            <li><FooterLink href="/business">Business</FooterLink></li>
                            <li><FooterLink href="/tech">Technology</FooterLink></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">Topics</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><FooterLink href="/auto">Automotive</FooterLink></li>
                            <li><FooterLink href="/sports">Sports</FooterLink></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><FooterLink href="/about">About Us</FooterLink></li>
                            <li><FooterLink href="/authors">Our Team</FooterLink></li>
                            <li><FooterLink href="/editorial-policy">Editorial Policy</FooterLink></li>
                            <li><FooterLink href="#">Contact</FooterLink></li>
                            <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
                            <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-sm">
                        © {new Date().getFullYear()} Quik Inc. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-sm text-slate-500">
                        <FooterLink href="/privacy">Privacy</FooterLink>
                        <FooterLink href="/terms">Terms</FooterLink>
                        <FooterLink href="#">Cookies</FooterLink>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');

        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name: 'Subscriber',
                    interests: ['General'],
                    paymentMethod: 'free'
                })
            });

            if (res.ok) {
                setStatus('success');
                toast.success('Welcome aboard! You have successfully subscribed.');
                setEmail('');
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('idle');
                if (res.status === 409) {
                    toast.error('This email is already subscribed to our newsletter.');
                } else {
                    toast.error('Something went wrong. Please try again.');
                }
            }
        } catch (error) {
            setStatus('idle');
            toast.error('Network error. Please try again later.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={status === 'loading'}
                    required
                    className="w-full h-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-white/30 transition-all disabled:opacity-50"
                />
            </div>
            <button
                type="submit"
                disabled={status === 'loading'}
                className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
            >
                {status === 'loading' ? (
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                    'Subscribe Now'
                )}
            </button>
        </form>
    );
}

function SocialLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-brand-green/30 hover:bg-brand-green/5 transition-all duration-300"
        >
            {children}
        </a>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="hover:text-slate-900 transition-colors duration-200 block w-fit">
            {children}
        </Link>
    );
}
