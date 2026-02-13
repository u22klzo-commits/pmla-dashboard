"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CellAction } from "./cell-action"

export const officerColumns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Name <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: "rank",
        header: "Rank",
        cell: ({ row }) => <Badge variant="secondary">{row.getValue("rank")}</Badge>
    },
    {
        accessorKey: "designation",
        header: "Designation",
    },
    {
        accessorKey: "unit",
        header: "Unit/Dept",
    },
    {
        accessorKey: "contactNumber",
        header: "Contact",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={status === 'AVAILABLE' ? 'default' : 'secondary'}
                    className={status === 'AVAILABLE' ? 'bg-green-600' : ''}>
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
