"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"

export function DashboardStatus() {
    const [hqConfig, setHqConfig] = useState<{ agencyName: string, region: string } | null>(null)

    useEffect(() => {
        const savedHq = localStorage.getItem('hq-config')
        if (savedHq) {
            try {
                setHqConfig(JSON.parse(savedHq))
            } catch (e) {
                console.error("Failed to parse HQ config", e)
            }
        }
    }, [])

    if (!hqConfig) return null

    return (
        <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[10px] h-5 bg-primary/5 border-primary/20 text-primary flex gap-1 items-center font-mono">
                <MapPin className="h-3 w-3" />
                {hqConfig.region.toUpperCase()} UNIT
            </Badge>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">
                {hqConfig.agencyName}
            </span>
        </div>
    )
}
