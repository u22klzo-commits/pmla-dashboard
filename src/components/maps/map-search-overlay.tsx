"use client"

import { useState, useRef, useEffect } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { resolveGoogleMapsLink } from "@/actions/maps"
import { cn } from "@/lib/utils"

interface SearchResult {
    lat: number
    lon: number
    display_name: string
}

export interface LocationResult {
    lat: number
    lng: number
    name: string
    description?: string
    type: 'manual' | 'google-maps' | 'search'
}

interface MapSearchOverlayProps {
    onLocationSelect: (location: LocationResult) => void
    className?: string
}

export function MapSearchOverlay({ onLocationSelect, className }: MapSearchOverlayProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [showResults, setShowResults] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSearch = async () => {
        if (!searchQuery.trim()) return

        // 1. Check if input is valid coordinates (Lat, Lng)
        // Matches: 22.5726, 88.3639 or 22.5,88.3
        const coordinateMatch = searchQuery.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/)

        if (coordinateMatch) {
            const lat = parseFloat(coordinateMatch[1])
            const lng = parseFloat(coordinateMatch[3])

            // Validate valid geospatial range
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                onLocationSelect({
                    lat,
                    lng,
                    name: "Manual Coordinates",
                    description: `Lat: ${lat}, Lng: ${lng}`,
                    type: 'manual'
                })
                setSearchQuery("")
                setShowResults(false)
                return
            }
        }

        // 2. Check for Google Maps Links
        if (searchQuery.includes("google.com/maps") || searchQuery.includes("goo.gl") || searchQuery.includes("maps.app.goo.gl")) {
            setIsSearching(true)
            setShowResults(false)
            try {
                const result = await resolveGoogleMapsLink(searchQuery)
                if (result.success && result.lat && result.lng) {
                    onLocationSelect({
                        lat: result.lat,
                        lng: result.lng,
                        name: "Google Maps Location",
                        description: "Imported from Link",
                        type: 'google-maps'
                    })
                    setSearchQuery("")
                    return
                } else {
                    console.error("Failed to resolve link:", result.error)
                    // Toast could go here
                }
            } catch (e) {
                console.error("Link resolution failed", e)
            } finally {
                setIsSearching(false)
            }
            return
        }

        // 3. Fallback to Address Search via Photon
        setIsSearching(true)
        try {
            const res = await fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5`
            )
            const data = await res.json()

            const mappedResults = data.features.map((f: any) => ({
                lat: f.geometry.coordinates[1],
                lon: f.geometry.coordinates[0],
                display_name: [f.properties.name, f.properties.street, f.properties.city, f.properties.state, f.properties.country]
                    .filter(Boolean)
                    .join(", ")
            }))

            setSearchResults(mappedResults)
            setShowResults(true)
        } catch (e) {
            console.error("Map search failed", e)
        } finally {
            setIsSearching(false)
        }
    }

    const selectResult = (result: SearchResult) => {
        const lat = parseFloat(result.lat.toString())
        const lon = parseFloat(result.lon.toString())

        onLocationSelect({
            lat,
            lng: lon,
            name: result.display_name.split(',')[0],
            description: result.display_name,
            type: 'search'
        })

        setShowResults(false)
        setSearchQuery("")
    }

    return (
        <div className={cn(
            "z-[1000] w-72 sm:w-80 transition-all duration-200",
            !className?.includes('static') && !className?.includes('relative') && "absolute top-4 left-4",
            className
        )} ref={searchRef}>
            <div className="relative group shadow-lg">
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search address or paste Google Maps link..."
                    className="pr-10 bg-background/95 backdrop-blur-sm border-primary/20 focus-visible:ring-primary shadow-sm"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                        <button onClick={handleSearch} className="hover:text-primary transition-colors p-1">
                            <Search className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {showResults && searchResults.length > 0 && (
                <div className="mt-1 bg-background/95 backdrop-blur-sm border rounded-md shadow-xl max-h-60 overflow-auto animate-in slide-in-from-top-2">
                    {searchResults.map((r, i) => (
                        <button
                            key={i}
                            onClick={() => selectResult(r)}
                            className="w-full text-left px-4 py-2.5 hover:bg-muted text-sm border-b last:border-0 transition-colors flex items-start gap-2"
                        >
                            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                            <span className="line-clamp-2">{r.display_name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
