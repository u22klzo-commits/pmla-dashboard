import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"

export const dynamic = "force-dynamic"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getResourceById } from "@/actions/resources"
import { ResourceType } from "@prisma/client"

export default async function ResourcePage({ params }: { params: Promise<{ resourceId: string }> }) {
    const { resourceId } = await params
    const resource = await getResourceById(resourceId) as any

    if (!resource) {
        notFound()
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/resources" className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight">{resource.name}</h2>
                        <Badge variant={resource.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                            {resource.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground pl-6">
                        {resource.type} {resource.rank ? `• ${resource.rank}` : ''}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href={`/dashboard/resources/${resource.id}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Resource
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Resource Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                                <p>{resource.type}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Gender</h3>
                                <p>{resource.gender || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Contact</h3>
                                <p>{resource.contactNumber || 'N/A'}</p>
                            </div>

                            {/* Witness Specific Fields */}
                            {resource.type === ResourceType.WITNESS && (
                                <>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                                        <p>{resource.address || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">ID Type</h3>
                                        <p>{resource.idType || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">ID Number</h3>
                                        <p>{resource.idNumber || 'N/A'}</p>
                                    </div>
                                </>
                            )}

                            {/* Official Specific Fields */}
                            {resource.type === ResourceType.OFFICIAL && (
                                <>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Rank</h3>
                                        <p>{resource.rank || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Designation</h3>
                                        <p>{resource.designation || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Unit</h3>
                                        <p>{resource.unit || 'N/A'}</p>
                                    </div>
                                </>
                            )}

                            {/* Driver Specific Fields */}
                            {resource.type === ResourceType.DRIVER && (
                                <>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">License Number</h3>
                                        <p>{resource.licenseNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Vehicle Reg No</h3>
                                        <p>{resource.vehicleRegNo || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Vehicle Type</h3>
                                        <p>{resource.vehicleType || 'N/A'}</p>
                                    </div>
                                </>
                            )}

                            <div className="col-span-2">
                                <h3 className="text-sm font-medium text-muted-foreground">Additional Details</h3>
                                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                    {resource.details || "No details provided."}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
