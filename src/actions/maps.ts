"use server"

/**
 * Resolves a Google Maps link to coordinates.
 * Supports:
 * - Short links (goo.gl, maps.app.goo.gl) - follows redirects
 * - Full links (google.com/maps/...) - extracts @lat,lng or !3dlat!4dlng
 */
export async function resolveGoogleMapsLink(url: string) {
    try {
        if (!url.includes("google.com/maps") && !url.includes("goo.gl") && !url.includes("maps.app.goo.gl")) {
            return { success: false, error: "Not a valid Google Maps link" }
        }

        let finalUrl = url

        // 1. Follow Redirects if it's a short link
        if (url.includes("goo.gl") || url.includes("maps.app.goo.gl")) {
            try {
                const response = await fetch(url, {
                    method: 'HEAD',
                    redirect: 'follow'
                })
                finalUrl = response.url
            } catch (e) {
                console.error("Failed to expand short link", e)
                return { success: false, error: "Failed to resolve short link" }
            }
        }

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

        // Pattern 3: search/query (approximate)
        // https://www.google.com/maps/search/22.5726,88.3639
        const searchMatch = finalUrl.match(/search\/(-?\d+\.\d+),(-?\d+\.\d+)/)
        if (searchMatch) {
            return {
                success: true,
                lat: parseFloat(searchMatch[1]),
                lng: parseFloat(searchMatch[2]),
                source: "Google Maps Link"
            }
        }

        return { success: false, error: "Could not extract coordinates from link" }

    } catch (error) {
        console.error("Link resolution error:", error)
        return { success: false, error: "Internal server error during resolution" }
    }
}
