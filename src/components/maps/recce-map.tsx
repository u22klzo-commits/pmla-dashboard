"use client"

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Plus } from 'lucide-react'
import { cn } from "@/lib/utils"
import { RouteBuilderPanel, RoutePoint } from "./route-builder-panel"
import { MapSearchOverlay, LocationResult } from "./map-search-overlay"

// Fix for default marker icon in Leaflet with Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

const DEFAULT_MAP_CENTER: [number, number] = [22.5726, 88.3639]

// Helper for custom colored icons with simple cache to prevent recreation and Leaflet errors
const iconCache: Record<string, L.DivIcon> = {}
const getCustomIcon = (color: string) => {
    if (!iconCache[color]) {
        iconCache[color] = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${color}; width: 1.5rem; height: 1.5rem; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 0.5rem; height: 0.5rem; background-color: white; border-radius: 50%;"></div></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
        })
    }
    return iconCache[color]
}

// OSRM Routing Helper (Multi-Stop)
async function getRoute(points: [number, number][]) {
    if (points.length < 2) return null
    try {
        const coordinatesString = points.map(p => `${p[1]},${p[0]}`).join(';')
        const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`
        )
        const data = await response.json()
        if (data.routes && data.routes.length > 0) {
            const coordinates = data.routes[0].geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]])
            return {
                coordinates,
                distance: (data.routes[0].distance / 1000).toFixed(2), // km
                duration: (data.routes[0].duration / 60).toFixed(0) // minutes
            }
        }
    } catch (error) {
        console.error("OSRM Routing failed", error)
    }
    return null
}

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        if (map && center && center[0] && center[1]) {
            try {
                map.flyTo(center, Math.max(map.getZoom(), 13), {
                    animate: true,
                    duration: 1.5
                })
            } catch (e) {
                console.warn("Map flyTo failed (likely unmounted):", e)
            }
        }
    }, [center[0], center[1], map])
    return null
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng)
        },
    })
    return null
}

function MapResizer({ isOpen }: { isOpen: boolean }) {
    const map = useMap()
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize()
        }, 300)
        return () => clearTimeout(timer)
    }, [isOpen, map])
    return null
}

const getSafeCoord = (val: any, base: number, id: string, offsetIdx: number) => {
    if (typeof val === 'number' && !isNaN(val) && val !== 0) return val;

    // Deterministic jitter based on string ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0;
    }
    const jitter = (Math.abs(hash + offsetIdx) % 100) / 5000 - 0.01;
    return base + jitter;
};

interface MapPremise {
    id: string
    lat: number | null
    lng: number | null
    name: string
    address: string
    color: string
    recceStatus: string
    owner: string
}

interface CustomMarker {
    id: string
    lat: number
    lng: number
    name: string
    description?: string
    color: string
}

interface RecceMapProps {
    premises: MapPremise[]
    selectedPremiseId?: string | null
    onMarkerClick?: (id: string) => void
    onAddPremise?: (premise: { name: string, address: string, lat: number, lng: number }) => void
    hqLocation?: [number, number]
    height?: string
    className?: string
}

export default function RecceMap({
    premises,
    selectedPremiseId,
    onMarkerClick,
    onAddPremise,
    hqLocation = DEFAULT_MAP_CENTER,
    height = "600px",
    className
}: RecceMapProps) {
    const [isMounted, setIsMounted] = useState(false)
    const [center, setCenter] = useState<[number, number]>(hqLocation)
    const [routePath, setRoutePath] = useState<[number, number][]>([])
    const [routeStats, setRouteStats] = useState<{ distance: string, duration: string } | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    // Route Building State
    const [routePoints, setRoutePoints] = useState<RoutePoint[]>([])

    // Custom markers state
    const [customMarkers, setCustomMarkers] = useState<CustomMarker[]>([])

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleMapClick = (lat: number, lng: number) => {
        // Mode based interaction could be added here
    }

    const addToRoute = (marker: CustomMarker | MapPremise) => {
        const markerLat = 'lat' in marker ? marker.lat : (marker as MapPremise).lat
        const markerLng = 'lng' in marker ? marker.lng : (marker as MapPremise).lng

        const newPoint: RoutePoint = {
            id: `route-point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            lat: markerLat || hqLocation[0],
            lng: markerLng || hqLocation[1],
            name: marker.name,
            type: marker.id && marker.id.startsWith('custom') ? 'manual' : 'premise',
            color: marker.color
        }
        setRoutePoints(prev => [...prev, newPoint])
        if (!isSidebarOpen) setIsSidebarOpen(true)
    }

    const handleLocationSelect = (loc: LocationResult) => {
        const newMarker: CustomMarker = {
            id: `${loc.type}-${Date.now()}`,
            lat: loc.lat,
            lng: loc.lng,
            name: loc.name,
            description: loc.description,
            color: loc.type === 'manual' ? '#8b5cf6' : loc.type === 'google-maps' ? '#10b981' : '#ec4899'
        }
        setCustomMarkers(prev => [...prev, newMarker])
        setCenter([loc.lat, loc.lng])

        if (loc.type !== 'google-maps') {
            addToRoute(newMarker)
        }
    }

    const removeCustomMarker = (id: string) => {
        setCustomMarkers(prev => prev.filter(m => m.id !== id))
    }

    useEffect(() => {
        if (selectedPremiseId) {
            const selected = premises.find(p => p.id === selectedPremiseId)
            if (selected && selected.lat && selected.lng) {
                setCenter([selected.lat, selected.lng])
            }
        } else if (premises.length > 0) {
            // Find the first premise with valid coordinates
            const firstValid = premises.find(p => p.lat !== null && p.lng !== null && !isNaN(p.lat) && !isNaN(p.lng))
            if (firstValid && firstValid.lat !== null && firstValid.lng !== null) {
                setCenter([firstValid.lat, firstValid.lng])
            } else {
                setCenter(hqLocation)
            }
        } else {
            setCenter(hqLocation)
        }
    }, [selectedPremiseId, hqLocation, premises])

    useEffect(() => {
        const calculateRoute = async () => {
            if (routePoints.length < 2) {
                setRoutePath([])
                setRouteStats(null)
                return
            }

            const points = routePoints.map(p => [p.lat, p.lng] as [number, number])
            const route = await getRoute(points)

            if (route) {
                setRoutePath(route.coordinates as [number, number][])
                setRouteStats({ distance: route.distance, duration: `${route.duration} min` })
            }
        }
        calculateRoute()
    }, [routePoints])

    const handleReorder = (newPoints: RoutePoint[]) => {
        setRoutePoints(newPoints)
    }

    const handleRemovePoint = (id: string) => {
        setRoutePoints(prev => prev.filter(p => p.id !== id))
    }

    const handleRenamePoint = (id: string, newName: string) => {
        setRoutePoints(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p))
        setCustomMarkers(prev => prev.map(m => m.id === id ? { ...m, name: newName } : m))
    }

    if (!isMounted) return <div className="h-[400px] w-full bg-muted flex items-center justify-center animate-pulse rounded-md">Loading Map Engine...</div>

    return (
        <div
            className={cn("flex flex-col md:flex-row w-full rounded-md overflow-hidden border shadow-lg bg-background font-sans relative", className)}
            style={{ height }}
        >
            {/* Map Area */}
            <div className="flex-1 relative min-h-[300px] transition-all duration-300">
                <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none">
                    <div className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Search or Drop Pins</span>
                    </div>
                </div>

                {/* Toggle Button */}
                <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-4 right-4 z-[1000] bg-background/90 backdrop-blur-sm shadow-md border-primary/20 hover:bg-background h-8 px-2 text-xs font-medium"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    {isSidebarOpen ? "Hide Panel" : "Show Panel"}
                </Button>

                <MapContainer
                    center={center}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                    scrollWheelZoom={true}
                >
                    <ChangeView center={center} />
                    <MapResizer isOpen={isSidebarOpen} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Base Camp Marker Removed */}

                    {routePath.length > 0 && (
                        <Polyline positions={routePath} color="#3b82f6" weight={4} opacity={0.6} dashArray="5, 10" />
                    )}

                    {premises.map((premise) => {
                        const lat = getSafeCoord(premise.lat, DEFAULT_MAP_CENTER[0], premise.id, 0);
                        const lng = getSafeCoord(premise.lng, DEFAULT_MAP_CENTER[1], premise.id, 1);
                        const isSelected = premise.id === selectedPremiseId;
                        const markerIcon = premise.color ? getCustomIcon(premise.color) : icon;

                        return (
                            <Marker
                                key={premise.id}
                                position={[lat, lng]}
                                icon={markerIcon}
                                eventHandlers={{
                                    click: () => onMarkerClick && onMarkerClick(premise.id)
                                }}
                                opacity={isSelected ? 1.0 : (selectedPremiseId ? 0.5 : 1.0)}
                            >
                                <Popup>
                                    <div className="text-sm min-w-[150px]">
                                        <h3 className="font-bold border-b pb-1 mb-1" style={{ color: premise.color }}>{premise.name}</h3>
                                        <p className="text-xs leading-relaxed">{premise.address}</p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <Badge variant="outline" className="text-[10px] h-5">
                                                {premise.recceStatus}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 text-[10px] px-2 ml-auto hover:bg-primary/10 hover:text-primary"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    addToRoute({
                                                        id: premise.id,
                                                        lat: lat,
                                                        lng: lng,
                                                        name: premise.name,
                                                        color: premise.color,
                                                        address: premise.address,
                                                        recceStatus: premise.recceStatus,
                                                        owner: premise.owner
                                                    } as MapPremise)
                                                }}
                                            >
                                                <Plus className="h-3 w-3 mr-1" /> Add to Route
                                            </Button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    })}

                    {customMarkers.map((marker) => (
                        <Marker
                            key={marker.id}
                            position={[marker.lat, marker.lng]}
                            icon={getCustomIcon(marker.color)}
                        >
                            <Popup>
                                <div className="text-sm p-1">
                                    <div className="flex items-center justify-between gap-2 mb-1 border-b pb-1">
                                        <span className="font-bold flex items-center gap-1">
                                            <Plus className="h-3 w-3" />
                                            {marker.name}
                                        </span>
                                        <button
                                            onClick={() => removeCustomMarker(marker.id)}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground italic truncate max-w-[200px]">{marker.description}</p>
                                    <div className="mt-2 text-[10px] text-muted-foreground flex gap-2 mb-2">
                                        <span>Lat: {marker.lat.toFixed(6)}</span>
                                        <span>Lng: {marker.lng.toFixed(6)}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 mt-2">
                                        <Button
                                            size="sm"
                                            className="w-full h-7 text-[10px] uppercase tracking-wider font-bold"
                                            onClick={() => {
                                                addToRoute(marker)
                                            }}
                                        >
                                            Add to Route
                                        </Button>
                                        {onAddPremise && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full h-7 text-[10px] uppercase tracking-wider font-bold"
                                                onClick={() => {
                                                    onAddPremise({
                                                        name: marker.name === "Pinned Location" ? "New Target" : marker.name,
                                                        address: marker.description || "Manual Location",
                                                        lat: marker.lat,
                                                        lng: marker.lng
                                                    })
                                                    removeCustomMarker(marker.id)
                                                }}
                                            >
                                                Add to Premises List
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                <style jsx global>{`
                    .leaflet-popup-content-wrapper {
                        border-radius: 8px;
                        padding: 0;
                        overflow: hidden;
                        border: 1px solid hsl(var(--border));
                    }
                    .leaflet-popup-content {
                        margin: 12px;
                    }
                    .leaflet-container {
                        cursor: crosshair;
                    }
                `}</style>
            </div>

            {/* Control Sidebar */}
            <div className={cn(
                "border-t md:border-t-0 md:border-l bg-background/50 backdrop-blur-sm z-10 flex flex-col gap-6 overflow-y-auto box-border transition-all duration-300",
                isSidebarOpen ? "w-full md:w-96 p-4 opacity-100" : "w-0 p-0 opacity-0 overflow-hidden border-none"
            )}>
                <div className="space-y-2 min-w-[300px]">
                    <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1">Location Intelligence</h4>
                    <MapSearchOverlay
                        onLocationSelect={handleLocationSelect}
                        className="static w-full sm:w-full"
                    />
                </div>

                <div className="flex-1 space-y-2 min-w-[300px]">
                    <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1">Route Planning</h4>
                    <div className={cn("transition-all duration-300", routePoints.length > 0 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-50")}>
                        <RouteBuilderPanel
                            routePoints={routePoints}
                            onReorder={handleReorder}
                            onRemove={handleRemovePoint}
                            onRename={handleRenamePoint}
                            routeStats={routeStats}
                            className="w-full border-none shadow-none bg-transparent"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
