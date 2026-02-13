import { getAllPremises } from "@/actions/premises"
import { getSearches } from "@/actions/searches"
import { SearchSwitcher } from "@/components/searches/search-switcher"
import { RecceView } from "@/components/operations/recce-view"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Breadcrumbs } from "@/components/breadcrumbs"

interface ReccePageProps {
    params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic"

export default async function ReccePage({ params }: ReccePageProps) {
    const { id: searchId } = await params

    // Fetch all searches for the switcher
    const searches = await getSearches()
    const currentSearch = searches.find(s => s.id === searchId)

    // Fetch premises for this specific search
    const premises = await getAllPremises(searchId)

    const breadcrumbItems = [
        { title: "Searches", link: "/dashboard/searches" },
        { title: currentSearch?.name || "Operation", link: `/dashboard/searches/${searchId}` },
        { title: "Tactical Recon", link: `/dashboard/searches/${searchId}/recce` }
    ]

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="flex items-start justify-between">
                <Heading
                    title={`Target Intel: ${currentSearch?.name || 'Reconnaissance'}`}
                    description={`Detailed tactical mapping for ${currentSearch?.name || 'this operation'}.`}
                />
                <SearchSwitcher
                    currentSearchId={searchId}
                    searches={searches as any}
                />
            </div>

            <Separator />

            <RecceView
                premises={premises as any}
                searchId={searchId}
            />
        </div>
    )
}
