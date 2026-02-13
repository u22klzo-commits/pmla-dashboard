"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type ConsoleRow = {
    id: string
    search: string
    premise: string
    nature: string
    recce: string
    decision: string
    allocation: string
    witnesses: number
    officials: number
}

export const consoleColumns: ColumnDef<ConsoleRow>[] = [
    { accessorKey: "search", header: "Operation" },
    { accessorKey: "premise", header: "Premise" },
    { accessorKey: "nature", header: "Nature" },
    {
        accessorKey: "recce",
        header: "Recce",
        cell: ({ row }) => <Badge variant="outline">{row.getValue("recce")}</Badge>
    },
    {
        accessorKey: "decision",
        header: "Decision",
        cell: ({ row }) => (
            <Badge variant={row.getValue("decision") === 'APPROVED' ? 'default' : 'secondary'}>
                {row.getValue("decision")}
            </Badge>
        )
    },
    {
        accessorKey: "allocation",
        header: "Allocation",
        cell: ({ row }) => <Badge variant="outline">{row.getValue("allocation")}</Badge>
    },
    { accessorKey: "witnesses", header: "Wit" },
    { accessorKey: "officials", header: "Off" },
]
