import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://quik.news'),
  title: {
    default: 'Quik | AI-Native News Platform',
    template: '%s | Quik'
  },
  description: 'Real-time intelligence, synthesized by AI. The fastest way to consume news.',
  keywords: ['AI News', 'Real-time News', 'Tech News', 'Business Intelligence', 'Quik News'],
  authors: [{ name: 'Quik AI' }],
  creator: 'Quik',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://quik.news',
    title: 'Quik | AI-Native News Platform',
    description: 'Real-time intelligence, synthesized by AI.',
    siteName: 'Quik',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quik | AI-Native News Platform',
    description: 'Real-time intelligence, synthesized by AI.',
    creator: '@quik_news',
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
      </body>
    </html>
  );
}
