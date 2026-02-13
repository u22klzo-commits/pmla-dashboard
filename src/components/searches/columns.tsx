"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CellAction } from "./cell-action"

export type Search = {
    id: string
    name: string
    caseId: string
    status: string
    date: Date
    createdAt: Date
    updatedAt: Date
    case: {
        caseNumber: string
        title: string
    }
    _count?: {
        premises: number
    }
}

export const columns: ColumnDef<Search>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name/Location
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "case.caseNumber",
        header: "Case Ref",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}
                    className={status === 'ACTIVE' ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                    {status}
                </Badge>
            )
        }
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
            return new Date(row.getValue("date")).toLocaleDateString()
        }
    },
    {
        accessorKey: "premises",
        header: "Premises",
        cell: ({ row }) => {
            return (
                <div className="flex items-center pl-4">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    {row.original._count?.premises || 0}
                </div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]
