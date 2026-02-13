"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Maximize2, Shield, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon


import { getTacticalData } from "@/actions/map"


import { motion } from "framer-motion"
import { useTacticalTheme } from "@/components/providers/theme-provider"

function ChangeView({ center, zoom }: { center: [number, number], zoom?: number }) {
    const map = useMap()
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom || map.getZoom(), {
                animate: true,
                duration: 1.5
            })
        }
    }, [center, zoom, map])
    return null
}

interface MapWidgetProps {
    className?: string
    searchId?: string | null
}

interface TacticalPoint {
    id: string
    name: string
    address: string
    coords: [number, number]
    status: string
    searchName: string
    intensity: string
}

export function MapWidget({ className, searchId }: MapWidgetProps) {
    const { theme } = useTacticalTheme()
    const [mounted, setMounted] = useState(false)
    const [isMaximized, setIsMaximized] = useState(false)
    const [scanProgress, setScanProgress] = useState(94)
    const [spots, setSpots] = useState<TacticalPoint[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        const result = await getTacticalData(searchId)
        if (result.success && result.data) {
            setSpots(result.data)
        }
        setLoading(false)
    }

    useEffect(() => {
        setMounted(true)
        fetchData()

        // Load settings from localStorage
        const savedSettings = localStorage.getItem('map-settings')
        let refreshMs = 30000 // Default 30s

        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings)
                const intervalStr = settings.refreshInterval // '30s', '1m', '5m'
                if (intervalStr === '1m') refreshMs = 60000
                else if (intervalStr === '5m') refreshMs = 300000
                else refreshMs = 30000
            } catch (e) {
                console.error("Failed to parse map settings", e)
            }
        }

        // Refresh based on user preference
        const interval = setInterval(fetchData, refreshMs)

        // Randomize scan progress slightly for effect
        const scanInterval = setInterval(() => {
            setScanProgress(prev => {
                const change = Math.floor(Math.random() * 3) - 1
                const next = prev + change
                return Math.min(Math.max(next, 92), 100)
            })
        }, 5000)

        return () => {
            clearInterval(interval)
            clearInterval(scanInterval)
        }
    }, [searchId]) // Re-fetch when searchId changes

    if (!mounted || loading) return (
        <Card className={cn("glass-card h-full w-full min-h-[400px] flex items-center justify-center", className)}>
            <div className="flex flex-col items-center gap-2">
                <Activity className="h-8 w-8 animate-pulse text-primary" />
                <span className="text-muted-foreground animate-pulse">
                    {!mounted ? "Initializing Tactical Map..." : "Fetching Live Data..."}
                </span>
            </div>
        </Card>
    )

    const getTileUrl = () => {
        switch (theme) {
            case 'day':
                return "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            case 'mfd':
                return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            case 'night':
            default:
                return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        }
    }

    return (
        <Card className={cn(
            "glass-card overflow-hidden flex flex-col group relative transition-all duration-500",
            isMaximized ? "fixed inset-4 z-[5000] h-[calc(100vh-2rem)]" : "h-full",
            theme === 'mfd' && "border-primary/50 shadow-[0_0_20px_rgba(0,255,65,0.1)]",
            className
        )}>
            {/* Map Header Overlay */}
            <div className="absolute top-4 left-4 z-[1000] flex items-center gap-3">
                <div className="glass-panel px-3 py-1.5 rounded-lg flex items-center gap-2 border-primary/20 bg-black/40">
                    <div className={cn(
                        "h-2 w-2 rounded-full animate-pulse",
                        theme === 'mfd' ? "bg-primary shadow-[0_0_8px_var(--color-primary)]" : "bg-primary shadow-[0_0_8px_var(--color-primary)]"
                    )} />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Tactical Feed</span>
                    <span className="text-[10px] text-muted-foreground font-mono ml-2 border-l border-white/10 pl-2">
                        {spots.length} SENSORS
                    </span>
                </div>
            </div>

            {/* Tactical Scanner Effect */}
            {theme === 'mfd' && (
                <div className="absolute inset-0 pointer-events-none z-[500] overflow-hidden opacity-20">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                    <motion.div
                        initial={{ y: "-100%" }}
                        animate={{ y: "100%" }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="w-full h-[2px] bg-primary shadow-[0_0_15px_var(--color-primary)]"
                    />
                </div>
            )}

            {/* Map Controls Overlay */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                <Button
                    size="icon"
                    variant="secondary"
                    onClick={fetchData}
                    className="glass-panel h-8 w-8 border-white/10 hover:border-primary/50 transition-colors"
                >
                    <Activity className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setIsMaximized(!isMaximized)}
                    className={cn(
                        "glass-panel h-8 w-8 border-white/10 hover:border-primary/50 transition-colors",
                        isMaximized && "bg-primary/20 border-primary/40 text-primary"
                    )}
                >
                    <Maximize2 className="h-4 w-4 flex-shrink-0" />
                </Button>
            </div>

            <div className="flex-1 w-full relative">
                <MapContainer
                    center={[20.5937, 78.9629]}
                    zoom={5}
                    style={{
                        height: "100%",
                        width: "100%",
                        background: theme === 'day' ? "#f8fafc" : "#05070a",
                        filter: theme === 'mfd' ? "brightness(0.8) contrast(1.2) sepia(1) hue-rotate(70deg) saturate(2)" : "none"
                    }}
                    zoomControl={false}
                    attributionControl={false}
                >
                    <ChangeView
                        center={spots.length > 0 ? spots[0].coords : [20.5937, 78.9629]}
                        zoom={searchId && searchId !== 'global-view' ? 12 : 5}
                    />
                    <TileLayer url={getTileUrl()} />
                    {spots.map((spot) => (
                        <React.Fragment key={spot.id}>
                            <Marker position={spot.coords}>
                                <Popup className="tactical-popup">
                                    <div className="p-2 min-w-[180px]">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-sm truncate pr-2">{spot.name}</h4>
                                            <span className={cn(
                                                "text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap",
                                                spot.status === "Alert" ? "bg-destructive/20 text-destructive border border-destructive/20" :
                                                    spot.status === "Monitoring" ? "bg-primary/20 text-primary border border-primary/20" :
                                                        "bg-muted/30 text-muted-foreground border border-white/10"
                                            )}>
                                                {spot.status}
                                            </span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[9px] uppercase tracking-tighter text-muted-foreground">Operation</span>
                                                <span className="text-[10px] font-medium truncate">{spot.searchName}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-muted-foreground">Threat Level</span>
                                                <span className={cn(
                                                    "font-mono",
                                                    spot.intensity === "Critical" ? "text-destructive" : "text-primary"
                                                )}>{spot.intensity}</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-1000",
                                                        spot.intensity === "Critical" ? "bg-destructive shadow-[0_0_8px_var(--color-destructive)] w-full" :
                                                            spot.intensity === "High" ? "bg-primary shadow-[0_0_8px_var(--color-primary)] w-3/4" : "bg-blue-400 w-1/2"
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                            <Circle
                                center={spot.coords}
                                radius={100}
                                pathOptions={{
                                    color: spot.status === "Alert" ? "#ef4444" : "#3b82f6",
                                    fillColor: spot.status === "Alert" ? "#ef4444" : "#3b82f6",
                                    fillOpacity: 0.1,
                                    weight: 1,
                                    dashArray: spot.status === "Alert" ? "5, 5" : undefined
                                }}
                            />
                        </React.Fragment>
                    ))}
                </MapContainer>
            </div>


            {/* Bottom Status Bar */}
            <div className="h-10 border-t border-white/10 bg-black/40 backdrop-blur-md px-4 flex items-center justify-between text-[10px] text-muted-foreground font-mono shrink-0">
                <div className="flex gap-4">
                    <span>ACTIVE NODES: {spots.filter(s => s.status === 'Alert').length}</span>
                    <span className={cn(
                        "transition-colors",
                        scanProgress > 98 ? "text-primary" : "text-muted-foreground"
                    )}>SIGNAL: {scanProgress > 95 ? "OPTIMAL" : "STABLE"}</span>
                </div>
                <div>SCANNING: {scanProgress}%</div>
            </div>
        </Card>
    )
}

