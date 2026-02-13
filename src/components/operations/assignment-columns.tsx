"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Users, Shield, Car, User, AlertCircle, CheckCircle } from "lucide-react"
import { ResourceAllocationDialog } from "@/components/premises/resource-allocation-dialog"
import { OfficialRank, ResourceType } from "@prisma/client"

export type AssignmentColumn = {
    id: string
    searchId: string
    name: string
    address: string
    // Resource Arrays
    teamLeader?: { name: string; rank: string; unit?: string } | null
    officers: { name: string; rank: string; unit?: string }[]
    witnesses: { name: string; area?: string }[]
    crpfTeams: { name: string; strength: number }[]
    drivers: { name: string; vehicle: string; regNo?: string }[]

    // Status & Validation
    teamSize: number
    requirements?: {
        maleWitness?: number
        femaleWitness?: number
        crpfTeamSize?: number
        vehicles?: number
    } | null
    allocationStatus: string
}

export const assignmentColumns: ColumnDef<AssignmentColumn>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Premise <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.getValue("name")}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {row.original.address}
                </span>
            </div>
        )
    },
    {
        id: "teamLeader",
        header: "Team Leader",
        cell: ({ row }) => {
            const tl = row.original.teamLeader
            if (!tl) return <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Missing</span>
            return (
                <div className="flex flex-col text-sm">
                    <span className="font-semibold text-blue-700">{tl.name}</span>
                    <span className="text-xs text-muted-foreground">{tl.rank} - {tl.unit}</span>
                </div>
            )
        }
    },
    {
        id: "officers",
        header: "Supporting Officers",
        cell: ({ row }) => {
            const officers = row.original.officers
            if (officers.length === 0) return <span className="text-muted-foreground text-xs">-</span>
            return (
                <div className="flex flex-col gap-1">
                    {officers.map((off, idx) => (
                        <div key={idx} className="text-xs flex items-center gap-1">
                            <Shield className="h-3 w-3 text-muted-foreground" />
                            <span>{off.name} <span className="text-muted-foreground">({off.rank})</span></span>
                        </div>
                    ))}
                </div>
            )
        }
    },
    {
        id: "witnesses",
        header: "Witnesses",
        cell: ({ row }) => {
            const witnesses = row.original.witnesses
            if (witnesses.length === 0) return <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="h-3 w-3" /> None</span>
            return (
                <div className="flex flex-col gap-1">
                    {witnesses.map((w, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs w-fit">
                            {w.name} {w.area ? `(${w.area})` : ''}
                        </Badge>
                    ))}
                </div>
            )
        }
    },
    {
        id: "crpf",
        header: "CRPF",
        cell: ({ row }) => {
            const teams = row.original.crpfTeams
            if (teams.length === 0) return <span className="text-muted-foreground text-xs text-red-500">None</span>
            return (
                <div className="flex flex-col gap-1">
                    {teams.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-xs">
                            <Shield className="h-3 w-3 text-green-600" />
                            <span>{t.name} ({t.strength})</span>
                        </div>
                    ))}
                </div>
            )
        }
    },
    {
        id: "drivers",
        header: "Logistics",
        cell: ({ row }) => {
            const drivers = row.original.drivers
            if (drivers.length === 0) return <span className="text-muted-foreground text-xs">-</span>
            return (
                <div className="flex flex-col gap-1">
                    {drivers.map((d, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-xs">
                            <Car className="h-3 w-3 text-muted-foreground" />
                            <span>{d.vehicle} ({d.regNo})</span>
                        </div>
                    ))}
                </div>
            )
        }
    },
    {
        id: "status",
        header: "Team Status",
        cell: ({ row }) => {
            const data = row.original
            const req = data.requirements

            // Simple validation logic
            const hasTL = !!data.teamLeader
            const hasWitness = data.witnesses.length >= (req?.maleWitness || 0) + (req?.femaleWitness || 0)
            const hasCRPF = data.crpfTeams.some(t => t.strength >= (req?.crpfTeamSize || 0))
            const hasVehicles = data.drivers.length >= (req?.vehicles || 0)

            const isReady = hasTL && hasWitness && hasCRPF && hasVehicles

            return (
                <div className="flex flex-col items-center gap-1">
                    <Badge variant={isReady ? "default" : "destructive"} className={isReady ? "bg-green-600" : ""}>
                        {isReady ? "READY" : "INCOMPLETE"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">Size: {data.teamSize}</span>
                </div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <ResourceAllocationDialog
                premiseId={row.original.id}
                searchId={row.original.searchId}
                premiseName={row.original.name}
                trigger={
                    <Button variant="outline" size="sm">Manage</Button>
                }
            />
        )
    },
]
