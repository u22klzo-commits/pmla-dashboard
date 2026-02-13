import { getCases } from "@/actions/cases"
import { SearchForm } from "@/components/searches/search-form"

export const dynamic = "force-dynamic"

export default async function NewSearchPage() {
    const cases = await getCases()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Create Search</h2>
            </div>
            <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                <SearchForm cases={cases} />
            </div>
        </div>
    )
}
