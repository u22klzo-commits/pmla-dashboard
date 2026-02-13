import { searchService } from "@/lib/services/search-service"
import { SearchSwitcher } from "@/components/searches/search-switcher"
import { Button } from "@/components/ui/button"
import { DownloadIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { DashboardStatus } from "./dashboard-status"
import { ExportButton } from "./export-button"

interface DashboardHeaderProps {
    selectedSearchId: string | null
    userName: string
    className?: string
}

export async function DashboardHeader({ selectedSearchId, userName, className }: DashboardHeaderProps) {
    const normalizedId = selectedSearchId === "global-view" ? null : selectedSearchId
    const [result, allSearchesRes] = await Promise.all([
        normalizedId ? searchService.getSearchById(normalizedId) : Promise.resolve(null),
        searchService.getSearches()
    ])

    const currentSearch = result?.success ? result.data : null
    const allSearches = allSearchesRes.data || []

    return (
        <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-center gap-2", className)}>
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
                    {currentSearch ? currentSearch.name : "Global Overview"}
                </h2>
                <div className="flex items-center gap-3">
                    <DashboardStatus />
                    <span className="text-muted-foreground text-[10px] uppercase font-medium tracking-wider opacity-60">
                        {currentSearch
                            ? `CASE: ${currentSearch.case.caseNumber}`
                            : `OPERATOR: ${userName.toUpperCase()}`}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <SearchSwitcher
                    currentSearchId={selectedSearchId || "global-view"}
                    searches={allSearches as any}
                />
                <ExportButton
                    type="auto"
                    searchId={currentSearch?.id}
                />
            </div>
        </div >
    )
}
