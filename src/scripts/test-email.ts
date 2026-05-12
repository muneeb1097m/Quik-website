
import { config } from 'dotenv';
config();

async function testEmail() {
    // Dynamic import to ensure env vars are loaded first
    const { sendEmail } = await import('../lib/email');

    console.log("Testing email sending...");
    const result = await sendEmail(
        'hamidshehzad815@gmail.com',
        'Test Email',
        '<p>This is a test email from Quik News.</p>'
    );
    console.log("Result:", JSON.stringify(result, null, 2));
}

testEmail();
