import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const TEST_EMAIL = 'muneebbhatti1097m@gmail.com';
    const TEST_NAME = 'Muneeb Test';
    const report: any = {
        email: TEST_EMAIL,
        attempts: []
    };

    // Helper to make subscription request
    const subscribe = async (attemptNum: number) => {
        try {
            // Need to call the absolute URL of our own API
            // Assuming localhost:3005 based on current environment
            const res = await fetch('http://localhost:3005/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: TEST_NAME,
                    email: TEST_EMAIL,
                    interests: ['technology', 'finance']
                })
            });

            const data = await res.json();
            return {
                attempt: attemptNum,
                status: res.status,
                success: res.ok,
                response: data
            };
        } catch (error: any) {
            return {
                attempt: attemptNum,
                status: 500,
                success: false,
                error: error.message
            };
        }
    };

    // Attempt 1
    report.attempts.push(await subscribe(1));

    // Attempt 2 (Should fail if Attempt 1 succeeded, or also fail if already existed)
    report.attempts.push(await subscribe(2));

    return NextResponse.json(report);
}
