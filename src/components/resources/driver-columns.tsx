"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CellAction } from "./cell-action"

export const driverColumns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Name <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: "contactNumber",
        header: "Contact",
    },
    {
        accessorKey: "licenseNumber",
        header: "License No",
    },
    {
        accessorKey: "vehicleType",
        header: "Vehicle Type",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span>{row.getValue("vehicleType")}</span>
            </div>
        )
    },
    {
        accessorKey: "vehicleRegNo",
        header: "Reg No",
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
