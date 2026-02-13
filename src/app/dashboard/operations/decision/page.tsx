
import { getAllPremises } from "@/actions/premises"
import { DataTable } from "@/components/ui/data-table"
import { premiseColumns } from "@/components/operations/premise-columns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function DecisionStagePage() {
    const allPremises = await getAllPremises()

    // Focus on premises awaiting decision or with completed recce
    const decisionPremises = allPremises.filter(p => p.recceStatus === 'COMPLETED')

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
                <h2 className="text-3xl font-bold tracking-tight">Decision to Search</h2>
                <div className="flex items-center space-x-2">
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Premises Pending Decision</CardTitle>
                    <CardDescription>
                        Approve or Reject search operations for premises with completed recce.
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
