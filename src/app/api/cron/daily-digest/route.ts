import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/qie/db';
import { sendEmail } from '@/lib/email';
import { generateDigestEmail } from '@/lib/email-template';

export async function GET(req: NextRequest) {
    try {
        // Security: Check for cron secret
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🚀 Starting daily news digest...');

        // 1. Fetch all active subscribers
        const subscribers = await prisma.subscription.findMany({
            where: { status: 'active' },
            select: {
                id: true,
                name: true,
                email: true,
                interests: true
            }
        });

        if (subscribers.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No active subscribers',
                sent: 0
            });
        }

        console.log(`📧 Found ${subscribers.length} active subscribers`);

        // 2. Fetch recent news (last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const recentNews = await prisma.signal.findMany({
            where: {
                generatedAt: {
                    gte: yesterday
                }
            },
            include: {
                event: true
            },
            orderBy: {
                generatedAt: 'desc'
            },
            take: 50 // Get top 50 recent stories
        });

        console.log(`📰 Found ${recentNews.length} recent news items`);

        // 3. Send personalized emails
        let successCount = 0;
        let failureCount = 0;

        for (const subscriber of subscribers) {
            try {
                // Parse interests (stored as JSON string)
                const interests = JSON.parse(subscriber.interests);

                // Map interests to categories
                const categoryMap: Record<string, string> = {
                    'finance': 'Business',
                    'tech': 'Technology',
                    'politics': 'Global',
                    'energy': 'Technology',
                    'textile': 'Business',
                    'sports': 'Sports',
                    'health': 'Technology',
                    'science': 'Technology',
                    'auto': 'Auto',
                    'crypto': 'Technology',
                    'realestate': 'Business',
                    'startups': 'Startups'
                };

                const relevantCategories = interests.map((int: string) => categoryMap[int] || 'Technology');

                // Filter news matching subscriber's interests
                const personalizedNews = recentNews
                    .filter(news => relevantCategories.includes(news.event.category))
                    .slice(0, 5); // Top 5 stories

                if (personalizedNews.length === 0) {
                    console.log(`⚠️ No relevant news for ${subscriber.email}, skipping`);
                    continue;
                }

                // Generate email HTML
                const emailHtml = generateDigestEmail(
                    subscriber.name,
                    personalizedNews.map(n => ({
                        id: n.id,
                        headline: n.headline,
                        summary: n.summary,
                        category: n.event.category,
                        generatedAt: n.generatedAt
                    }))
                );

                // Send email
                const result = await sendEmail(
                    subscriber.email,
                    `Your Daily Quik News Digest - ${new Date().toLocaleDateString()}`,
                    emailHtml
                );

                if (result.success) {
                    successCount++;
                    console.log(`✅ Sent digest to ${subscriber.email}`);
                } else {
                    failureCount++;
                    console.error(`❌ Failed to send to ${subscriber.email}:`, result.error);
                }

                // Small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                failureCount++;
                console.error(`Error processing subscriber ${subscriber.email}:`, error);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Daily digest sent',
            stats: {
                totalSubscribers: subscribers.length,
                emailsSent: successCount,
                failures: failureCount,
                newsItemsProcessed: recentNews.length
            }
        });

    } catch (error) {
        console.error('Daily digest cron error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
