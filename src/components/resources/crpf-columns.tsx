"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CellAction } from "./cell-action"

export const crpfColumns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button variant="ghost" className="-ml-4 hover:bg-transparent font-semibold text-foreground px-4" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Team Leader Name <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
        ),
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>
    },
    {
        accessorKey: "crpfMaleCount",
        header: ({ column }) => (
            <Button variant="ghost" className="hover:bg-transparent font-semibold text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Male Count <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
        ),
        cell: ({ row }) => <div className="text-center w-24">{row.getValue("crpfMaleCount") || 0}</div>
    },
    {
        accessorKey: "crpfFemaleCount",
        header: ({ column }) => (
            <Button variant="ghost" className="hover:bg-transparent font-semibold text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Female Count <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
        ),
        cell: ({ row }) => <div className="text-center w-28 text-pink-600 font-medium">{row.getValue("crpfFemaleCount") || 0}</div>
    },
    {
        accessorKey: "contactNumber",
        header: "Contact Number",
        cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("contactNumber") || "N/A"}</div>
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={status === 'AVAILABLE' ? 'default' : 'secondary'}
                    className={status === 'AVAILABLE' ? 'bg-green-600 hover:bg-green-700' : ''}>
                    {status}
                </Badge>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]
