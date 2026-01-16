import { NextResponse } from 'next/server';
import { prisma } from '@/lib/qie/db';

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

        // 2. Simulate Payment Processing (Simulating latency for UX)
        // In a real app, this would be: await stripe.paymentIntents.create({...})
        const PAYMENT_DELAY = 1500;
        await new Promise(resolve => setTimeout(resolve, PAYMENT_DELAY));

        // 3. Save to Database
        try {
            const subscription = await prisma.subscription.create({
                data: {
                    name,
                    email,
                    interests: JSON.stringify(interests), // Store array as JSON string
                    status: 'active',
                    paymentMethod: paymentMethod || 'credit_card'
                }
            });

            // 4. Return Success
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
