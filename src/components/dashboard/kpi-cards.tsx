import { caseService } from "@/lib/services/case-service"
import { searchService } from "@/lib/services/search-service"
import { resourceService } from "@/lib/services/resource-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Search, Shield, Users } from "lucide-react"
import { MotionDiv, scaleHover, staggerContainer, fadeIn } from "@/components/ui/motion"

interface KPICardsProps {
    selectedSearchId?: string
}

export async function KPICards({ selectedSearchId }: KPICardsProps) {
    // Parallel fetch within the component
    const [casesRes, searchesRes, resourcesRes] = await Promise.all([
        caseService.getCases(),
        searchService.getSearches(),
        resourceService.getResources(undefined, selectedSearchId)
    ])

    const cases = casesRes.data || []
    const searches = searchesRes.data || []
    const resources = resourcesRes.data || []

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))

    const activeCasesCount = cases.filter((c: any) => c.status === 'OPEN').length
    const recentCasesCount = cases.filter((c: any) => new Date(c.createdAt) > thirtyDaysAgo).length

    const pendingSearchesCount = searches.filter((s: any) => s.status === 'PLANNED').length
    const searchesThisWeek = searches.filter((s: any) => {
        const searchDate = new Date(s.date)
        const diff = searchDate.getTime() - now.getTime()
        return diff > 0 && diff < (7 * 24 * 60 * 60 * 1000)
    }).length

    const deployedOfficersCount = resources.filter((r: any) =>
        r.type === 'OFFICIAL' && r.status === 'ASSIGNED'
    ).length

    const availableResourcesCount = resources.filter((r: any) =>
        r.status === 'AVAILABLE'
    ).length

    return (
        <MotionDiv
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
            <MotionDiv variants={fadeIn} {...scaleHover}>
                <Card className="glass-card border-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-0">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Cases</CardTitle>
                        <FileText className="h-3.5 w-3.5 text-primary" />
                    </CardHeader>
                    <CardContent className="p-2 pt-0">
                        <div className="text-2xl font-bold text-foreground">{activeCasesCount}</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                            {recentCasesCount > 0 ? `+${recentCasesCount} NEW` : "STABLE"}
                        </p>
                    </CardContent>
                </Card>
            </MotionDiv>

            <MotionDiv variants={fadeIn} {...scaleHover}>
                <Card className="glass-card border-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-0">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pending Searches</CardTitle>
                        <Search className="h-3.5 w-3.5 text-orange-500" />
                    </CardHeader>
                    <CardContent className="p-2 pt-0">
                        <div className="text-2xl font-bold text-foreground">{pendingSearchesCount}</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                            {searchesThisWeek > 0 ? `${searchesThisWeek} THIS WEEK` : "NONE SCHEDULED"}
                        </p>
                    </CardContent>
                </Card>
            </MotionDiv>

            <MotionDiv variants={fadeIn} {...scaleHover}>
                <Card className="glass-card border-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-0">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Deployed Officers</CardTitle>
                        <Shield className="h-3.5 w-3.5 text-emerald-500" />
                    </CardHeader>
                    <CardContent className="p-2 pt-0">
                        <div className="text-2xl font-bold text-foreground">{deployedOfficersCount}</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                            ACTIVE ASSIGNMENTS
                        </p>
                    </CardContent>
                </Card>
            </MotionDiv>

            <MotionDiv variants={fadeIn} {...scaleHover}>
                <Card className="glass-card border-none h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-0">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Available Resources</CardTitle>
                        <Users className="h-3.5 w-3.5 text-blue-500" />
                    </CardHeader>
                    <CardContent className="p-2 pt-0">
                        <div className="text-2xl font-bold text-foreground">{availableResourcesCount}</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                            READY FOR DEPLOYMENT
                        </p>
                    </CardContent>
                </Card>
            </MotionDiv>
        </MotionDiv>
    )
}
