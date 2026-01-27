import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/qie/db';
import { sendEmail } from '@/lib/email';
import { generateDigestEmail } from '@/lib/email-template';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const TEST_EMAIL = 'muneebbhatti1097m@gmail.com';
    const report: any = {
        recipient: TEST_EMAIL,
        steps: []
    };

    try {
        // Step 1: Send simple test email
        console.log('Sending simple test email...');
        const simpleResult = await sendEmail(
            TEST_EMAIL,
            'Test Email Verification',
            '<p>This is a test email to verify that the sending infrastructure is working.</p>'
        );

        report.steps.push({
            name: 'Simple Test Email',
            success: simpleResult.success,
            data: simpleResult.success ? simpleResult.data : simpleResult.error
        });

        // Step 2: Fetch sample news for digest
        const recentNews = await prisma.signal.findMany({
            where: {
                // Get varied news to ensure we have content
                event: {
                    category: { in: ['Technology', 'Business', 'Global'] }
                }
            },
            include: {
                event: true
            },
            orderBy: {
                generatedAt: 'desc'
            },
            take: 5
        });

        if (recentNews.length === 0) {
            report.steps.push({
                name: 'Fetch News',
                success: false,
                message: 'No news found to generate digest'
            });
        } else {
            // Step 3: Generate Digest HTML
            const digestHtml = generateDigestEmail(
                'Muneeb',
                recentNews.map(n => ({
                    id: n.id,
                    headline: n.headline,
                    summary: n.summary,
                    category: n.event.category,
                    generatedAt: n.generatedAt
                }))
            );

            // Step 4: Send Digest Email
            console.log('Sending digest test email...');
            const digestResult = await sendEmail(
                TEST_EMAIL,
                `Test Daily Quik News Digest - ${new Date().toLocaleDateString()}`,
                digestHtml
            );

            report.steps.push({
                name: 'Digest Status Email',
                success: digestResult.success,
                data: digestResult.success ? digestResult.data : digestResult.error
            });
        }

        return NextResponse.json(report);

    } catch (error: any) {
        console.error('Test route error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || String(error),
            report
        }, { status: 500 });
    }
}
