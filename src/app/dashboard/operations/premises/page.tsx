import { getAllPremises } from "@/actions/premises"
import { getSelectedSearchId } from "@/actions/context"
import { getSearchById } from "@/actions/searches"
import { SearchSwitcher } from "@/components/searches/search-switcher"
import { DataTable } from "@/components/ui/data-table"
import { premiseColumns } from "@/components/operations/premise-columns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchMapWrapper } from "@/components/maps/search-map-wrapper"
import { BulkPremiseActions } from "@/components/premises/bulk-premise-actions"
import { DashboardInfoTooltip } from "@/components/ui/dashboard-info-tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Database } from "lucide-react"

export const dynamic = "force-dynamic"



export default async function PremiseMasterPage() {
    const selectedSearchId = await getSelectedSearchId()
    const premises = await getAllPremises(selectedSearchId || undefined)
    const currentSearch = selectedSearchId ? await getSearchById(selectedSearchId) : null

    const formattedData = premises.map((p) => ({
        id: p.id,
        searchId: p.searchId,
        name: p.name,
        address: p.address,
        searchName: p.search?.name || 'N/A',
        locationType: p.locationType,
        nature: p.nature,
        recceStatus: p.recceStatus,
        decisionStatus: p.decisionStatus,
        allocationStatus: p.allocationStatus,
        occupantName: p.occupantName,
        mobileNumber: p.mobileNumber,
        sourceOfInfo: p.sourceOfInfo,
        lat: p.gpsLat,
        lng: p.gpsLong,
        gpsLat: p.gpsLat,
        gpsLong: p.gpsLong,
        liveLocationUrl1: p.liveLocationUrl1,
        liveLocationUrl2: p.liveLocationUrl2,
        photoUrl: p.photoUrl,
    }))

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {currentSearch ? `Premises: ${currentSearch.name}` : "All Premises"}
                    </h2>
                    <DashboardInfoTooltip content={[
                        "📋 This is the Premises Master view — manage all search premises.",
                        "📥 Use 'Bulk Import' to upload premises via CSV template.",
                        "🗺️ The map shows geospatial distribution of premises with GPS data.",
                        "📊 Click any premise row to view details and manage allocations."
                    ]} />
                    {currentSearch && (
                        <p className="text-muted-foreground text-sm">
                            Case: {currentSearch.case.caseNumber}
                        </p>
                    )}
                </div>
                <div className="flex flex-col items-end gap-2">
                    {currentSearch && (
                        <>
                            <SearchSwitcher
                                currentSearchId={currentSearch.id}
                                searches={(currentSearch.case.searches || []) as any}
                            />
                            <BulkPremiseActions searchId={currentSearch.id} />
                        </>
                    )}
                </div>
            </div>

            <Alert className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 mb-2">
                <Database className="h-4 w-4" stroke="currentColor" />
                <AlertTitle className="text-sm font-semibold">Premises Master — Data Management Hub</AlertTitle>
                <AlertDescription className="text-xs">
                    Add, import, edit, and manage all premises. Use bulk CSV import for batch operations. For rapid field recce
                    updates, switch to the Recce dashboard.
                </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Premises Map</CardTitle>
                        <CardDescription>
                            Geospatial distribution of all premises.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <SearchMapWrapper
                            premises={formattedData}
                            height="400px"
                        />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Statistics</CardTitle>
                        <CardDescription>Quick overview of premises.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Premises</p>
                                <p className="text-2xl font-bold">{formattedData.length}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cleared</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formattedData.filter(p => p.recceStatus === 'COMPLETED').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Search Premises</CardTitle>
                    <CardDescription>
                        Centralized view of all premises across all search operations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={premiseColumns}
                        data={formattedData}
                        searchKey="name"
                        searchPlaceholder="Search premises..."
                    />
                </CardContent>
            </Card>
        </div>
    )
}

