"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Shield, MapPin, Phone } from "lucide-react"
import { ResourceStatus } from "@prisma/client"

type OfficerData = {
    id: string
    name: string
    rank: string | null
    designation: string | null
    unit: string | null
    mobile: string | null
    status: ResourceStatus
    assignedPremise?: {
        name: string
        address: string
    } | null
}

interface OfficerListClientProps {
    data: OfficerData[]
}

export function OfficerListClient({ data }: OfficerListClientProps) {
    const [search, setSearch] = useState("")

    const filtered = data.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.rank?.toLowerCase().includes(search.toLowerCase()) ||
        d.assignedPremise?.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Officer Deployment List</h2>
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search officers, ranks, premises..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Officer Details</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assigned Premise</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No officers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((officer) => (
                                <TableRow key={officer.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-blue-600" />
                                                {officer.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground ml-6">
                                                {officer.rank} {officer.unit ? `• ${officer.unit}` : ''}
                                                {officer.designation && ` • ${officer.designation}`}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {officer.mobile ? (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-3 w-3" /> {officer.mobile}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={officer.status === 'ASSIGNED' ? 'default' : 'secondary'}
                                            className={officer.status === 'ASSIGNED' ? 'bg-blue-600' : 'bg-slate-500'}
                                        >
                                            {officer.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {officer.assignedPremise ? (
                                            <div className="flex flex-col text-sm">
                                                <span className="font-medium">{officer.assignedPremise.name}</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" /> {officer.assignedPremise.address}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-xs italic">Unassigned</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
