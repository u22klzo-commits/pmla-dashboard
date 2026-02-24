"use server"

/**
 * Resolves a Google Maps link to coordinates.
 * Supports:
 * - Short links (goo.gl, maps.app.goo.gl) - follows redirects
 * - Full links (google.com/maps/...) - extracts @lat,lng or !3dlat!4dlng
 */
export async function resolveGoogleMapsLink(url: string) {
    try {
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url)
        } catch {
            return { success: false, error: "Invalid URL format" }
        }

        const allowedHosts = ['google.com', 'www.google.com', 'goo.gl', 'maps.app.goo.gl']
        if (!allowedHosts.includes(parsedUrl.hostname)) {
            return { success: false, error: "Invalid domain. Only Google Maps links are allowed." }
        }


        let finalUrl = url

        // 1. Follow Redirects if it's a short link
        if (url.includes("goo.gl") || url.includes("maps.app.goo.gl")) {
            try {
                // Use fetch to follow the redirect and get the final expanded URL
                const response = await fetch(url, {
                    method: 'GET',
                    redirect: 'follow',
                    // Adding a user agent helps prevent Google from serving a barebone page
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                })
                finalUrl = response.url

                // If for some reason it's still a shortlink, let's check the text for a meta redirect
                if (finalUrl.includes("goo.gl")) {
                    const text = await response.text();
                    const metaMatch = text.match(/URL='([^']+)'/);
                    if (metaMatch && metaMatch[1]) {
                        finalUrl = metaMatch[1].replace(/&amp;/g, '&');
                    }
                }

            } catch (e) {
                console.error("Failed to expand short link", e)
                return { success: false, error: "Failed to resolve short link" }
            }
        }

        console.log("Resolved Maps URL:", finalUrl);

        // 2. Extract Coordinates
        // Pattern 1: @lat,lng
        const adAtMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
        if (adAtMatch) {
            return {
                success: true,
                lat: parseFloat(adAtMatch[1]),
                lng: parseFloat(adAtMatch[2]),
                source: "Google Maps Link"
            }
        }

        // Pattern 2: !3dlat!4dlng (often in embed or specific place URLs)
        const dataMatch = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
        if (dataMatch) {
            return {
                success: true,
                lat: parseFloat(dataMatch[1]),
                lng: parseFloat(dataMatch[2]),
                source: "Google Maps Link"
            }
        }

        // Pattern 3: search/query (approximate) /place/lat,lng
        const placeMatch = finalUrl.match(/place\/(-?\d+\.\d+),(-?\d+\.\d+)/)
        if (placeMatch) {
            return {
                success: true,
                lat: parseFloat(placeMatch[1]),
                lng: parseFloat(placeMatch[2]),
                source: "Google Maps Link"
            }
        }

        const searchMatch = finalUrl.match(/search\/(-?\d+\.\d+),(-?\d+\.\d+)/)
        if (searchMatch) {
            return {
                success: true,
                lat: parseFloat(searchMatch[1]),
                lng: parseFloat(searchMatch[2]),
                source: "Google Maps Link"
            }
        }

        // Pattern 4: Query parameter ?q=lat,lng or ll=lat,lng
        const urlObj = new URL(finalUrl);
        const qParam = urlObj.searchParams.get('q') || urlObj.searchParams.get('ll');
        if (qParam) {
            const paramMatch = qParam.match(/(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (paramMatch) {
                return {
                    success: true,
                    lat: parseFloat(paramMatch[1]),
                    lng: parseFloat(paramMatch[2]),
                    source: "Google Maps Link"
                }
            }
        }

        return { success: false, error: "Could not extract coordinates from link" }

    } catch (error) {
        console.error("Link resolution error:", error)
        return { success: false, error: "Internal server error during resolution" }
    }
}
