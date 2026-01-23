import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
