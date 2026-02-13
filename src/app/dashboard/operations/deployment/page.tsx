import { getAllPremises } from "@/actions/premises"
import { getSelectedSearchId } from "@/actions/context"
import { getSearchById } from "@/actions/searches"
import { SearchSwitcher } from "@/components/searches/search-switcher"
import { DataTable } from "@/components/ui/data-table"
import { assignmentColumns } from "@/components/operations/assignment-columns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AutoAssignButton } from "@/components/operations/auto-assign-button"
import { Search as SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DeploymentPage() {
    const selectedSearchId = await getSelectedSearchId()

    if (!selectedSearchId) {
        return (
            <div className="p-8">
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 flex flex-col items-center justify-center text-center space-y-4 max-w-2xl mx-auto">
                    <div className="p-3 bg-yellow-100 rounded-full">
                        <SearchIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-yellow-900">No Search Selected</h3>
                        <p className="text-sm text-yellow-700 max-w-md mt-1">
                            Deployment and team assignments are managed relative to a specific search. Please select a search from the dashboard to continue.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                </div>
            </div>
        )
    }

    const currentSearch = await getSearchById(selectedSearchId)
    const allPremises = await getAllPremises(selectedSearchId)

    // Focus on premises approved for search
    const approvedPremises = allPremises.filter(p => p.decisionStatus === 'APPROVED')

    const formattedData = approvedPremises.map(p => {
        const resources = p.assignedResources.map(ar => ar.resource)

        // Categorize Resources
        const witnesses = resources.filter(r => r.type === 'WITNESS').map(r => ({
            name: r.name,
            area: r.area || undefined
        }))

        const officialResources = resources.filter(r => r.type === 'OFFICIAL')

        // Rank Priority (Lower index = Higher Rank)
        const rankPriority: Record<string, number> = {
            'AD': 1,
            'EO': 2,
            'AEO': 3,
            'DSP': 4,
            'INSPECTOR': 5,
            'SI': 6,
            'ASI': 7,
            'HC': 8,
            'CONSTABLE': 9,
            'OTHER': 10
        }

        // Sort officials by rank
        officialResources.sort((a, b) => {
            const rankA = a.rank ? rankPriority[a.rank] || 99 : 99;
            const rankB = b.rank ? rankPriority[b.rank] || 99 : 99;
            return rankA - rankB;
        });

        const teamLeaderResource = officialResources.length > 0 ? officialResources[0] : null

        const teamLeader = teamLeaderResource ? {
            name: teamLeaderResource.name,
            rank: teamLeaderResource.rank || 'Officer',
            unit: teamLeaderResource.unit || undefined
        } : null

        const officers = officialResources.slice(1).map(r => ({
            name: r.name,
            rank: r.rank || 'Officer',
            unit: r.unit || undefined
        }))

        const drivers = resources.filter(r => r.type === 'DRIVER').map(r => ({
            name: r.name,
            vehicle: r.vehicleType || 'Unknown',
            regNo: r.vehicleRegNo || undefined
        }))

        const crpfTeams = resources.filter(r => r.type === 'CRPF').map(r => ({
            name: r.name, // Team Leader Name
            strength: (r.crpfMaleCount || 0) + (r.crpfFemaleCount || 0)
        }))

        return {
            id: p.id,
            searchId: p.searchId,
            name: p.name,
            address: p.address,

            teamLeader,
            officers,
            witnesses,
            drivers,
            crpfTeams,

            teamSize: resources.length + crpfTeams.reduce((acc, t) => acc + t.strength, 0),
            requirements: p.requirements as any,
            allocationStatus: p.allocationStatus,
            locationType: p.locationType
        }
    })

    // Filter by locationType enum field 
    const kolkataPremises = formattedData.filter(p => p.locationType === 'KOLKATA')
    const outsidePremises = formattedData.filter(p => p.locationType === 'OUTSIDE')

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Assignment & Deployment</h2>
                    {currentSearch && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span>Case: {currentSearch.case.caseNumber}</span>
                            <span>•</span>
                            <span>Search: {currentSearch.name}</span>
                        </div>
                    )}
                </div>
                {currentSearch && (
                    <SearchSwitcher
                        currentSearchId={currentSearch.id}
                        searches={(currentSearch.case.searches || []) as any}
                    />
                )}
            </div>

            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">All Approved ({formattedData.length})</TabsTrigger>
                    <TabsTrigger value="kolkata">Kolkata ({kolkataPremises.length})</TabsTrigger>
                    <TabsTrigger value="outside">Outside ({outsidePremises.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle>All Deployment Units</CardTitle>
                                <CardDescription>Final team assignments and departure status.</CardDescription>
                            </div>
                            <AutoAssignButton />
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={assignmentColumns} data={formattedData} searchKey="name" />
                        </CardContent>
                    </Card>
                </TabsContent>


                <TabsContent value="kolkata" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Kolkata Units</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={assignmentColumns} data={kolkataPremises} searchKey="name" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="outside" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Outside Units</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={assignmentColumns} data={outsidePremises} searchKey="name" />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
