import { getAllPremises } from "@/actions/premises"
import { getSelectedSearchId } from "@/actions/context"
import { getSearches } from "@/actions/searches"
import { SearchSwitcher } from "@/components/searches/search-switcher"
import { AlertCircle } from "lucide-react"
import { RecceView } from "@/components/operations/recce-view"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const dynamic = "force-dynamic"

const breadcrumbItems = [
    { title: "Operations", link: "/dashboard/operations" },
    { title: "Tactical Recon", link: "/dashboard/operations/recce" }
]

export default async function RecceStagePage() {
    const selectedSearchId = await getSelectedSearchId()
    const searchId = selectedSearchId || 'global-view'

    // Fetch all searches for the switcher
    const searches = await getSearches()

    // Fetch premises based on searchId
    const premises = await getAllPremises(selectedSearchId || undefined)

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="flex items-start justify-between">
                <Heading
                    title={`Tactical Intelligence (${premises.length})`}
                    description="Strategic reconnaissance and target identification mapping."
                />
            </div>

            <Separator />

            {searchId === 'global-view' ? (
                <Alert variant="destructive" className="bg-orange-500/10 text-orange-600 border-orange-200 mb-6">
                    <AlertCircle className="h-4 w-4" stroke="currentColor" />
                    <AlertTitle>Master Overview Mode</AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                        <span>You are currently viewing an aggregated tactical map of all active operations. Target modification is restricted.</span>
                        <div className="ml-4">
                            <SearchSwitcher
                                currentSearchId={searchId}
                                searches={searches as any}
                            />
                        </div>
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="flex justify-end mb-4">
                    <SearchSwitcher
                        currentSearchId={searchId}
                        searches={searches as any}
                    />
                </div>
            )}

            <RecceView
                premises={premises as any}
                searchId={searchId}
                isGlobal={searchId === 'global-view'}
            />
        </div>
    )
}
