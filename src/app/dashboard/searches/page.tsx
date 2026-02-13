import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { SearchList } from "@/components/searches/search-list"
import { Plus } from "lucide-react"
import Link from "next/link"
import { getSearches } from "@/actions/searches"

export const dynamic = 'force-dynamic'

export default async function SearchesPage() {
    const searches = await getSearches()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Search Operations</h2>
                <div className="flex items-center space-x-2">
                    <Button asChild>
                        <Link href="/dashboard/searches/new">
                            <Plus className="mr-2 h-4 w-4" /> New Operation
                        </Link>
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Searches</CardTitle>
                    <CardDescription>Monitor and manage search operations across all cases.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SearchList initialData={searches} />
                </CardContent>
            </Card>
        </div>
    )
}

