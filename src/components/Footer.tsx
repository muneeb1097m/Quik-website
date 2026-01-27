'use client';

import { Github, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export function Footer() {
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
                            {/* Logo Text Requirement: "Quik News" */}
                            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Quik News</span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Real-time global intelligence, synthesized by AI. Delivered with precision and speed from reliable sources.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink href="#" icon={<Twitter size={18} />} />
                            <SocialLink href="#" icon={<Github size={18} />} />
                            <SocialLink href="#" icon={<Linkedin size={18} />} />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">News</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            {/* Major Categories from Nav */}
                            <li><FooterLink href="/pakistan">Pakistan</FooterLink></li>
                            <li><FooterLink href="/global">Global</FooterLink></li>
                            <li><FooterLink href="/business">Business</FooterLink></li>
                            <li><FooterLink href="/tech">Technology</FooterLink></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">Topics</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            {/* Niche Categories from Nav */}
                            {/* <li><FooterLink href="/telecom">Telecom</FooterLink></li> */}
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
                        {/* Repeated legal links for standard footer conventions, or keep minimal */}
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
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        // setMessage(''); // No longer using message state

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

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                toast.success('Welcome aboard! You have successfully subscribed.');
                setEmail('');
                // Reset success state after a delay or keep it
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('idle'); // Allow retrying
                if (res.status === 409) {
                    toast.error('This email is already subscribed to our newsletter.');
                } else {
                    toast.error(data.error || 'Something went wrong. Please try again.');
                }
            }
        } catch (error) {
            setStatus('idle');
            toast.error('Network error. Please try again later.');
        }
    };

    // Check if status is success, but we handled UI via toast mostly. 
    // We can show a checkmark button state or something, but the original UI returned early.
    // Let's keep the button loading state but remove the big message block logic that replaces the form.
    // Actually, user might prefer to see the form again to add another email?
    // The original code replaced the form with a success message.
    // "Also if the email is good ... add them in news letter and send an email ... successfully subscribed"
    // "If the email already exist then simply show a pop-up ... UI."
    // So ONLY for duplicates show popup. For success, the original UI was fine, but let's add toast there too.


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
            {status === 'error' && (
                <div className="absolute -bottom-8 left-0 text-red-400 text-xs text-left w-full pl-2">
                    {message}
                </div>
            )}
        </form>
    );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
    // ... existing SocialLink code ...
    return (
        <a
            href={href}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-brand-green/30 hover:bg-brand-green/5 transition-all duration-300"
        >
            {icon}
        </a>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a href={href} className="hover:text-slate-900 transition-colors duration-200 block w-fit">
            {children}
        </a>
    );
}
