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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MapPin, Phone, Shield, User, Globe } from "lucide-react"

type SeniorReportData = {
    id: string
    name: string
    address: string
    gpsLat?: number | null
    gpsLong?: number | null
    locationType?: string | null
    teamLeader?: { name: string; rank: string; mobile?: string } | null
    officers: { name: string; rank: string }[]
    witnesses: { name: string; mobile?: string }[]
    crpfStrength: number
    driverCount: number
}

interface SeniorReportClientProps {
    data: SeniorReportData[]
}

export function SeniorReportClient({ data }: SeniorReportClientProps) {
    const [showGPS, setShowGPS] = useState(false)
    const [showNature, setShowNature] = useState(false)

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>Senior Operational Report</CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Switch id="gps" checked={showGPS} onCheckedChange={setShowGPS} />
                                <Label htmlFor="gps">Show GPS</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="nature" checked={showNature} onCheckedChange={setShowNature} />
                                <Label htmlFor="nature">Show Nature</Label>
                            </div>
                            <Button variant="outline" onClick={() => window.print()}>
                                Print Report
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Premise</TableHead>
                                    {showNature && <TableHead>Nature</TableHead>}
                                    <TableHead>Team Leader</TableHead>
                                    <TableHead>Team Composition</TableHead>
                                    <TableHead>Logistics</TableHead>
                                    {showGPS && <TableHead>Location</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium align-top">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-base">{row.name}</span>
                                                <span className="text-xs text-muted-foreground">{row.address}</span>
                                            </div>
                                        </TableCell>

                                        {showNature && (
                                            <TableCell className="align-top">
                                                <Badge variant="outline">{row.locationType || 'N/A'}</Badge>
                                            </TableCell>
                                        )}

                                        <TableCell className="align-top">
                                            {row.teamLeader ? (
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-blue-700">{row.teamLeader.name}</span>
                                                    <span className="text-xs text-muted-foreground">{row.teamLeader.rank}</span>
                                                    {row.teamLeader.mobile && (
                                                        <span className="text-xs flex items-center gap-1 mt-1">
                                                            <Phone className="h-3 w-3" /> {row.teamLeader.mobile}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-red-500 text-xs">Unassigned</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="align-top">
                                            <div className="flex flex-col gap-2 text-sm">
                                                {/* Summary Stats */}
                                                <div className="flex gap-2">
                                                    <Badge variant="secondary" className="gap-1">
                                                        <User className="h-3 w-3" /> {row.officers.length} Off.
                                                    </Badge>
                                                    <Badge variant="secondary" className="gap-1">
                                                        <User className="h-3 w-3" /> {row.witnesses.length} Wit.
                                                    </Badge>
                                                    <Badge variant="secondary" className="gap-1">
                                                        <Shield className="h-3 w-3" /> {row.crpfStrength} CRPF
                                                    </Badge>
                                                </div>

                                                {/* Detailed Lists (Compact) */}
                                                {(row.officers.length > 0 || row.witnesses.length > 0) && (
                                                    <div className="text-xs text-muted-foreground mt-1 grid grid-cols-2 gap-2">
                                                        <div>
                                                            <span className="font-semibold block text-slate-700">Officers</span>
                                                            {row.officers.slice(0, 3).map(o => o.name).join(", ")}
                                                            {row.officers.length > 3 && ", ..."}
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold block text-slate-700">Witnesses</span>
                                                            {row.witnesses.map(w => w.name).join(", ")}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="align-top">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{row.driverCount} Vehicles</span>
                                            </div>
                                        </TableCell>

                                        {showGPS && (
                                            <TableCell className="align-top">
                                                {row.gpsLat && row.gpsLong ? (
                                                    <a
                                                        href={`https://maps.google.com/?q=${row.gpsLat},${row.gpsLong}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                                    >
                                                        <MapPin className="h-3 w-3" /> {row.gpsLat.toFixed(4)}, {row.gpsLong.toFixed(4)}
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
