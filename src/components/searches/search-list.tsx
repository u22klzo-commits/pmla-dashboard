"use client"

import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { useQuery } from "@tanstack/react-query"
import { getSearches } from "@/actions/searches"
import { Loader2 } from "lucide-react"

interface SearchListProps {
    initialData?: any[]
}

export function SearchList({ initialData }: SearchListProps) {
    const { data: searches, isLoading } = useQuery({
        queryKey: ['searches'],
        queryFn: () => getSearches(),
        initialData: initialData
    })

    if (isLoading && !initialData) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
    }

    return (
        <div className="py-4">
            <DataTable
                columns={columns}
                data={searches || []}
                searchKey="operationName"
                searchPlaceholder="Filter searches..."
            />
        </div>
    )
}

