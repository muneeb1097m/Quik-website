import { db } from '@/lib/qie/db';
import { notFound } from 'next/navigation';
import NewsDetailView from '@/components/NewsDetailView';

// Server Component (Async)
export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // 1. Unwrap Params
    const { id } = await params;
    const decodedId = decodeURIComponent(id);

    // 2. Fetch Data from DB (Server-side)
    const signal = await db.getSignal(decodedId);

    if (!signal) {
        notFound();
    }

    const event = await db.getEvent(signal.eventId);
    if (!event) return null; // Should ideally also be handled

    // Fetch related stories
    const related = await db.getSignals(event.category);
    // Filter out current and limit (simple client-side filter logic for now, DB query ideal later)
    const filteredRelated = related.filter(s => s.id !== signal.id).slice(0, 3);

    // 3. Render Client Component with Data
    return (
        <NewsDetailView
            signal={signal}
            event={event}
            related={filteredRelated}
        />
    );
}
