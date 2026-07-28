import { NextResponse } from 'next/server';
import { db, supabase } from '@/lib/qie/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const envs = {
            hasUrl: !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
            hasProjectId: !!process.env.SUPABASE_PROJECT_ID,
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            hasAnonKey: !!(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
            nodeEnv: process.env.NODE_ENV,
        };

        const { data: signalTest, error: signalError } = await supabase.from('Signal').select('id').limit(1);
        const { data: eventTest, error: eventError } = await supabase.from('NewsEvent').select('id').limit(1);

        // Test the complex join
        const commonSignalSelect = `id, headline, event:NewsEvent(id, title)`;
        const { data: joinTest, error: joinError } = await supabase.from('Signal').select(commonSignalSelect).limit(1);

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            envs,
            connectivity: {
                signals: !signalError,
                events: !eventError,
                joins: !joinError && joinTest && joinTest.length > 0 && !!(joinTest[0] as any).event,
            },
            errors: {
                signal: signalError,
                event: eventError,
                join: joinError
            },
            counts: {
                signals: signalTest?.length || 0,
                events: eventTest?.length || 0,
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
