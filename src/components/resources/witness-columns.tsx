"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CellAction } from "./cell-action"

export const witnessColumns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Name <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: "gender",
        header: "Gender",
    },
    {
        accessorKey: "contactNumber",
        header: "Contact",
    },
    {
        accessorKey: "area",
        header: "Area/Zone",
    },
    {
        accessorKey: "idType",
        header: "ID Type",
    },
    {
        accessorKey: "idNumber",
        header: "ID Number",
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
