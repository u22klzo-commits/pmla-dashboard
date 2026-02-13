"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { MapPin, Navigation, X, ArrowUp, ArrowDown, Edit2, Check, Trash2, GripVertical, Clock, Ruler } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RoutePoint {
    id: string
    lat: number
    lng: number
    name: string
    type: 'premise' | 'manual'
    color?: string
}

interface RouteBuilderPanelProps {
    routePoints: RoutePoint[]
    onReorder: (newPoints: RoutePoint[]) => void
    onRemove: (id: string) => void
    onRename: (id: string, newName: string) => void
    routeStats: { distance: string, duration: string } | null
    className?: string
}

export function RouteBuilderPanel({
    routePoints,
    onReorder,
    onRemove,
    onRename,
    routeStats,
    className
}: RouteBuilderPanelProps) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")

    const moveUp = (index: number) => {
        if (index === 0) return
        const newPoints = [...routePoints]
        const temp = newPoints[index]
        newPoints[index] = newPoints[index - 1]
        newPoints[index - 1] = temp
        onReorder(newPoints)
    }

    const moveDown = (index: number) => {
        if (index === routePoints.length - 1) return
        const newPoints = [...routePoints]
        const temp = newPoints[index]
        newPoints[index] = newPoints[index + 1]
        newPoints[index + 1] = temp
        onReorder(newPoints)
    }

    const startEditing = (point: RoutePoint) => {
        setEditingId(point.id)
        setEditName(point.name)
    }

    const saveEdit = () => {
        if (editingId && editName.trim()) {
            onRename(editingId, editName.trim())
            setEditingId(null)
            setEditName("")
        }
    }

    return (
        <div className={cn("bg-background/95 backdrop-blur-sm border rounded-lg shadow-xl flex flex-col w-80 overflow-hidden", className)}>
            <div className="p-3 border-b bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Route Builder</h3>
                </div>
                <div className="text-xs text-muted-foreground font-mono bg-background px-2 py-0.5 rounded border">
                    {routePoints.length} Stops
                </div>
            </div>

            {routeStats && routePoints.length > 1 && (
                <div className="p-3 border-b bg-indigo-50/50 dark:bg-indigo-950/20 text-xs flex items-center justify-around">
                    <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                        <Ruler className="h-3.5 w-3.5" />
                        <span className="font-semibold">{routeStats.distance} km</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-semibold">{routeStats.duration}</span>
                    </div>
                </div>
            )}

            <ScrollArea className="flex-1 max-h-[300px] min-h-[100px]">
                <div className="p-2 space-y-1">
                    {routePoints.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-xs p-4">
                            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p>No stops added.</p>
                            <p className="mt-1 opacity-70">Search and add locations to build a route.</p>
                        </div>
                    )}

                    {routePoints.map((point, index) => (
                        <div
                            key={point.id}
                            className={cn(
                                "group flex items-center gap-2 p-2 rounded-md border border-transparent hover:border-border hover:bg-muted/50 transition-all",
                                point.type === 'manual' ? "bg-orange-50/30 dark:bg-orange-950/10" : "bg-blue-50/30 dark:bg-blue-950/10"
                            )}
                        >
                            <div className="flex flex-col items-center gap-0.5 text-muted-foreground/50">
                                <button disabled={index === 0} onClick={() => moveUp(index)} className="hover:text-primary disabled:opacity-0"><ArrowUp className="h-3 w-3" /></button>
                                <span className="text-[10px] font-mono leading-none">{index + 1}</span>
                                <button disabled={index === routePoints.length - 1} onClick={() => moveDown(index)} className="hover:text-primary disabled:opacity-0"><ArrowDown className="h-3 w-3" /></button>
                            </div>

                            <div className="flex-1 min-w-0">
                                {editingId === point.id ? (
                                    <div className="flex items-center gap-1">
                                        <Input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="h-6 text-xs px-1.5"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                        />
                                        <button onClick={saveEdit} className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: point.color || '#94a3b8' }} />
                                        <span className="text-xs font-medium truncate">{point.name}</span>
                                    </div>
                                )}
                                <div className="text-[10px] text-muted-foreground truncate pl-4">
                                    {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                                </div>
                            </div>

                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                {!editingId && (
                                    <button onClick={() => startEditing(point)} className="text-muted-foreground hover:text-primary p-1">
                                        <Edit2 className="h-3 w-3" />
                                    </button>
                                )}
                                <button onClick={() => onRemove(point.id)} className="text-muted-foreground hover:text-destructive p-1">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
