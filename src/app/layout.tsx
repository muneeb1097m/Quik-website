// Version: 1.0.3 - Cache Breach
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { GoogleAnalytics } from '@next/third-parties/google';
import Script from 'next/script';
import { ADSTERRA_CONFIG } from '@/lib/adsterra';
import { Navigation } from '@/components/Navigation';
import AppFooter from '@/components/AppFooter';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.quiknews.online'),
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
  authors: [{ name: 'Quik Editorial Desk', url: 'https://www.quiknews.online/authors' }],
  creator: 'Quik News',
  publisher: 'Quik News',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.quiknews.online',
    title: 'Quik | AI-Powered Global News',
    description: 'Real-time intelligence from around the world, synthesized by AI.',
    siteName: 'Quik News',
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
  verification: {
    other: {
      'p:domain_verify': 'd1440e0087e5aea77d4c1319c5dfdd77',
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
      <head>
        <meta name="p:domain_verify" content="d1440e0087e5aea77d4c1319c5dfdd77" />
        <link rel="alternate" type="application/rss+xml" title="Quik News RSS Feed" href="/rss.xml" />
      </head>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Quik News',
              url: 'https://www.quiknews.online',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://www.quiknews.online/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Quik',
              url: 'https://www.quiknews.online',
              logo: 'https://www.quiknews.online/logo.png',
              sameAs: [
                'https://x.com/quik_news',
                'https://www.instagram.com/quikn.ews/',
                'https://www.facebook.com/people/Quik-News/61586617626892/',
                'https://www.linkedin.com/company/quik-official',
                'https://www.linkedin.com/showcase/quik-sports1'
              ],
            }),
          }}
        />

        <Navigation />
        <Toaster position="top-center" richColors />
        {children}
        <AppFooter />

        <GoogleAnalytics gaId="G-VDRE507J76" />

        {/* Adsterra Social Bar */}
        {ADSTERRA_CONFIG.socialBar.scriptUrl && (
          <Script
            src={ADSTERRA_CONFIG.socialBar.scriptUrl}
            strategy="afterInteractive"
            type="text/javascript"
          />
        )}
      </body>
    </html>
  );
}
