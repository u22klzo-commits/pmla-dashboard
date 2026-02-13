import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
    return (
        <div className="space-y-8 p-8 pt-6">
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

            <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
                <div className="col-span-4 lg:col-span-5 space-y-8">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-[150px]" />
                            <Skeleton className="h-4 w-[250px] mt-1" />
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-[120px] rounded-lg" />
                            ))}
                        </CardContent>
                    </Card>

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
                </div>

                <div className="col-span-3 lg:col-span-2 space-y-8">
                    <Card className="h-full">
                        <CardHeader>
                            <Skeleton className="h-6 w-[120px]" />
                            <Skeleton className="h-4 w-[180px] mt-1" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3">
                                        <Skeleton className="h-2 w-2 rounded-full mt-1.5" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-3 w-[80px]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
