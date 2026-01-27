interface NewsItem {
    id: string;
    headline: string;
    summary: string;
    category: string;
    generatedAt: Date;
}

export function generateDigestEmail(subscriberName: string, newsItems: NewsItem[]): string {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Daily Quik News Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                ⚡ Quik News
                            </h1>
                            <p style="margin: 8px 0 0; color: #cbd5e1; font-size: 14px; font-weight: 500;">
                                Your Daily Intelligence Digest
                            </p>
                            <p style="margin: 12px 0 0; color: #94a3b8; font-size: 13px;">
                                ${today}
                            </p>
                        </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                        <td style="padding: 30px 40px 20px;">
                            <p style="margin: 0; color: #1e293b; font-size: 16px; line-height: 1.6;">
                                Hi <strong>${subscriberName}</strong>,
                            </p>
                            <p style="margin: 12px 0 0; color: #64748b; font-size: 15px; line-height: 1.6;">
                                Here are today's top stories matching your interests:
                            </p>
                        </td>
                    </tr>

                    <!-- News Items -->
                    ${newsItems.map((item, index) => `
                    <tr>
                        <td style="padding: ${index === 0 ? '20px' : '10px'} 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <div style="display: inline-block; background-color: #1e293b; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px;">
                                            ${item.category}
                                        </div>
                                        <h2 style="margin: 0 0 10px; color: #1e293b; font-size: 18px; font-weight: 700; line-height: 1.4;">
                                            <a href="https://quiknews.online/news/${item.id}" style="color: #1e293b; text-decoration: none;">
                                                ${item.headline}
                                            </a>
                                        </h2>
                                        <p style="margin: 0 0 12px; color: #64748b; font-size: 14px; line-height: 1.6;">
                                            ${item.summary}
                                        </p>
                                        <a href="https://quiknews.online/news/${item.id}" style="display: inline-block; color: #1e293b; font-size: 13px; font-weight: 600; text-decoration: none; border-bottom: 2px solid #1e293b; padding-bottom: 2px;">
                                            Read Full Report →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    `).join('')}

                    <!-- CTA -->
                    <tr>
                        <td style="padding: 30px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://quiknews.online" style="display: inline-block; background-color: #1e293b; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                                            View All News
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px;">
                                You're receiving this because you subscribed to Quik News.
                            </p>
                            <p style="margin: 0; color: #cbd5e1; font-size: 11px;">
                                <a href="https://quiknews.online/about" style="color: #64748b; text-decoration: underline;">Manage Preferences</a> · 
                                <a href="https://quiknews.online/about" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

export function generateWelcomeEmail(subscriberName: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Quik News</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                ⚡ Quik News
                            </h1>
                            <p style="margin: 8px 0 0; color: #cbd5e1; font-size: 14px; font-weight: 500;">
                                Welcome to the Future of News
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0; color: #1e293b; font-size: 16px; line-height: 1.6;">
                                Hi <strong>${subscriberName}</strong>,
                            </p>
                            <p style="margin: 16px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                                Thank you for subscribing to <strong>Quik News</strong>! You're now part of an exclusive group receiving AI-curated intelligence tailored specifically to your interests.
                            </p>
                            
                            <div style="background-color: #f1f5f9; border-left: 4px solid #1e293b; padding: 16px; margin: 24px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.5;">
                                    <strong>What to expect:</strong><br>
                                    You'll receive a daily digest every morning containing only the most critical updates in the categories you selected. No noise, just signal.
                                </p>
                            </div>

                            <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.6;">
                                We're thrilled to have you with us.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 0 40px 40px; text-align: center;">
                            <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px;">
                                © ${new Date().getFullYear()} Quik News. All rights reserved.
                            </p>
                            <p style="margin: 0; color: #cbd5e1; font-size: 11px;">
                                <a href="https://quiknews.online" style="color: #64748b; text-decoration: none;">Visit Website</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}
