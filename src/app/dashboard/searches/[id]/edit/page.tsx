import { getSearchById } from "@/actions/searches"
import { getCases } from "@/actions/cases"
import { SearchForm } from "@/components/searches/search-form"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function EditSearchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const search = await getSearchById(id)
    const cases = await getCases()

    if (!search) {
        notFound()
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Edit Search</h2>
            </div>
            <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                <SearchForm initialData={search} cases={cases} />
            </div>
        </div>
    )
}
