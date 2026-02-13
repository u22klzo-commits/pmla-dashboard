"use client"

import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { useQuery } from "@tanstack/react-query"
import { getCases } from "@/actions/cases"
import { Loader2 } from "lucide-react"

interface CaseListProps {
    initialData: any[]
}

export function CaseList({ initialData }: CaseListProps) {
    const { data: cases, isLoading } = useQuery({
        queryKey: ['cases'],
        queryFn: () => getCases(),
        initialData: initialData
    })

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
    }

    if (!cases) {
        return <div className="p-8 text-center text-muted-foreground">No cases found. Create one to get started.</div>
    }

    return (
        <div className="py-4">
            <DataTable columns={columns} data={cases} searchKey="title" searchPlaceholder="Filter by title..." />
        </div>
    )
}
