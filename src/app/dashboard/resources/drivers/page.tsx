import { getResources } from "@/actions/resources"
import { getSelectedSearchId } from "@/actions/context"
import { getSearchById } from "@/actions/searches"
import { SearchSwitcher } from "@/components/searches/search-switcher"
import { DataTable } from "@/components/ui/data-table"
import { driverColumns } from "@/components/resources/driver-columns"
import { CreateResourceDialog } from "@/components/resources/create-resource-dialog"
import { BulkResourceActions } from "@/components/resources/bulk-resource-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function DriversPage() {
    const selectedSearchId = await getSelectedSearchId()
    const allResources = await getResources(undefined, selectedSearchId || undefined)
    const drivers = allResources.filter(r => r.type === 'DRIVER')

    const currentSearch = selectedSearchId ? await getSearchById(selectedSearchId) : null

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-end justify-between border-b pb-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        {currentSearch ? `Drivers: ${currentSearch.name}` : "All Drivers"}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Manage drivers and assigned vehicles.
                    </p>
                </div>
                <div className="flex flex-col items-end gap-4">
                    {currentSearch && (
                        <SearchSwitcher
                            currentSearchId={currentSearch.id}
                            searches={(currentSearch.case.searches || []) as any}
                        />
                    )}
                    <div className="flex items-center gap-2">
                        <BulkResourceActions type="DRIVER" searchId={selectedSearchId || undefined} />
                        <CreateResourceDialog initialType="DRIVER" searchId={selectedSearchId || undefined} />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-card/50 backdrop-blur-sm shadow-sm border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Drivers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{drivers.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm shadow-sm border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {drivers.filter(d => d.status === 'AVAILABLE').length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm shadow-sm border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">In Field</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">
                            {drivers.filter(d => d.status === 'ASSIGNED').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm mt-6">
                <CardHeader className="px-6 py-4">
                    <CardTitle className="text-lg font-semibold">Driver Directory</CardTitle>
                    <CardDescription>Filter and manage drivers and vehicle assignments.</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <DataTable
                        columns={driverColumns}
                        data={drivers}
                        searchKey="name"
                        searchPlaceholder="Search drivers..."
                    />
                </CardContent>
            </Card>
        </div>
    )
}
