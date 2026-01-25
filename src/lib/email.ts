import { Resend } from 'resend';

// Use a fallback key during build if env var is missing to prevent build failures
const resendApiKey = process.env.RESEND_API_KEY || 're_123456789_build_dummy_key';
const resend = new Resend(resendApiKey);

export async function sendEmail(to: string, subject: string, html: string) {
    try {
        const data = await resend.emails.send({
            from: 'Quik News <noreply@quiknews.online>',
            to: [to],
            subject: subject,
            html: html,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error };
    }
}

export { resend };
