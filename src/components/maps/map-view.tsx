"use client"

import { Card } from "@/components/ui/card"

export function MapView() {
    return (
        <Card className="h-[500px] w-full flex items-center justify-center bg-muted/50 border-2 border-dashed">
            <div className="text-center space-y-2">
                <p className="text-xl font-semibold text-muted-foreground">Interactive Map View</p>
                <p className="text-sm text-muted-foreground">Map rendering requires configured Leaflet (pending install)</p>
            </div>
        </Card>
    )
}
