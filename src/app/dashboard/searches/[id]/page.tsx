import { notFound } from 'next/navigation'
import { AutoAllocateButton } from '@/components/resources/auto-allocate-button'

export const dynamic = "force-dynamic"

import { getSearchById } from '@/actions/searches'
import { PremiseList } from '@/components/premises/premise-list'
import { CreatePremiseDialog } from '@/components/premises/create-premise-dialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, Map, ArrowLeft, Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { SearchMapWrapper } from '@/components/maps/search-map-wrapper'
import { SearchSwitcher } from '@/components/searches/search-switcher'


interface SearchPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function SearchPage({ params }: SearchPageProps) {
    const { id } = await params
    const search = await getSearchById(id)

    if (!search) {
        notFound()
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/searches" className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight">{search.name}</h2>
                        <Badge variant={search.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {search.status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-muted-foreground pl-6">
                            Case Ref: <Link href={`/dashboard/cases/${search.caseId}`} className="font-medium text-foreground hover:underline">{search.case.caseNumber}</Link> • {search.case.title}
                        </p>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <SearchSwitcher
                            currentSearchId={search.id}
                            searches={search.case.searches as any}
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/resources/officers">
                            <Users className="mr-2 h-4 w-4" />
                            Manage Resources
                        </Link>
                    </Button>
                    <AutoAllocateButton searchId={search.id} />
                    <CreatePremiseDialog searchId={search.id} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Map Overview</CardTitle>
                        <CardDescription>
                            Geospatial view of all target premises.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <SearchMapWrapper premises={search.premises || []} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Operation Details</CardTitle>
                        <CardDescription>
                            Key metrics and timeline.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Execution Date</span>
                                <div className="flex items-center">
                                    <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{new Date(search.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Total Premises</span>
                                <span className="text-2xl font-bold">{search._count.premises}</span>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="rounded-md bg-blue-50 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3 flex-1 md:flex md:justify-between">
                                            <p className="text-sm text-blue-700">
                                                Ensure all premises have "Go" decision before proceeding to Active phase.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold tracking-tight">Target Premises</h3>
                </div>
                <PremiseList searchId={search.id} />
            </div>
        </div>
    )
}
