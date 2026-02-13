"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, User, Car, Shield, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CellAction } from "./cell-action"

// Extended Resource type with all fields from schema
export type Resource = {
    id: string
    name: string
    type: string
    gender: string
    status: string
    contactNumber?: string | null

    // Witness specific
    address?: string | null
    area?: string | null
    idType?: string | null
    idNumber?: string | null

    // Officer specific
    rank?: string | null
    designation?: string | null
    unit?: string | null
    remarks?: string | null

    // Driver specific
    licenseNumber?: string | null
    vehicleType?: string | null
    vehicleRegNo?: string | null

    // CRPF specific
    crpfMaleCount?: number | null
    crpfFemaleCount?: number | null

    details?: string | null
    createdAt: Date
    updatedAt: Date
}

// Type icons for visual distinction
const typeIcons: Record<string, React.ElementType> = {
    WITNESS: User,
    DRIVER: Car,
    OFFICIAL: Shield,
    CRPF: Users,
}

export const columns: ColumnDef<Resource>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const type = row.original.type
            const Icon = typeIcons[type] || User
            return (
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{row.getValue("name")}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string
            const colorMap: Record<string, string> = {
                WITNESS: "bg-blue-100 text-blue-800 border-blue-300",
                DRIVER: "bg-purple-100 text-purple-800 border-purple-300",
                OFFICIAL: "bg-amber-100 text-amber-800 border-amber-300",
                CRPF: "bg-green-100 text-green-800 border-green-300",
            }
            return (
                <Badge variant="outline" className={colorMap[type] || ""}>
                    {type}
                </Badge>
            )
        }
    },
    {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ row }) => {
            const gender = row.getValue("gender") as string
            return (
                <span className="text-sm">
                    {gender === "MALE" ? "M" : gender === "FEMALE" ? "F" : "O"}
                </span>
            )
        }
    },
    {
        accessorKey: "info",
        header: "Details",
        cell: ({ row }) => {
            const r = row.original

            // Type-specific info display
            if (r.type === 'OFFICIAL') {
                const rankStr = r.rank ? `${r.rank}` : ''
                const unitStr = r.unit ? ` • ${r.unit}` : ''
                return (
                    <div className="text-sm">
                        <span className="font-medium">{rankStr}</span>
                        {unitStr && <span className="text-muted-foreground">{unitStr}</span>}
                    </div>
                )
            }

            if (r.type === 'WITNESS') {
                const areaStr = r.area || 'No area'
                const idStr = r.idType ? ` • ${r.idType}` : ''
                return (
                    <div className="text-sm">
                        <span>{areaStr}</span>
                        {idStr && <span className="text-muted-foreground">{idStr}</span>}
                    </div>
                )
            }

            if (r.type === 'DRIVER') {
                const vehicleStr = r.vehicleType || 'No vehicle'
                const regStr = r.vehicleRegNo ? ` • ${r.vehicleRegNo}` : ''
                return (
                    <div className="text-sm">
                        <span>{vehicleStr}</span>
                        {regStr && <span className="text-muted-foreground">{regStr}</span>}
                    </div>
                )
            }

            if (r.type === 'CRPF') {
                const maleCount = r.crpfMaleCount ?? 0
                const femaleCount = r.crpfFemaleCount ?? 0
                return (
                    <div className="text-sm">
                        <span className="font-medium">{maleCount + femaleCount}</span>
                        <span className="text-muted-foreground"> personnel ({maleCount}M / {femaleCount}F)</span>
                    </div>
                )
            }

            // Fallback to contact number
            return <div className="text-sm text-muted-foreground">{r.contactNumber || '-'}</div>
        }
    },
    {
        accessorKey: "contactNumber",
        header: "Contact",
        cell: ({ row }) => {
            const contact = row.getValue("contactNumber") as string | null
            return <span className="text-sm">{contact || '-'}</span>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge
                    variant={status === 'AVAILABLE' ? 'default' : status === 'ASSIGNED' ? 'secondary' : 'destructive'}
                    className={status === 'AVAILABLE' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
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
