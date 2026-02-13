"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Printer, Phone, MapPin, Shield, User, Car } from "lucide-react"

type TeamSheetData = {
    id: string
    name: string
    address: string
    teamLeader?: { name: string; rank: string; mobile?: string; unit?: string } | null
    officers: { name: string; rank: string; mobile?: string }[]
    witnesses: { name: string; mobile?: string; address?: string }[]
    crpf: { leaderName?: string; strength: number }[]
    drivers: { name: string; vehicle: string; mobile?: string }[]
}

interface TeamSheetsClientProps {
    data: TeamSheetData[]
}

export function TeamSheetsClient({ data }: TeamSheetsClientProps) {
    return (
        <div className="space-y-8 p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center no-print">
                <h2 className="text-3xl font-bold tracking-tight">Team Sheets</h2>
                <Button onClick={() => window.print()} className="gap-2">
                    <Printer className="h-4 w-4" /> Print All
                </Button>
            </div>

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    .page-break { break-after: page; }
                    body { background: white; }
                    .print-sheet { border: 1px solid #000; padding: 20px; box-shadow: none !important; }
                }
            `}</style>

            {data.map((sheet, idx) => (
                <div key={sheet.id} className="page-break mb-8">
                    <Card className="print-sheet border-2">
                        <CardHeader className="border-b bg-slate-50 print:bg-white print:border-b-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Confidential - Operational Team Sheet</div>
                                    <CardTitle className="text-2xl mt-1">{sheet.name}</CardTitle>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold">Sheet #{idx + 1}</div>
                                    <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                                <MapPin className="h-4 w-4" /> {sheet.address}
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-6 pt-6">

                            {/* Team Leader Section */}
                            <div className="p-4 border rounded-md bg-blue-50 print:bg-white print:border-black">
                                <h3 className="font-bold text-lg text-blue-800 mb-2 flex items-center gap-2">
                                    <Shield className="h-5 w-5" /> Team Leader
                                </h3>
                                {sheet.teamLeader ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-muted-foreground block">Name</span>
                                            <span className="font-semibold text-lg">{sheet.teamLeader.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground block">Rank/Unit</span>
                                            <span className="font-medium">{sheet.teamLeader.rank} {sheet.teamLeader.unit && `(${sheet.teamLeader.unit})`}</span>
                                        </div>
                                        {sheet.teamLeader.mobile && (
                                            <div className="col-span-2">
                                                <span className="text-sm text-muted-foreground block">Mobile</span>
                                                <span className="font-mono text-lg">{sheet.teamLeader.mobile}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-red-500 font-bold">NO TEAM LEADER ASSIGNED</div>
                                )}
                            </div>

                            {/* Officers & Witnesses Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold text-md border-b pb-1 mb-3 flex items-center gap-2">
                                        <User className="h-4 w-4" /> Supporting Officers ({sheet.officers.length})
                                    </h3>
                                    {sheet.officers.length > 0 ? (
                                        <ul className="space-y-3">
                                            {sheet.officers.map((off, i) => (
                                                <li key={i} className="text-sm border-b pb-2 last:border-0">
                                                    <span className="font-semibold block">{off.name}</span>
                                                    <span className="text-muted-foreground">{off.rank}</span>
                                                    {off.mobile && <span className="block font-mono text-xs">{off.mobile}</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-sm text-muted-foreground italic">None assigned</span>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-bold text-md border-b pb-1 mb-3 flex items-center gap-2">
                                        <User className="h-4 w-4" /> Witnesses ({sheet.witnesses.length})
                                    </h3>
                                    {sheet.witnesses.length > 0 ? (
                                        <ul className="space-y-3">
                                            {sheet.witnesses.map((w, i) => (
                                                <li key={i} className="text-sm border-b pb-2 last:border-0">
                                                    <span className="font-semibold block">{w.name}</span>
                                                    {w.address && <span className="text-xs text-muted-foreground block">{w.address}</span>}
                                                    {w.mobile && <span className="block font-mono text-xs">{w.mobile}</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-sm text-muted-foreground italic">None assigned</span>
                                    )}
                                </div>
                            </div>

                            {/* CRPF & Logistics Grid */}
                            <div className="grid grid-cols-2 gap-6 mt-2">
                                <div>
                                    <h3 className="font-bold text-md border-b pb-1 mb-3 flex items-center gap-2">
                                        <Shield className="h-4 w-4" /> Security / CRPF
                                    </h3>
                                    {sheet.crpf.length > 0 ? (
                                        <ul className="space-y-2">
                                            {sheet.crpf.map((tm, i) => (
                                                <li key={i} className="text-sm p-2 bg-slate-50 print:bg-white rounded border print:border-black">
                                                    <div className="font-semibold">Team {i + 1}</div>
                                                    <div>Strength: <span className="font-bold">{tm.strength}</span></div>
                                                    {tm.leaderName && <div className="text-xs">Leader: {tm.leaderName}</div>}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-sm text-muted-foreground italic">None assigned</span>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-bold text-md border-b pb-1 mb-3 flex items-center gap-2">
                                        <Car className="h-4 w-4" /> Logistics / Drivers
                                    </h3>
                                    {sheet.drivers.length > 0 ? (
                                        <ul className="space-y-2">
                                            {sheet.drivers.map((d, i) => (
                                                <li key={i} className="text-sm grid grid-cols-2 gap-1 p-2 bg-slate-50 print:bg-white rounded border print:border-black">
                                                    <div className="font-semibold col-span-2">{d.vehicle}</div>
                                                    <div className="text-xs">{d.name}</div>
                                                    <div className="text-xs font-mono">{d.mobile}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-sm text-muted-foreground italic">None assigned</span>
                                    )}
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            ))}
        </div>
    )
}
