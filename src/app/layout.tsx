import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import Script from 'next/script';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/react';
import dynamic from 'next/dynamic';

// Performance: Optimize font loading with swap and variable font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

// Performance: Dynamic imports to reduce initial bundle size
const Navigation = dynamic(() => import('@/components/Navigation').then(mod => ({ default: mod.Navigation })), {
  ssr: true,
  loading: () => <div className="h-16" /> // Prevent layout shift
});

const Footer = dynamic(() => import('@/components/Footer').then(mod => ({ default: mod.Footer })), {
  ssr: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://quik.news'),
  title: {
    default: 'Quik | AI-Powered Global News & Breaking Headlines',
    template: '%s | Quik'
  },
  description: 'Real-time global news powered by AI. Get breaking headlines, tech updates, business insights, and sports from around the world. Fast, intelligent, and always current.',
  keywords: [
    'AI News',
    'Breaking News',
    'Global News',
    'Tech News',
    'Business News',
    'Real-time News',
    'International Headlines',
    'Technology Updates',
    'Business Intelligence',
    'Sports News',
    'World News',
    'News Aggregator',
    'AI Journalism',
    'Quik News'
  ],
  authors: [{ name: 'Quik AI' }],
  creator: 'Quik',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://quik.news',
    title: 'Quik | AI-Powered Global News',
    description: 'Real-time intelligence from around the world, synthesized by AI.',
    siteName: 'Quik',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quik | AI-Powered Global News',
    description: 'Breaking headlines and insights powered by AI. Global coverage, instant updates.',
    creator: '@quik_news',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <Toaster position="top-center" richColors />
        {children}
        <Footer />

        <SpeedInsights />
        <Analytics />

        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-VDRE507J76" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-VDRE507J76');
          `}
        </Script>

        {/* Chatbase Chatbot - Vercel Native Integration */}
        <Script id="chatbase-script" strategy="afterInteractive">
          {`
            (function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="${process.env.NEXT_PUBLIC_CHATBOT_ID}";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();
          `}
        </Script>
      </body>
    </html>
  );
}
