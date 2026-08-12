/**
 * Utility function to ping Bing IndexNow API for a new article.
 * This function handles its own errors so it does not block the caller.
 * 
 * @param articleUrl - The full URL of the newly created article.
 */
export const triggerIndexNow = async (articleUrl: string) => {
    const host = "www.quiknews.online";
    const key = "83b4c92a5d9146df";
    const keyLocation = `https://www.quiknews.online/${key}.txt`;

    try {
        const response = await fetch('https://www.bing.com/indexnow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                host,
                key,
                keyLocation,
                urlList: [articleUrl]
            })
        });

        if (response.ok) {
            console.log(`[IndexNow] successfully submitted: ${articleUrl}, status: ${response.status}`);
        } else {
            console.error(`[IndexNow] failed to submit: ${articleUrl}, status: ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        console.error(`[IndexNow] error pinging API for: ${articleUrl}`, error);
    }
};
