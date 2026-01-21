import { PrismaClient, NewsEvent, Signal, Brief, Source } from '@prisma/client';
import { generateNewsImage } from '../image-gen';

// Singleton pattern for Prisma Client in Next.js dev environment
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// --- Helper accessors mirroring old API for compatibility ---
export const db = {
    getEvents: async (limit?: number) => {
        return await prisma.newsEvent.findMany({
            include: { sources: true },
            orderBy: { detectedAt: 'desc' },
            take: limit
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

    getSignals: async (category?: string, limit?: number) => {
        // Fetch all signals with even include
        const signals = await prisma.signal.findMany({
            include: {
                event: {
                    include: {
                        sources: true
                    }
                }
            },
            orderBy: { generatedAt: 'desc' },
            take: category ? undefined : limit // Apply limit only if no category filtering (if category exists, we need to filter locally or query differently)
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
            let { id, title, category, status, detectedAt, sources, signals, imageUrl } = data;

            // Generate AI image if one wasn't provided (or if we want to enforce it)
            // The user requested "whenever a news going to add... create an image"
            // So we will prioritize generating one if the incoming one is missing or generic.
            // For now, let's generate one if imageUrl is missing OR if we want to ensure high quality (optional).
            // Let's assume we always generate a fallback if missing, but maybe we should specificially do it as requested.
            // "whenever a news going to add... create an image" implies we should probably generate one.
            if (!imageUrl) {
                imageUrl = generateNewsImage(title, category);
            }

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
