import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Search, MapPin, Users, ArrowRight } from "lucide-react"

interface CaseSearchSummaryProps {
    selectedSearchId?: string | null
}

export async function CaseSearchSummary({ selectedSearchId }: CaseSearchSummaryProps) {
    // Fetch all cases with their searches, premise counts, and resource counts
    const cases = await prisma.case.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
            searches: {
                orderBy: { date: 'desc' },
                include: {
                    _count: {
                        select: {
                            premises: true,
                            resources: true,
                        }
                    }
                }
            }
        }
    })

    if (cases.length === 0) {
        return (
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        Case Reports
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No cases found. Create a case to get started.</p>
                </CardContent>
            </Card>
        )
    }

    const statusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500/15 text-green-400 border-green-500/20'
            case 'COMPLETED': return 'bg-blue-500/15 text-blue-400 border-blue-500/20'
            case 'PLANNED': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
            default: return 'bg-muted/30 text-muted-foreground border-white/10'
        }
    }

    return (
        <Card className="glass-card">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Case-wise Reports
                </CardTitle>
                <CardDescription>
                    Overview of all cases and their search operations.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {cases.map((caseItem) => (
                    <div
                        key={caseItem.id}
                        className="rounded-lg border border-white/10 bg-card/50 p-3 space-y-2"
                    >
                        {/* Case Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-primary/70" />
                                <span className="font-semibold text-sm">{caseItem.title}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                    {caseItem.caseNumber}
                                </span>
                            </div>
                            <Badge variant="outline" className={`text-[10px] ${statusColor(caseItem.status || 'ACTIVE')}`}>
                                {caseItem.status || 'ACTIVE'}
                            </Badge>
                        </div>

                        {/* Searches List */}
                        {caseItem.searches.length === 0 ? (
                            <p className="text-xs text-muted-foreground pl-6">No searches yet.</p>
                        ) : (
                            <div className="pl-4 space-y-1.5">
                                {caseItem.searches.map((search) => (
                                    <Link
                                        key={search.id}
                                        href={`/dashboard/searches/${search.id}`}
                                        className="flex items-center justify-between p-2 rounded-md hover:bg-accent/30 transition-colors group"
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                            <span className="text-xs font-medium truncate">{search.name}</span>
                                            <Badge
                                                variant="outline"
                                                className={`text-[9px] px-1.5 py-0 ${statusColor(search.status)}`}
                                            >
                                                {search.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {search._count.premises}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {search._count.resources}
                                            </span>
                                            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
