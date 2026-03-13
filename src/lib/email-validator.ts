/**
 * Validates email format using regex
 */
export function isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Verifies if the email domain has valid MX records (can receive emails)
 * Note: DNS checking is disabled in Edge runtime (Cloudflare)
 */
export async function verifyEmailDomain(email: string): Promise<{ valid: boolean; error?: string }> {
    const domain = email.split('@')[1];

    if (!domain) {
        return { valid: false, error: 'Invalid email format' };
    }

    // Edge runtime does not support Node.js 'dns' module natively.
    // Proceeding with just regex validation.
    return { valid: true };
}

/**
 * Complete email validation: format + domain verification
 */
export async function validateEmail(email: string): Promise<{
    valid: boolean;
    error?: string;
}> {
    // Step 1: Check format
    if (!isValidEmailFormat(email)) {
        return { valid: false, error: 'Invalid email format' };
    }

    // Step 2: Verify domain (MX records disabled for edge compatibility)
    const domainCheck = await verifyEmailDomain(email);

    return domainCheck;
}
