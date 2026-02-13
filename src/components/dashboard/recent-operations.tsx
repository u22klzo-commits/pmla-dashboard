import { searchService } from "@/lib/services/search-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { cn } from "@/lib/utils"

export async function RecentOperations({ className }: { className?: string }) {
    const result = await searchService.getSearches()
    const searches = result.data || []

    // Real activity from searches
    const recentActivity = searches.slice(0, 3).map((s: any) => ({
        id: s.id,
        type: 'search',
        title: s.name,
        time: s.createdAt ? new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently'
    }))

    return (
        <Card className={cn("glass-card border-none flex flex-col", className)}>
            <CardHeader className="flex-shrink-0 py-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pt-0 pb-2">
                <div className="flex flex-col gap-2">
                    {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between border-b border-white/5 last:border-0 pb-2 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-full bg-primary/10">
                                    <Activity className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium leading-none">{activity.title}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">{activity.type}</p>
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground whitespace-nowrap">{activity.time}</p>
                        </div>
                    ))}
                    {recentActivity.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4 italic">No recent activity.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
