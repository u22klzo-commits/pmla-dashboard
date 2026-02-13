import { notFound } from 'next/navigation'
import { getPremiseById } from '@/actions/premises'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, User, Phone, FileText, Navigation, Pencil } from 'lucide-react'
import Link from 'next/link'

interface PremiseDetailsPageProps {
    params: Promise<{ id: string }>
}

export default async function PremiseDetailsPage({ params }: PremiseDetailsPageProps) {
    const { id } = await params
    const premise = await getPremiseById(id)

    if (!premise) {
        notFound()
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard/operations/premises">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Premises
                        </Link>
                    </Button>
                </div>
                <Button asChild>
                    <Link href={`/dashboard/operations/premises/${id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Premise
                    </Link>
                </Button>
            </div>

            {/* Title and Status */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{premise.name}</h2>
                    <p className="text-muted-foreground mt-1">{premise.address}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={premise.recceStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                        Recce: {premise.recceStatus}
                    </Badge>
                    <Badge variant={premise.decisionStatus === 'APPROVED' ? 'default' : premise.decisionStatus === 'REJECTED' ? 'destructive' : 'secondary'}>
                        Decision: {premise.decisionStatus}
                    </Badge>
                    <Badge variant={premise.allocationStatus === 'DONE' ? 'default' : 'secondary'}>
                        Allocation: {premise.allocationStatus}
                    </Badge>
                </div>
            </div>

            {/* Details Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Nature</p>
                                <p className="text-sm">{premise.nature}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Location Type</p>
                                <p className="text-sm">{premise.locationType}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Source of Info</p>
                                <p className="text-sm">{premise.sourceOfInfo || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Search Operation</p>
                                <p className="text-sm">{premise.search?.name || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Occupant Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Occupant Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Occupant Name</p>
                                <p className="text-sm">{premise.occupantName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Mobile Number</p>
                                <p className="text-sm">{premise.mobileNumber || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* GPS & Location */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            GPS & Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Latitude</p>
                                <p className="text-sm">{premise.gpsLat ?? 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Longitude</p>
                                <p className="text-sm">{premise.gpsLong ?? 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Distance from CRPF</p>
                                <p className="text-sm">{premise.distanceFromCrpfCamp ? `${premise.distanceFromCrpfCamp} km` : 'N/A'}</p>
                            </div>
                        </div>
                        {(premise.liveLocationUrl1 || premise.liveLocationUrl2 || premise.photoUrl) && (
                            <div className="space-y-2 pt-2 border-t">
                                {premise.liveLocationUrl1 && (
                                    <a href={premise.liveLocationUrl1} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                                        <Navigation className="h-4 w-4" />
                                        Open in Maps (Link 1)
                                    </a>
                                )}
                                {premise.liveLocationUrl2 && (
                                    <a href={premise.liveLocationUrl2} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                                        <Navigation className="h-4 w-4" />
                                        Open in Maps (Link 2)
                                    </a>
                                )}
                                {premise.photoUrl && (
                                    <a href={premise.photoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                                        <FileText className="h-4 w-4" />
                                        View Premise Photo
                                    </a>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recce Notes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Recce Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">
                            {premise.recceNotes || 'No recce notes available.'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Assigned Resources */}
            {premise.assignedResources && premise.assignedResources.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Assigned Resources</CardTitle>
                        <CardDescription>
                            Resources allocated to this premise
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 md:grid-cols-3">
                            {premise.assignedResources.map((ar) => (
                                <div key={ar.id} className="flex items-center gap-2 p-2 border rounded-md">
                                    <Badge variant="outline">{ar.resource.type}</Badge>
                                    <span className="text-sm">{ar.resource.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
