
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SearchStatus } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { setSelectedSearchId } from '@/actions/context'

interface SearchSummary {
    id: string
    name: string
    status: SearchStatus
    date: Date
}

interface SearchSwitcherProps {
    currentSearchId: string
    searches: SearchSummary[]
    redirectTo?: string
}

export function SearchSwitcher({ currentSearchId, searches, redirectTo }: SearchSwitcherProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const onSelect = async (value: string) => {
        // ... (implementation same as before, but I need to include it in replacement content)
        const targetId = value === 'global-view' ? null : value
        // Note: setSelectedSearchId is likely a server action or context update? 
        // The import says '@/actions/context' which implies server action.
        await setSelectedSearchId(targetId)

        if (redirectTo) {
            router.push(redirectTo)
        } else {
            // If we're on a specific search page, and we switch searches, we should probably go to that new search's page
            // But actually, we just want to update the context for now. The page might need reloading or let the context provider handle it.
            // Given the current implementation:
            if (pathname.startsWith('/dashboard/searches/')) {
                // Try to navigate to the new search id if valid, or dashboard if global?
                // For now preserving previous logic:
                router.push(`/dashboard/searches/${targetId || ''}`)
            } else {
                router.refresh()
            }
        }
    }

    if (!mounted) {
        return <div className="h-10 w-[200px] animate-pulse rounded-md bg-muted/10" />
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Switch Search:</span>
            <Select value={currentSearchId} onValueChange={onSelect}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a search" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="global-view">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">Master Overview</span>
                            <Badge variant="outline" className="text-[10px] h-4 px-1 bg-primary/5">GLOBAL</Badge>
                        </div>
                    </SelectItem>
                    <div className="h-px bg-muted my-1" />
                    {searches.map((search) => (
                        <SelectItem key={search.id} value={search.id}>
                            <div className="flex items-center justify-between w-full gap-2">
                                <span className="truncate max-w-[150px]">{search.name}</span>
                                <Badge variant={search.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-[10px] h-4 px-1">
                                    {search.status}
                                </Badge>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
