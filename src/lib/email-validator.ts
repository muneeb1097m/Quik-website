import { promises as dns } from 'dns';

/**
 * Validates email format using regex
 */
export function isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Verifies if the email domain has valid MX records (can receive emails)
 */
export async function verifyEmailDomain(email: string): Promise<{ valid: boolean; error?: string }> {
    try {
        const domain = email.split('@')[1];

        if (!domain) {
            return { valid: false, error: 'Invalid email format' };
        }

        // Check MX records
        const mxRecords = await dns.resolveMx(domain);

        if (mxRecords && mxRecords.length > 0) {
            return { valid: true };
        } else {
            return { valid: false, error: 'Email domain does not exist or cannot receive emails' };
        }
    } catch (error: any) {
        // DNS lookup failed - domain doesn't exist or has no MX records
        if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
            return { valid: false, error: 'Email domain does not exist' };
        }

        // For other errors (timeouts, network issues), we should probably ALLOW it
        // to avoid blocking legitimate users during transient network issues
        console.warn('DNS verification skipped due to error:', error);
        return { valid: true };
    }
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

    // Step 2: Verify domain (MX records)
    const domainCheck = await verifyEmailDomain(email);

    return domainCheck;
}
