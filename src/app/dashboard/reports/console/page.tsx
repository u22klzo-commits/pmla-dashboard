
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { consoleColumns, ConsoleRow } from "@/components/reports/console-columns"

export const dynamic = "force-dynamic"

export default async function ConsoleViewPage() {
    const premises = await prisma.premise.findMany({
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
        search: p.search.name,
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
            <h2 className="text-3xl font-bold tracking-tight">Consolidated Console</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Global Operational Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable columns={consoleColumns} data={data} searchKey="premise" />
                </CardContent>
            </Card>
        </div>
    )
}
