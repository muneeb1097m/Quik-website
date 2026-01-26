import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

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

import Script from 'next/script';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/react';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {children}
        <Footer />

        <SpeedInsights />
        <Analytics />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-VDRE507J76" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-VDRE507J76');
          `}
        </Script>
      </body>
    </html>
  );
}
