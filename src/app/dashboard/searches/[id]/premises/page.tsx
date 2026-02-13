import { getAllPremises } from "@/actions/premises"
import { getSearchById } from "@/actions/searches"
import { SearchSwitcher } from "@/components/searches/search-switcher"
import { DataTable } from "@/components/ui/data-table"
import { premiseColumns } from "@/components/operations/premise-columns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchMapWrapper } from "@/components/maps/search-map-wrapper"

export const dynamic = "force-dynamic"

interface PremisesPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function PremisesPage({ params }: PremisesPageProps) {
    const { id } = await params
    const searchId = id

    const premises = await getAllPremises(searchId)
    const currentSearch = await getSearchById(searchId)

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
    }))

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Premises: {currentSearch?.name || "Loading..."}
                    </h2>
                    {currentSearch && (
                        <p className="text-muted-foreground text-sm">Case: {currentSearch.case.caseNumber}</p>
                    )}
                </div>
                <div className="flex flex-col items-end gap-2">
                    {currentSearch && (
                        <SearchSwitcher
                            currentSearchId={currentSearch.id}
                            searches={(currentSearch.case.searches || []) as any}
                        />
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Premises Map</CardTitle>
                        <CardDescription>
                            Geospatial distribution of all premises for this search.
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
                        <CardDescription>Quick overview.</CardDescription>
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
                        List of all premises in this search operation.
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
