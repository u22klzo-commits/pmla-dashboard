"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

const MapWidget = dynamic(() => import("@/components/dashboard/map-widget").then(mod => mod.MapWidget), {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full glass-card" />
})

export function MapWidgetWrapper(props: any) {
    return <MapWidget {...props} />
}
