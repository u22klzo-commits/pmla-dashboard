"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Users, Car, UserPlus } from "lucide-react"
import { RequisitionDialog } from "@/components/premises/requisition-dialog"

export type RequisitionColumn = {
    id: string
    premiseName: string
    city: string
    requirements?: {
        maleWitness?: number
        femaleWitness?: number
        crpfTeamSize?: number
        crpfMaleCount?: number
        crpfFemaleCount?: number
        vehicles?: number
        distanceFromCrpfCamp?: number
    } | null
    requisitionStatus: string
}

export const requisitionColumns: ColumnDef<RequisitionColumn>[] = [
    {
        accessorKey: "premiseName",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Premise <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("premiseName")}</div>
        )
    },
    {
        accessorKey: "city",
        header: "City",
    },
    {
        id: "witnesses",
        header: () => (
            <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Witnesses
            </div>
        ),
        cell: ({ row }) => {
            const req = row.original.requirements
            if (!req) return <span className="text-muted-foreground">Not set</span>
            return (
                <div className="flex gap-3 text-sm">
                    <span className="flex items-center gap-1">
                        <span className="text-muted-foreground">M:</span>
                        <Badge variant="outline">{req.maleWitness || 0}</Badge>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="text-pink-500">F:</span>
                        <Badge variant="outline">{req.femaleWitness || 0}</Badge>
                    </span>
                </div>
            )
        }
    },
    {
        id: "crpf",
        header: () => (
            <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                CRPF
            </div>
        ),
        cell: ({ row }) => {
            const req = row.original.requirements
            if (!req) return <span className="text-muted-foreground">-</span>
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono">
                            Total: {req.crpfTeamSize || 0}
                        </Badge>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>M: {req.crpfMaleCount || 0}</span>
                        <span>F: {req.crpfFemaleCount || 0}</span>
                    </div>
                </div>
            )
        }
    },
    {
        id: "vehicles",
        header: () => (
            <div className="flex items-center gap-1">
                <Car className="h-4 w-4" />
                Vehicles (w/ Driver)
            </div>
        ),
        cell: ({ row }) => {
            const req = row.original.requirements
            if (!req) return <span className="text-muted-foreground">-</span>
            return (
                <Badge variant="secondary" className="font-mono">
                    {req.vehicles || 0}
                </Badge>
            )
        }
    },
    {
        id: "totalTeam",
        header: "Total Team",
        cell: ({ row }) => {
            const req = row.original.requirements
            if (!req) return <span className="text-muted-foreground">-</span>
            // Total = Witnesses + CRPF + Drivers (1 per vehicle) + 2 Officers
            const crpf = req.crpfTeamSize || ((req.crpfMaleCount || 0) + (req.crpfFemaleCount || 0))
            const total = (req.maleWitness || 0) +
                (req.femaleWitness || 0) +
                crpf +
                (req.vehicles || 0) + // Drivers = vehicles
                2  // 2 officers (team lead + support)
            return (
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 font-bold">
                    {total}
                </Badge>
            )
        }
    },
    {
        accessorKey: "requisitionStatus",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("requisitionStatus") as string
            const variant = status === 'COMPLETED' ? 'default' :
                status === 'PENDING' ? 'secondary' : 'outline'
            const className = status === 'COMPLETED' ? 'bg-green-600' :
                status === 'PENDING' ? 'bg-amber-500' : ''
            return <Badge variant={variant} className={className}>{status}</Badge>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <RequisitionDialog
                premiseId={row.original.id}
                existingRequirements={row.original.requirements}
                trigger={
                    <Button variant="ghost" size="sm" className="gap-1">
                        <UserPlus className="h-4 w-4" />
                        Edit
                    </Button>
                }
            />
        )
    },
]
