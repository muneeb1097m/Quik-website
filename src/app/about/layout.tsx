import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us | Quik',
    description: 'Learn about Quik, our mission to restore signal in a world of noise, and the team behind the intelligence.',
    alternates: {
        canonical: 'https://quiknews.online/about',
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
