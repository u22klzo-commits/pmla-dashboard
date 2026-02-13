"use client"

import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Resource } from "@prisma/client"

interface ResourceListProps {
    resources: Resource[]
}

export function ResourceList({ resources }: ResourceListProps) {
    if (!resources || resources.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">No resources found.</div>
    }

    return (
        <div className="py-4">
            <DataTable columns={columns} data={resources} searchKey="name" searchPlaceholder="Filter resources..." />
        </div>
    )
}
