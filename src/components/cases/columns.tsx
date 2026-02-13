"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CellAction } from "./cell-action"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Case = {
    id: string
    caseNumber: string
    title: string
    status: string | null
    description: string | null
    createdAt: Date
    updatedAt: Date
    _count?: {
        searches: number
    }
}

export const columns: ColumnDef<Case>[] = [
    {
        accessorKey: "caseNumber",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    ECIR Number
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "title",
        header: "Title/Subject",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={status === 'OPEN' ? 'default' : 'secondary'}
                    className={status === 'OPEN' ? 'bg-green-600 hover:bg-green-700' : ''}>
                    {status}
                </Badge>
            )
        }
    },
    {
        accessorKey: "searches",
        header: "Searches",
        cell: ({ row }) => {
            return <div className="pl-4">{row.original._count?.searches || 0}</div>
        }
    },
    {
        accessorKey: "updatedAt",
        header: "Last Updated",
        cell: ({ row }) => {
            return new Date(row.getValue("updatedAt")).toLocaleDateString()
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]
