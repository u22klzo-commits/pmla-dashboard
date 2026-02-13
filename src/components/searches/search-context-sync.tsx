"use client"

import { useEffect } from "react"
import { setSelectedSearchId } from "@/actions/context"

interface SearchContextSyncProps {
    searchId: string
}

export function SearchContextSync({ searchId }: SearchContextSyncProps) {
    useEffect(() => {
        // Sync the URL ID to the session cookie
        setSelectedSearchId(searchId)
    }, [searchId])

    return null
}
