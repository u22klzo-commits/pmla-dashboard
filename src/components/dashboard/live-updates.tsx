import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { searchService } from "@/lib/services/search-service"
import { caseService } from "@/lib/services/case-service"
import { cn } from "@/lib/utils"

export async function LiveUpdates({ className }: { className?: string }) {
    const [searchesRes, casesRes] = await Promise.all([
        searchService.getSearches(),
        caseService.getCases()
    ])

    const searches = searchesRes.data || []
    const cases = casesRes.data || []

    // Map both to a unified update format
    const updates = [
        ...searches.slice(0, 3).map(s => ({
            id: `s-${s.id}`,
            title: `New Search`,
            details: s.name,
            time: s.createdAt ? new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            isSpecial: s.status === 'ACTIVE'
        })),
        ...cases.slice(0, 2).map(c => ({
            id: `c-${c.id}`,
            title: `Case Initiated`,
            details: c.caseNumber,
            time: c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            isSpecial: false
        }))
    ].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 15)

    return (
        <Card className={cn("glass-card border-none flex flex-col", className)}>
            <CardHeader className="flex-shrink-0 py-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Live Updates</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pt-0 pb-3">
                <div className="flex flex-col gap-3">
                    {updates.map((update) => (
                        <div key={update.id} className="flex gap-3">
                            <span className="relative flex h-2 w-2 mt-1.5">
                                {update.isSpecial && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                )}
                                <span className={cn(
                                    "relative inline-flex rounded-full h-2 w-2",
                                    update.isSpecial ? "bg-primary" : "bg-muted-foreground/30"
                                )}></span>
                            </span>
                            <div className="space-y-0.5">
                                <p className="text-xs text-foreground leading-tight">
                                    <span className="opacity-70">{update.title}:</span> <span className="font-bold">{update.details}</span>
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase opacity-50">{update.time}</p>
                            </div>
                        </div>
                    ))}
                    {updates.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4 italic">No recent updates.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
