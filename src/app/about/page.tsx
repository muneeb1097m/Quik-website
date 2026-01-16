'use client';

import { Footer } from '@/components/Footer';
import { Cpu, Globe, Zap, Shield, Users, Newspaper, Activity, TrendingUp, BarChart3, Lock, Server, CreditCard, Check, Loader2, ChevronLeft } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';

// Animated Counter Component
const StatCounter = ({ value, label }: { value: string, label: string }) => {
    return (
        <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
            <h4 className="text-5xl font-extrabold text-slate-900 mb-2">
                {value}
            </h4>
            <div className="w-12 h-1 bg-slate-200 mx-auto rounded-full mb-3 group-hover:bg-brand-green transition-colors" />
            <p className="text-slate-500 font-medium">{label}</p>
        </div>
    );
};

// Process Step Component
const ProcessStep = ({ number, title, desc }: { number: string, title: string, desc: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative pl-12 pb-12 last:pb-0 border-l-2 border-slate-100 last:border-l-0"
    >
        <div className="absolute left-[-17px] top-0 w-8 h-8 rounded-full bg-brand-green text-slate-900 flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(52,199,89,0.3)]">
            {number}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 leading-relaxed max-w-lg">{desc}</p>
    </motion.div>
);

export default function AboutPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    const [email, setEmail] = useState('');
    const [isValidEmail, setIsValidEmail] = useState(true);

    const [formStep, setFormStep] = useState<'details' | 'payment' | 'success'>('details');
    const [isProcessing, setIsProcessing] = useState(false);

    // Multi-select state
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    const NEWS_TOPICS = [
        { id: 'finance', label: 'Finance & Economy' },
        { id: 'tech', label: 'Technology & AI' },
        { id: 'politics', label: 'Global Politics' },
        { id: 'energy', label: 'Energy & Infrastructure' },
        { id: 'textile', label: 'Textile & Industrial' },
        { id: 'sports', label: 'Sports & Entertainment' },
        { id: 'health', label: 'Healthcare & Biotech' },
        { id: 'science', label: 'Science & Space' },
        { id: 'auto', label: 'Automotive & EV' },
        { id: 'crypto', label: 'Crypto & Web3' },
        { id: 'realestate', label: 'Real Estate' },
        { id: 'startups', label: 'Startups & VC' },
    ];

    const toggleInterest = (id: string) => {
        setSelectedInterests(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEmail(val);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setIsValidEmail(val === '' || emailRegex.test(val));
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-white font-sans selection:bg-brand-green/20 selection:text-brand-green overflow-hidden">

            <main className="pt-48 pb-0 relative">

                {/* Dynamic Background Elements */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.15, 0.1]
                        }}
                        transition={{ duration: 8, repeat: Infinity }}
                        className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-brand-green/5 rounded-full blur-[100px]"
                    />
                    <motion.div
                        animate={{
                            x: [-20, 20, -20],
                            y: [20, -20, 20]
                        }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[120px]"
                    />
                </div>

                {/* Hero Section */}
                <div className="relative z-10 max-w-5xl mx-auto px-8 text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-bold text-sm mb-8 hover:bg-white hover:shadow-lg transition-all cursor-default"
                    >
                        <Zap className="w-4 h-4 text-slate-900 fill-slate-900" />
                        <span>The Future of Information</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]"
                    >
                        Global Intelligence, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-600 to-slate-400">Synthesized.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl text-slate-500 leading-relaxed max-w-2xl mx-auto"
                    >
                        Quik News uses autonomous AI agents to monitor, verify, and summarize the world&apos;s events in real-time. We are rebuilding the news stack for the 21st century.
                    </motion.p>
                </div>

                {/* Statistics Ticker */}
                <div className="relative z-10 bg-slate-50 border-y border-slate-200 py-20 mb-32">
                    <div className="max-w-[1600px] mx-auto px-8 grid grid-cols-2 lg:grid-cols-4 gap-12">
                        <StatCounter value="50k+" label="Sources Monitored" />
                        <StatCounter value="12ms" label="Processing Latency" />
                        <StatCounter value="99.9%" label="Uptime Guarantee" />
                        <StatCounter value="0" label="No Behavioral Ads" />
                    </div>
                </div>

                {/* Why Quik Exists (Mission) - Redesigned */}
                <div className="relative z-10 max-w-7xl mx-auto px-8 mb-40">
                    <div className="bg-white rounded-[3rem] p-12 lg:p-20 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col lg:flex-row gap-20 items-center overflow-hidden relative">
                        {/* Decor bg */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="lg:w-1/2 relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-8 border border-slate-200">
                                <Zap className="w-3 h-3 fill-slate-600" />
                                <span>Our Mission</span>
                            </div>
                            <h2 className="text-4xl lg:text-6xl font-extrabold text-slate-900 mb-8 leading-[1.1]">
                                Restoring the <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">Signal</span> in a World of <span className="italic font-serif text-slate-400">Noise</span>.
                            </h2>
                            <div className="prose prose-lg text-slate-600 leading-relaxed">
                                <p className="mb-6">
                                    The modern news cycle is broken. It prioritizes speed over accuracy, outrage over insight, and clicks over truth. We are drowning in noise, yet starving for signal.
                                </p>
                                <p>
                                    We built Quik to fix this. By combining the speed of automation with the rigor of verified fact-checking chains, we deliver intelligence, not just &quot;content.&quot;
                                </p>
                            </div>
                        </div>

                        {/* Visual Abstract */}
                        <div className="lg:w-1/2 w-full relative z-10">
                            <div className="aspect-[4/3] bg-slate-900 rounded-[2.5rem] relative overflow-hidden p-10 flex flex-col justify-between shadow-2xl">
                                <div className="space-y-4 opacity-30">
                                    {/* "Noise" lines */}
                                    {[0.4, 0.7, 0.3, 0.8, 0.5].map((w, i) => (
                                        <div key={i} className="flex gap-4 items-center">
                                            <div className="h-1.5 bg-slate-700 rounded-full animate-pulse" style={{ width: `${w * 100}%`, animationDelay: `${i * 0.1}s` }} />
                                        </div>
                                    ))}
                                </div>

                                <div className="relative">
                                    <div className="absolute -top-12 left-0 text-brand-green/20 text-[10rem] leading-none font-bold select-none blur-sm">&quot;</div>
                                    {/* "Signal" line */}
                                    <div className="flex items-center gap-3 text-brand-green font-bold text-2xl mb-4">
                                        <div className="p-2 bg-brand-green/20 rounded-lg">
                                            <Zap className="w-6 h-6 fill-brand-green" />
                                        </div>
                                        <span>Verified Signal Detected</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-green w-3/4 shadow-[0_0_20px_rgba(52,199,89,1)]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Custom Intelligence Feed (Contact Form) */}
                <div className="relative z-10 max-w-4xl mx-auto px-8 mb-40">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Need Specific Intelligence?</h2>
                        <p className="text-xl text-slate-500">Get a direct feed on topics that matter to you. Delivered where you read.</p>
                    </div>

                    <div className="bg-white p-2 rounded-[2.5rem] shadow-xl border border-slate-100">
                        <div className="bg-slate-50 rounded-[2rem] p-10 lg:p-16 border border-slate-100">
                            <AnimatePresence mode="wait">
                                {formStep === 'details' && (
                                    <motion.div
                                        key="details"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-900 ml-2">Name</label>
                                                <input type="text" placeholder="John Doe" className="w-full bg-white border border-slate-200 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-900 placeholder:text-slate-400" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-900 ml-2">Preferred Channel</label>
                                                <select defaultValue="email" className="w-full bg-white border border-slate-200 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-900 appearance-none cursor-pointer">
                                                    <option value="email">Email Digest</option>
                                                    <option value="whatsapp" disabled>WhatsApp (Coming Soon)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-sm font-bold text-slate-900 ml-2">News Interests <span className="text-brand-green text-xs font-normal ml-1">(Select multiple)</span></label>
                                            <div className="flex flex-wrap gap-3">
                                                {NEWS_TOPICS.map(topic => (
                                                    <button
                                                        key={topic.id}
                                                        type="button"
                                                        onClick={() => toggleInterest(topic.id)}
                                                        className={`px-5 py-3 rounded-xl text-sm font-bold transition-all border ${selectedInterests.includes(topic.id)
                                                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 translate-y-[-2px]'
                                                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {topic.label}
                                                    </button>
                                                ))}
                                            </div>
                                            {selectedInterests.length === 0 && <p className="text-xs text-slate-400 ml-2">Please select at least one topic.</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-900 ml-2">Email Address</label>
                                            <input
                                                type="email"
                                                placeholder="john@example.com"
                                                value={email}
                                                onChange={handleEmailChange}
                                                className={`w-full bg-white border rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-900 placeholder:text-slate-400 ${!isValidEmail ? 'border-red-500 focus:border-red-500' : 'border-slate-200'}`}
                                            />
                                            {!isValidEmail && <p className="text-red-500 text-xs ml-2 mt-1 font-bold">Please enter a valid email address.</p>}
                                        </div>
                                        <div className="pt-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (email && isValidEmail && selectedInterests.length > 0) setFormStep('payment');
                                                    else if (!email) setIsValidEmail(false);
                                                }}
                                                className={`w-full font-bold text-lg py-5 rounded-xl transition-all shadow-xl ${email && isValidEmail && selectedInterests.length > 0
                                                    ? 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.98] shadow-slate-900/20'
                                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                Proceed to Payment
                                            </button>
                                            <p className="text-center text-xs text-slate-400 mt-4">Next step: Secure Credit Card Payment ($5/mo)</p>
                                        </div>
                                    </motion.div>
                                )}

                                {formStep === 'payment' && (
                                    <motion.div
                                        key="payment"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-brand-green/10 p-3 rounded-full text-brand-green">
                                                    <CreditCard className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">Secure Payment</h3>
                                                    <p className="text-xs text-slate-500">Encrypted via Stripe</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-extrabold text-slate-900">$5.00</div>
                                                <div className="text-xs font-medium text-slate-500">/ month</div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-900 ml-2">Card Information</label>
                                                <div className="space-y-3">
                                                    <div className="relative">
                                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-slate-900/10 font-mono font-medium text-slate-900 placeholder:text-slate-400" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <input type="text" placeholder="MM / YY" className="w-full bg-white border border-slate-200 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-slate-900/10 font-mono font-medium text-slate-900 placeholder:text-slate-400 text-center" />
                                                        <input type="text" placeholder="CVC" className="w-full bg-white border border-slate-200 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-slate-900/10 font-mono font-medium text-slate-900 placeholder:text-slate-400 text-center" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-900 ml-2">Cardholder Name</label>
                                                <input type="text" placeholder="John Doe" className="w-full bg-white border border-slate-200 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-900 placeholder:text-slate-400" />
                                            </div>
                                        </div>

                                        <div className="pt-6 space-y-4">
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    setIsProcessing(true);
                                                    try {
                                                        const response = await fetch('/api/subscribe', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                name: 'John Doe', // In a real app, bind this to the input state
                                                                email,
                                                                interests: selectedInterests,
                                                                paymentMethod: 'credit_card'
                                                            })
                                                        });

                                                        const data = await response.json();

                                                        if (response.ok && data.status === 'success') {
                                                            setFormStep('success');
                                                        } else {
                                                            alert(data.error || 'Payment failed. Please try again.');
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert('An unexpected error occurred.');
                                                    } finally {
                                                        setIsProcessing(false);
                                                    }
                                                }}
                                                disabled={isProcessing}
                                                className="w-full bg-slate-900 text-white font-bold text-lg py-5 rounded-xl hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-3"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    'Pay & Subscribe'
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormStep('details')}
                                                disabled={isProcessing}
                                                className="w-full text-slate-500 font-bold text-sm hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                Back to Details
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {formStep === 'success' && (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                                            <Check className="w-12 h-12" />
                                        </div>
                                        <h3 className="text-3xl font-extrabold text-slate-900 mb-4">Subscription Activated!</h3>
                                        <p className="text-lg text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">
                                            You are now subscribed to the <strong>Quik Custom Intelligence Feed</strong>. Your first digest will arrive shortly at <span className="font-bold text-slate-900">{email}</span>.
                                        </p>
                                        <div className="bg-slate-50 rounded-2xl p-6 max-w-sm mx-auto border border-slate-200 mb-8">
                                            <div className="flex justify-between items-center text-sm mb-2">
                                                <span className="text-slate-500">Amount Paid</span>
                                                <span className="font-bold text-slate-900">$5.00</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Transaction ID</span>
                                                <span className="font-mono text-slate-900">qk_8f92j29s</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEmail('');
                                                setFormStep('details');
                                            }}
                                            className="inline-flex items-center gap-2 text-brand-green font-bold hover:underline"
                                        >
                                            Start Another Subscription
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Transparency & Responsibility Grid */}
                <div className="relative z-10 max-w-[1600px] mx-auto px-8 mb-40">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Sources */}
                        <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Sources</h3>
                            <p className="text-slate-500 mb-6">We ingest data from a curated list of over 50,000 verified endpoints. We exclude unverified blogs, anonymous accounts, and state-affiliated propaganda outlets.</p>
                            <ul className="space-y-3 text-sm font-medium text-slate-700">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" />Major Wire Services (Reuters, AP)</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" />Government Data Portals</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" />Verified Local Outlets</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" />Primary Research Papers</li>
                            </ul>
                        </div>

                        {/* Editorial Responsibility */}
                        <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Human Oversight</h3>
                            <p className="text-slate-500 mb-6">While AI assists in synthesis, humans remain responsible for the architecture of truth. We do not abdicate accountability to algorithms.</p>
                            <div className="space-y-4">
                                <p className="text-sm text-slate-600"><strong>Responsibility:</strong> Our core editorial board reviews the integrity of the source graph and algorithmic weighting weekly.</p>
                                <p className="text-sm text-slate-600"><strong>Correction Mechanism:</strong> If an error occurs, we fix it immediately. AI allows us to propagate corrections instantly across all localized versions.</p>
                            </div>
                        </div>

                        {/* Corrections Policy */}
                        <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100">
                            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-6">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Corrections & Updates</h3>
                            <p className="text-slate-500 mb-6">Accuracy is non-negotiable. When we get it wrong, we admit it, fix it, and show you when it happened.</p>
                            <ul className="space-y-3 text-sm font-medium text-slate-700">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500" />Visible Correction Timestamps</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500" />Full Integrity Log Access</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500" />Public Error Reporting Channel</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* "How it Works" - Deep Dive */}
                <div className="relative z-10 max-w-[1600px] mx-auto px-8 mb-40">
                    <div className="grid lg:grid-cols-2 gap-24 items-start">

                        {/* Sticky Visual */}
                        <div className="hidden lg:block sticky top-32">
                            <motion.div
                                style={{ y }}
                                className="relative aspect-square rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl ring-1 ring-white/10"
                            >
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                                {/* Floating Elements */}
                                <div className="absolute bottom-12 left-12 right-12">
                                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                                        <div className="flex items-center gap-3 mb-4 text-white/50 text-xs uppercase tracking-widest font-bold">
                                            <TrendingUp className="w-4 h-4 text-brand-green" />
                                            Live System Status
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-white text-sm">
                                                <span>Ingestion Rate</span>
                                                <span className="font-mono text-brand-green">4,230/sec</span>
                                            </div>
                                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    animate={{ width: ['40%', '70%', '50%'] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="h-full bg-brand-green"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-white text-sm">
                                                <span>Fact Verification</span>
                                                <span className="font-mono text-emerald-400">Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Text Content */}
                        <div className="pt-8">
                            <h2 className="text-4xl font-extrabold text-slate-900 mb-12">The Intelligence Engine</h2>
                            <div className="space-y-4">
                                <ProcessStep
                                    number="01"
                                    title="Global Ingestion"
                                    desc="Our spiders crawl thousands of trusted sources across 150+ countries every minute. From major wire services to verified local reports, nothing is missed."
                                />
                                <ProcessStep
                                    number="02"
                                    title="Semantic Analysis"
                                    desc="QIE (Quik Intelligence Engine) reads and understands the context. It doesn't just match keywords; it comprehends the nuance of geopolitical events and market shifts."
                                />
                                <ProcessStep
                                    number="03"
                                    title="Fact Verification"
                                    desc="Before a story is published, it must pass our multi-agent consensus protocol. If three independent sources don't corroborate the key facts, it gets flagged for review."
                                />
                                <ProcessStep
                                    number="04"
                                    title="Synthesis & Delivery"
                                    desc="Finally, the raw data is synthesized into a concise, neutral summary. No clickbait, no fluff—just the signal, delivered instantly to your feed."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Values Grid */}
                <div className="bg-slate-900 py-32 rounded-t-[4rem] relative overflow-hidden">
                    <div className="max-w-6xl mx-auto px-8 relative z-10">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl font-extrabold text-white mb-6">Built on Principles</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto text-lg">We believe technology should serve truth, not engagement algorithms. Our core values reflect this commitment.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 mb-32">
                            {[
                                { icon: <Shield />, title: 'Unbiased', desc: 'No political agenda. No corporate influence. Just raw facts verified by code.' },
                                { icon: <Lock />, title: 'Privacy First', desc: 'We don\'t track you. We don\'t sell your data. You are the customer, not the product.' },
                                { icon: <Server />, title: 'Transparency', desc: 'Our source code and methodology are open for auditing. Trust is earned, not assumed.' }
                            ].map((card, i) => (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={i}
                                    className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center mb-6">
                                        {card.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4">{card.title}</h3>
                                    <p className="text-slate-400 leading-relaxed">{card.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Use Cases & Who We Are */}
                        <div className="grid lg:grid-cols-2 gap-20 items-start mb-32">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-8">Who Needs Quik?</h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center shrink-0"><Cpu className="w-5 h-5" /></div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">Investors & Analysts</h4>
                                            <p className="text-slate-400">Get signal before the noise. Real-time synthesized events moving markets.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center shrink-0"><Newspaper className="w-5 h-5" /></div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">Journalists & Researchers</h4>
                                            <p className="text-slate-400">A verified firehose of global events, confirming primary sources instantly.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center shrink-0"><Globe className="w-5 h-5" /></div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">Policy Watchers</h4>
                                            <p className="text-slate-400">Track geopolitical shifts and legislative updates across 150+ legislations.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-white mb-8">Who We Are</h3>
                                <p className="text-slate-400 mb-6 leading-relaxed">
                                    Quik was built by a coalition of engineers, data scientists, and former journalists who saw the structural failure of ad-supported media.
                                </p>
                                <p className="text-slate-400 mb-6 leading-relaxed">
                                    We are incorporated as a Public Benefit Corporation, legally bound to prioritize accuracy over profit. Our advisory board includes retired wire service editors and AI ethics researchers.
                                </p>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <h5 className="text-white font-bold mb-2">Compliance & Safety</h5>
                                    <p className="text-xs text-slate-500">
                                        We do not provide financial or legal advice. Our AI filters for hate speech, self-harm, and illegal content before any synthesis occurs. Data remains on-device where possible.
                                    </p>
                                </div>
                            </div>
                        </div>


                        {/* Roadmap */}
                        <div className="border-t border-white/10 pt-20">
                            <h3 className="text-2xl font-bold text-white mb-10 text-center">The Road Ahead</h3>
                            <div className="grid md:grid-cols-4 gap-6 text-center">
                                <div className="p-6">
                                    <div className="text-brand-green font-mono text-sm mb-2">Q3 2026</div>
                                    <div className="text-white font-bold">Quik API Access</div>
                                </div>
                                <div className="p-6">
                                    <div className="text-brand-green font-mono text-sm mb-2">Q4 2026</div>
                                    <div className="text-white font-bold">Custom Intelligence Feeds</div>
                                </div>
                                <div className="p-6">
                                    <div className="text-brand-green font-mono text-sm mb-2">Q1 2027</div>
                                    <div className="text-white font-bold">Regional Deep Dives</div>
                                </div>
                                <div className="p-6">
                                    <div className="text-brand-green font-mono text-sm mb-2">Q2 2027</div>
                                    <div className="text-white font-bold">Global Language Expansion</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}
