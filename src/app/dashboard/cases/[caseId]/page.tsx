import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Plus, Calendar, MapPin, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCaseById } from "@/actions/cases"
import { RegisterSearchDialog } from "@/components/searches/register-search-dialog"

export default async function CasePage({ params }: { params: Promise<{ caseId: string }> }) {
    const { caseId } = await params
    const caseItem = await getCaseById(caseId)

    if (!caseItem) {
        notFound()
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/cases" className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight">{caseItem.caseNumber}</h2>
                        <Badge variant={caseItem.status === 'OPEN' ? 'default' : 'secondary'}>
                            {caseItem.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground pl-6">
                        {caseItem.title}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href={`/dashboard/cases/${caseItem.id}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Case
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Case Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                                <p className="text-lg font-semibold">{caseItem.title}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                                <p>{caseItem.status}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                    {caseItem.description || "No description provided."}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Associated Searches</CardTitle>
                            <p className="text-sm text-muted-foreground">Operations registered for this case</p>
                        </div>
                        <RegisterSearchDialog
                            defaultCaseId={caseItem.id}
                            trigger={
                                <Button variant="outline" size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Search
                                </Button>
                            }
                        />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(caseItem as any).searches?.map((search: any) => (
                                <Link
                                    key={search.id}
                                    href={`/dashboard/searches/${search.id}`}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{search.name}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span className="flex items-center">
                                                    <Calendar className="mr-1 h-3 w-3" />
                                                    {new Date(search.date).toLocaleDateString()}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center">
                                                    <MapPin className="mr-1 h-3 w-3" />
                                                    {search._count.premises} Premises
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={search.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                            {search.status}
                                        </Badge>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </Link>
                            ))}
                            {(!(caseItem as any).searches || (caseItem as any).searches.length === 0) && (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                    No searches registered for this case yet.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
