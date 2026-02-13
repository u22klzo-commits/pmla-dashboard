'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'

const RecceMap = dynamic(() => import('./recce-map'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center text-muted-foreground">Loading Map...</div>
})

interface SearchMapWrapperProps {
    premises: any[]
    height?: string
}

export function SearchMapWrapper({ premises, height = "350px" }: SearchMapWrapperProps) {
    const coloredPremises = useMemo(() => {
        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
            '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'
        ]
        return premises.map((p, i) => ({
            ...p,
            lat: p.gpsLat,
            lng: p.gpsLong,
            color: colors[i % colors.length]
        }))
    }, [premises])

    return <RecceMap premises={coloredPremises} height={height} />
}

