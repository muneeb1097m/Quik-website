import { PrismaClient, NewsEvent, Signal, Brief, Source } from '@prisma/client';

// Singleton pattern for Prisma Client in Next.js dev environment
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// --- Helper accessors mirroring old API for compatibility ---
export const db = {
    getEvents: async () => {
        return await prisma.newsEvent.findMany({
            include: { sources: true }
        });
    },

    getEvent: async (id: string) => {
        return await prisma.newsEvent.findUnique({
            where: { id },
            include: { sources: true, signals: true }
        });
    },

    getSignal: async (id: string) => {
        return await prisma.signal.findUnique({
            where: { id },
            include: { event: true } // Need event for category check usually
        });
    },

    getSignals: async (category?: string) => {
        // Fetch all signals with even include
        const signals = await prisma.signal.findMany({
            include: {
                event: {
                    include: {
                        sources: true
                    }
                }
            },
            orderBy: { generatedAt: 'desc' }
        });

        if (!category) return signals;

        // Strict category logic
        const c = category.toLowerCase();

        return signals.filter(s => {
            const ec = s.event.category.toLowerCase();
            if (c === 'tech') return ec === 'technology';
            if (c === 'business') return ec === 'economy';
            if (c === 'global') return ec === 'international';
            // Simple match
            return ec === c;
        });
    },

    getTrending: async (limit: number = 3) => {
        return await prisma.signal.findMany({
            take: limit,
            orderBy: { generatedAt: 'desc' },
            include: { event: true }
        });
    },

    // Setter (used by Cron)
    addEvent: async (data: any) => {
        // "Upsert" logic ideally, but for now simple create
        // Data shape from cron is complex, need to map it back to Prisma schema
        try {
            const { id, title, category, status, detectedAt, sources, signals, imageUrl } = data;

            // Create Event
            await prisma.newsEvent.create({
                data: {
                    id,
                    title,
                    category,
                    status,
                    detectedAt: new Date(detectedAt),
                    confidenceScore: 0.9,
                    imageUrl,
                    sources: {
                        create: sources.map((s: any) => ({
                            name: s.name,
                            url: s.url,
                            reliabilityScore: s.reliabilityScore,
                            type: s.type
                        }))
                    }
                }
            });

        } catch (e) {
            console.error("DB Add Event Error", e);
        }
    },

    addSignal: async (data: any) => {
        try {
            await prisma.signal.create({
                data: {
                    id: data.id,
                    eventId: data.eventId,
                    headline: data.headline,
                    summary: data.summary,
                    generatedAt: new Date(data.generatedAt),
                    imageUrl: data.imageUrl,
                    fullReport: data.fullReport
                }
            });
        } catch (e) {
            console.error("DB Add Signal Error", e);
        }
    }
};
