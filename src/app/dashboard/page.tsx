import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
// import { MapWidget } from "@/components/dashboard/map-widget"
// import dynamic from "next/dynamic"
import { MapWidgetWrapper } from "@/components/dashboard/map-widget-wrapper"

// const MapWidget = dynamic(() => import("@/components/dashboard/map-widget").then(mod => mod.MapWidget), {
//     ssr: false,
//     loading: () => <Skeleton className="h-full w-full glass-card" />
// })
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentOperations } from "@/components/dashboard/recent-operations"
import { LiveUpdates } from "@/components/dashboard/live-updates"
import { AnimatedLayout, AnimatedGridItem } from "@/components/dashboard/animated-layout"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    const cookieStore = await cookies()
    const selectedSearchId = cookieStore.get('selected_search_id')?.value || null

    return (
        <AnimatedLayout className="h-full gap-3">
            {/* Header Section */}
            <Suspense fallback={<DashboardHeaderSkeleton />}>
                <AnimatedGridItem>
                    <DashboardHeader
                        selectedSearchId={selectedSearchId}
                        userName={session.user?.name || "User"}
                        className="mb-0"
                    />
                </AnimatedGridItem>
            </Suspense>

            {/* Bento Grid Layout - Viewport Optimized */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 min-h-0">

                {/* TOP ROW: KPI CARDS */}
                <div className="col-span-1 md:col-span-4 lg:col-span-6">
                    <Suspense fallback={<KPICardsSkeleton />}>
                        <KPICards selectedSearchId={selectedSearchId || undefined} />
                    </Suspense>
                </div>

                {/* LEFT COLUMN: Map (Tactical Feed) & Quick Actions */}
                <div className="col-span-1 md:col-span-4 lg:col-span-4 flex flex-col gap-3 min-h-0">
                    <AnimatedGridItem className="flex-1 min-h-0">
                        <Suspense fallback={<Skeleton className="h-full w-full glass-card" />}>
                            <MapWidgetWrapper className="h-full" searchId={selectedSearchId} />
                        </Suspense>
                    </AnimatedGridItem>

                    <AnimatedGridItem className="h-fit">
                        <QuickActions />
                    </AnimatedGridItem>
                </div>

                {/* RIGHT COLUMN: Recent Activity & Live Updates */}
                <div className="col-span-1 md:col-span-4 lg:col-span-2 flex flex-col gap-3 min-h-0">
                    <AnimatedGridItem className="h-fit">
                        <Suspense fallback={<RecentOperationsSkeleton />}>
                            <RecentOperations />
                        </Suspense>
                    </AnimatedGridItem>

                    <AnimatedGridItem className="flex-1 min-h-0">
                        <LiveUpdates className="h-full" />
                    </AnimatedGridItem>
                </div>

            </div>
        </AnimatedLayout>
    )
}

function DashboardHeaderSkeleton() {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-4 w-[400px]" />
            </div>
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-[180px]" />
                <Skeleton className="h-9 w-[120px]" />
            </div>
        </div>
    )
}

function KPICardsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-[60px]" />
                        <Skeleton className="h-3 w-[120px] mt-2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function RecentOperationsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-[180px]" />
                <Skeleton className="h-4 w-[300px] mt-1" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between pb-4 border-b last:border-0">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[200px]" />
                                    <Skeleton className="h-3 w-[80px]" />
                                </div>
                            </div>
                            <Skeleton className="h-3 w-[60px]" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
