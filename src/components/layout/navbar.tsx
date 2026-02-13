import { SearchSwitcher } from "@/components/searches/search-switcher"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import Link from "next/link"
import { searchService } from "@/lib/services/search-service"
import { cookies } from "next/headers"
import { ExportButton } from "@/components/dashboard/export-button"
import { ThemeSwitcher } from "./theme-switcher"

export async function Navbar() {
    const searchesRes = await searchService.getSearches()
    const searches = searchesRes.data || []
    const cookieStore = await cookies()
    const selectedSearchId = cookieStore.get('selected_search_id')?.value || null

    return (
        <header className="h-16 border-b border-border/50 bg-background/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-30 w-full transition-all duration-300">
            <div className="flex items-center gap-4">
                <SearchSwitcher
                    currentSearchId={selectedSearchId || "global-view"}
                    searches={searches as any}
                />
            </div>

            <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 mr-4">
                    <ExportButton type="auto" searchId={selectedSearchId || undefined} variant="ghost" size="icon" showLabel={false} className="h-9 w-9 rounded-lg" />
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" title="Calendar View" asChild>
                        <Link href="/dashboard/calendar">
                            <Calendar className="h-5 w-5" />
                        </Link>
                    </Button>
                    <ThemeSwitcher />
                </div>
                <div className="border-l border-border/50 pl-4">
                    <UserNav />
                </div>
            </div>
        </header>
    )
}
