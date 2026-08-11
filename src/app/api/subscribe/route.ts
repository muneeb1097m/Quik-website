import { NextResponse } from 'next/server';
import { supabase } from '@/lib/qie/db';
import { sendEmail } from '@/lib/email';
import { validateEmail } from '@/lib/email-validator';
import { generateWelcomeEmail } from '@/lib/email-template';

export async function GET() {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, interests, paymentMethod } = body;

        // 1. Basic Validation
        if (!email) {
            return NextResponse.json(
                { status: 'error', error: 'Email address is required' },
                { status: 400 }
            );
        }

        // 2. Advanced Email Validation (Format + MX Record)
        const emailValidation = await validateEmail(email);
        if (!emailValidation.valid) {
            return NextResponse.json(
                { status: 'error', error: emailValidation.error || 'Invalid email address' },
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
            const { data: subscription, error: insertError } = await supabase.from('Subscription').insert({
                name,
                email,
                interests: JSON.stringify(interests),
                status: 'active',
                paymentMethod: paymentMethod || 'free'
            }).select('id').single();

            if (insertError) {
                // Handle duplicate email unique constraint (Supabase typically returns 23505)
                if (insertError.code === '23505') {
                    return NextResponse.json(
                        { status: 'error', error: 'This email is already subscribed to our newsletter' },
                        { status: 409 }
                    );
                }
                throw insertError;
            }

            // 2b. Send Welcome Email
            try {
                const welcomeHtml = generateWelcomeEmail(name);
                await sendEmail(
                    email,
                    'Welcome to Quik News! ⚡',
                    welcomeHtml
                );
                console.log(`📧 Welcome email sent to ${email}`);
            } catch (welcomeError) {
                console.error(`❌ Failed to send welcome email to ${email}:`, welcomeError);
                // Don't fail the request, just log it
            }

            const { count: totalSubscribers, error: countError } = await supabase.from('Subscription').select('*', { count: 'exact', head: true });

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

            return NextResponse.json({
                status: 'success',
                message: 'Subscription active',
                subscriptionId: subscription?.id
            });

        } catch (dbError: any) {
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
