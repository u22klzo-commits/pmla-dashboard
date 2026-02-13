
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { consoleColumns, ConsoleRow } from "@/components/reports/console-columns"
import { getSelectedSearchId } from "@/lib/services/search-service"
import { ExportButton } from "@/components/dashboard/export-button"

export const dynamic = "force-dynamic"

export default async function ConsoleViewPage() {
    const searchId = await getSelectedSearchId()
    const isGlobal = !searchId || searchId === 'global-view'

    const where = isGlobal ? {} : { searchId }

    const premises = await prisma.premise.findMany({
        where,
        include: {
            search: true,
            assignedResources: {
                include: {
                    resource: true
                }
            }
        }
    })

    const data: ConsoleRow[] = premises.map(p => ({
        id: p.id,
        search: p.search ? p.search.name : 'Unknown', // Handle potential null search
        premise: p.name,
        nature: p.nature,
        recce: p.recceStatus,
        decision: p.decisionStatus,
        allocation: p.allocationStatus,
        witnesses: p.assignedResources.filter(ar => ar.resource.type === 'WITNESS').length,
        officials: p.assignedResources.filter(ar => ar.resource.type === 'OFFICIAL').length,
    }))

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Consolidated Console</h2>
                <div className="flex items-center space-x-2">
                    <ExportButton type="premises" searchId={isGlobal ? undefined : searchId} />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{isGlobal ? "Global Operational Status" : "Search Operational Status"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable columns={consoleColumns} data={data} searchKey="premise" />
                </CardContent>
            </Card>
        </div>
    )
}
