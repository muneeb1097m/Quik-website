import { NextResponse } from 'next/server';
import { prisma } from '@/lib/qie/db';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, interests, paymentMethod } = body;

        // 1. Basic Validation
        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { status: 'error', error: 'Invalid email address' },
                { status: 400 }
            );
        }

        if (!interests || interests.length === 0) {
            return NextResponse.json(
                { status: 'error', error: 'Please select at least one interest.' },
                { status: 400 }
            );
        }

        // 2. Save to Database
        try {
            const subscription = await prisma.subscription.create({
                data: {
                    name,
                    email,
                    interests: JSON.stringify(interests), // Store array as JSON string
                    status: 'active',
                    paymentMethod: paymentMethod || 'free'
                }
            });

            // 3. Check total subscriber count
            const totalSubscribers = await prisma.subscription.count();

            // 4. Send admin notification if exactly 100 users
            if (totalSubscribers === 100) {
                try {
                    await sendEmail(
                        'muneebbhatti1097m@gmail.com',
                        '🎉 Milestone Reached: 100 Subscribers!',
                        `
                        <h1 style="color: #1e293b;">Congratulations!</h1>
                        <p>Your Quik News newsletter has reached <strong>100 subscribers</strong>! 🎊</p>
                        <p>Latest subscriber: <strong>${email}</strong></p>
                        <p>Time to celebrate and plan for the next phase! 🚀</p>
                        `
                    );
                    console.log('🎉 Admin notified: 100 subscribers milestone!');
                } catch (emailError) {
                    console.error('Failed to send admin notification:', emailError);
                }
            }

            console.log(`✅ New subscriber #${totalSubscribers}: ${email}`);

            // 5. Return Success
            return NextResponse.json({
                status: 'success',
                message: 'Subscription active',
                subscriptionId: subscription.id
            });

        } catch (dbError: any) {
            // Handle duplicate email unique constraint
            if (dbError.code === 'P2002') {
                return NextResponse.json(
                    { status: 'error', error: 'This email is already subscribed.' },
                    { status: 409 }
                );
            }
            throw dbError; // Re-throw for generic handler
        }

    } catch (error) {
        console.error('Subscription Error:', error);
        return NextResponse.json(
            { status: 'error', error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
