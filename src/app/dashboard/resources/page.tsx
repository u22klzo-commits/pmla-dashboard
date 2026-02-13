import { getResources } from "@/actions/resources"
import { getSelectedSearchId } from "@/actions/context"
import { getSearchById } from "@/actions/searches"
import { SearchSwitcher } from "@/components/searches/search-switcher"
import { ResourceList } from "@/components/resources/resource-list"
import { CreateResourceDialog } from "@/components/resources/create-resource-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function ResourcesPage() {
    const selectedSearchId = await getSelectedSearchId()
    const resources = await getResources(undefined, selectedSearchId || undefined)
    const currentSearch = selectedSearchId ? await getSearchById(selectedSearchId) : null

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {currentSearch ? `Resources: ${currentSearch.name}` : "All Resources"}
                    </h2>
                    {currentSearch && (
                        <p className="text-muted-foreground text-sm">
                            Case: {currentSearch.case.caseNumber}
                        </p>
                    )}
                </div>
                <div className="flex flex-col items-end gap-2">
                    {currentSearch && (
                        <SearchSwitcher
                            currentSearchId={currentSearch.id}
                            searches={(currentSearch.case.searches || []) as any}
                        />
                    )}
                    <div className="flex items-center space-x-2">
                        <CreateResourceDialog searchId={selectedSearchId || undefined} />
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Resource Pool</CardTitle>
                    <CardDescription>
                        Manage all personnel and assets available for deployment.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResourceList resources={resources} />
                </CardContent>
            </Card>
        </div>
    )
}
