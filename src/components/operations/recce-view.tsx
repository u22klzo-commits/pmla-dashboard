"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import dynamic from 'next/dynamic'
import { Plus, MapPin, Search, Table as TableIcon } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useMemo, useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CreatePremiseDialog } from "@/components/premises/create-premise-dialog"
import { PremiseWithRelations } from "@/lib/services/premise-service"

const RecceMap = dynamic(() => import("@/components/maps/recce-map"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center text-muted-foreground">Loading Map Intelligence...</div>
})

interface RecceViewProps {
    premises: PremiseWithRelations[]
    searchId: string
    isGlobal?: boolean
}

export function RecceView({ premises, searchId, isGlobal = false }: RecceViewProps) {
    const [selectedPremiseId, setSelectedPremiseId] = useState<string | null>(null)
    const [prefillCoords, setPrefillCoords] = useState<{ lat: number, lng: number } | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const coloredPremises = useMemo(() => {
        const colors = [
            '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
            '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#d946ef', '#f43f5e'
        ]
        return premises.map((p, i) => {
            const officersNum = p.assignedResources.filter(r => r.resource.type === 'OFFICIAL').length
            const hasCrpf = p.assignedResources.some(r => r.resource.type === 'CRPF')

            return {
                id: p.id,
                name: p.name,
                address: p.address,
                lat: p.gpsLat,
                lng: p.gpsLong,
                color: colors[i % colors.length],
                recceStatus: p.recceStatus,
                owner: p.occupantName || "Unknown Occupant",
                searchName: p.search?.name || "Unknown Operation",
                resourceSummary: `${officersNum} PERSONNEL | ${hasCrpf ? 'CRPF SECURED' : 'SECURITY PENDING'}`,
                officers: officersNum,
                hasCrpf
            }
        })
    }, [premises])

    if (premises.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-muted/30">
                <div className="p-4 rounded-full bg-background mb-4 shadow-sm">
                    <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No Premises Found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                    {isGlobal
                        ? "No intelligence targets found in the database. Ensure cases and searches are properly seeded."
                        : "No intelligence targets have been added to this search yet. Add a premise to start planning the operation."}
                </p>
                {!isGlobal && (
                    <div className="mt-4">
                        <CreatePremiseDialog searchId={searchId} />
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
                <Card className="overflow-hidden border-none shadow-xl bg-background/50 backdrop-blur-md h-[600px] flex flex-col">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">Intelligence Map</CardTitle>
                                <CardDescription>Real-time spatial visualization of operation targets.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {isGlobal && <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-200">GLOBAL OVERVIEW</Badge>}
                                <Badge variant="outline" className="font-mono">
                                    {premises.length} TARGETS
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                        <div className="hidden">
                            <CreatePremiseDialog
                                searchId={searchId === 'global' ? '' : searchId}
                                open={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                                defaultValues={prefillCoords ? {
                                    gpsLat: prefillCoords.lat.toString(),
                                    gpsLong: prefillCoords.lng.toString()
                                } : undefined}
                            />
                        </div>
                        <RecceMap
                            key={searchId}
                            premises={coloredPremises as any}
                            selectedPremiseId={selectedPremiseId}
                            onMarkerClick={(id) => setSelectedPremiseId(id)}
                            onAddPremise={isGlobal ? undefined : (p) => {
                                setPrefillCoords({ lat: p.lat, lng: p.lng })
                                setIsDialogOpen(true)
                            }}
                            height="100%"
                            hqLocation={[22.5726, 88.3639] /* Default to Operations Headquarters */}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="col-span-3">
                <Card className="h-[600px] flex flex-col border-none shadow-xl bg-background/50 backdrop-blur-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">Target Directory</CardTitle>
                        <CardDescription>
                            {isGlobal ? "Master operation target list." : "Detailed status and reconnaissance notes."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0">
                        <Table>
                            <TableHeader className="bg-muted/50 sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="w-[180px]">Location</TableHead>
                                    <TableHead>Deployment</TableHead>
                                    <TableHead className="text-right pr-4">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coloredPremises.map((p) => (
                                    <TableRow
                                        key={p.id}
                                        className={cn(
                                            "cursor-pointer transition-colors",
                                            selectedPremiseId === p.id ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/30"
                                        )}
                                        onClick={() => setSelectedPremiseId(p.id)}
                                    >
                                        <TableCell className="font-medium py-3">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-bold truncate max-w-[150px]">{p.name}</span>
                                                <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{p.address}</span>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                                                    <span className="text-[9px] uppercase tracking-tighter text-muted-foreground font-semibold">
                                                        {isGlobal ? p.searchName : p.owner}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-muted-foreground">{p.resourceSummary}</span>
                                                <div className="flex gap-1 h-1 w-full bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: p.officers > 0 ? '60%' : '0%' }} />
                                                    <div className="h-full bg-indigo-500" style={{ width: p.hasCrpf ? '40%' : '0%' }} />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right py-3 pr-4">
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge
                                                    variant={p.recceStatus === 'COMPLETED' ? 'default' : 'outline'}
                                                    className={cn(
                                                        "text-[9px] h-4 px-1 leading-none",
                                                        p.recceStatus === 'PENDING' && "bg-yellow-500/10 text-yellow-600 border-yellow-200",
                                                        p.recceStatus === 'IN_PROGRESS' && "bg-blue-500/10 text-blue-600 border-blue-200",
                                                        p.recceStatus === 'COMPLETED' && "bg-green-500/10 text-green-600 border-green-200"
                                                    )}
                                                >
                                                    {p.recceStatus}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={cn(
                                                        "h-6 w-6",
                                                        selectedPremiseId === p.id ? "text-primary bg-primary/10" : "text-muted-foreground"
                                                    )}
                                                >
                                                    <MapPin className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
