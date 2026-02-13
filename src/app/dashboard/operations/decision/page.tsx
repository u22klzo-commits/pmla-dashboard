
import { getAllPremises } from "@/actions/premises"
import { getSelectedSearchId } from "@/actions/context"
import { getSearchById, getSearches } from "@/actions/searches"
import { SearchSwitcher } from "@/components/searches/search-switcher"
import { DataTable } from "@/components/ui/data-table"
import { premiseColumns } from "@/components/operations/premise-columns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function DecisionStagePage() {
    const selectedSearchId = await getSelectedSearchId()

    // Fetch premises filtered by selectedSearchId (if any)
    const allPremises = await getAllPremises(selectedSearchId || undefined)

    // Focus on premises awaiting decision or with completed recce
    const decisionPremises = allPremises.filter(p => p.recceStatus === 'COMPLETED')

    // Get search info for header display
    const currentSearch = selectedSearchId ? await getSearchById(selectedSearchId) : null
    const searches = await getSearches()

    const formattedData = decisionPremises.map(p => ({
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
        gpsLat: p.gpsLat,
        gpsLong: p.gpsLong,
        liveLocationUrl1: p.liveLocationUrl1,
        liveLocationUrl2: p.liveLocationUrl2,
    }))

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Decision to Search</h2>
                    {currentSearch && (
                        <p className="text-muted-foreground text-sm">
                            Case: {currentSearch.case.caseNumber} • Search: {currentSearch.name}
                        </p>
                    )}
                </div>
                <SearchSwitcher
                    currentSearchId={selectedSearchId || 'global-view'}
                    searches={searches as any}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Premises Pending Decision</CardTitle>
                    <CardDescription>
                        {currentSearch
                            ? `Approve or Reject search operations for "${currentSearch.name}".`
                            : "Approve or Reject search operations for premises with completed recce (all searches)."}
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

