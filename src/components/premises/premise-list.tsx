'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPremises, updatePremiseStatus } from '@/actions/premises'
import { Loader2, Home, Building2, Warehouse, Factory, HelpCircle, MapPin, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PremiseNature, RecceStatus, DecisionStatus } from '@prisma/client'
import { ResourceAllocationDialog } from '@/components/resources/resource-allocation-dialog'
import { RequisitionDialog } from '@/components/premises/requisition-dialog'
import { deallocateResource } from '@/actions/resources'
import { deletePremise } from '@/actions/premises'
import { Trash2, Trash } from 'lucide-react'
import { AlertModal } from '@/components/ui/alert-modal'

interface PremiseListProps {
    searchId: string
}

const natureIcons: Record<string, any> = {
    RESIDENTIAL: Home,
    COMMERCIAL: Building2,
    OFFICE: Building2,
    INDUSTRIAL: Factory,
    OTHERS: HelpCircle
}

import { SearchMapWrapper } from '@/components/maps/search-map-wrapper'
import { LayoutGrid, Map as MapIcon } from 'lucide-react'
import { useState } from 'react'

import { useToast } from '@/components/ui/use-toast'

export function PremiseList({ searchId }: PremiseListProps) {
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const { data: premises, isLoading } = useQuery({
        queryKey: ['premises', searchId],
        queryFn: () => getPremises(searchId)
    })

    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const onDelete = async (id: string) => {
        try {
            setIsDeleting(true)
            const result = await deletePremise(id)
            if (result.success) {
                toast({
                    title: "Premise Deleted",
                    description: "The premise has been successfully removed.",
                })
                queryClient.invalidateQueries({ queryKey: ['premises', searchId] })
            } else {
                toast({
                    title: "Error",
                    description: (result as any).error || "Failed to delete premise",
                    variant: "destructive"
                })
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "An error occurred while deleting premise",
                variant: "destructive"
            })
        } finally {
            setIsDeleting(false)
            setDeleteId(null)
        }
    }

    const updateStatus = useMutation({
        mutationFn: async ({ id, type, status }: { id: string, type: 'recce' | 'decision', status: string }) => {
            return updatePremiseStatus(id, type, status as any)
        },
        onSuccess: (data) => {
            if (data.success) {
                toast({
                    title: "Status Updated",
                    description: `Premise status updated successfully.`,
                })
                queryClient.invalidateQueries({ queryKey: ['premises', searchId] })
            } else {
                toast({
                    title: "Error",
                    description: (data as any).error || "Failed to update status",
                    variant: "destructive"
                })
            }
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "An error occurred while updating status",
                variant: "destructive"
            })
        }
    })

    const deallocate = useMutation({
        mutationFn: async ({ allocationId, resourceId }: { allocationId: string, resourceId: string }) => {
            return deallocateResource(allocationId, resourceId, searchId)
        },
        onSuccess: (data) => {
            if (data.success) {
                toast({
                    title: "Resource Deallocated",
                    description: "The resource has been removed from this premise.",
                })
                queryClient.invalidateQueries({ queryKey: ['premises', searchId] })
                queryClient.invalidateQueries({ queryKey: ['resources', 'available'] }) // Refresh available resources list
            } else {
                toast({
                    title: "Error",
                    description: (data as any).error || "Failed to deallocate resource",
                    variant: "destructive"
                })
            }
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "An error occurred while deallocating resource",
                variant: "destructive"
            })
        }
    })

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
    }

    if (!premises || premises.length === 0) {
        return <div className="p-8 text-center text-muted-foreground border rounded-lg border-dashed">No premises added yet. Add one to start planning.</div>
    }

    return (
        <div className="space-y-6">
            <AlertModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => deleteId && onDelete(deleteId)}
                loading={isDeleting}
            />
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Premises ({premises?.length || 0})</h2>
                <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="gap-2"
                    >
                        <LayoutGrid className="h-4 w-4" />
                        List
                    </Button>
                    <Button
                        variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('map')}
                        className="gap-2"
                    >
                        <MapIcon className="h-4 w-4" />
                        Map
                    </Button>
                </div>
            </div>

            {viewMode === 'map' ? (
                <SearchMapWrapper premises={premises || []} />
            ) : (
                <div className="space-y-4">
                    {premises?.map((premise) => {
                        const Icon = natureIcons[premise.nature as PremiseNature] || HelpCircle
                        return (
                            <Card key={premise.id} className="overflow-hidden">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-muted rounded-md">
                                            <Icon className="h-5 w-5 text-foreground" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-semibold">{premise.name}</CardTitle>
                                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {premise.address}
                                            </div>
                                            {((premise as any).occupantName || (premise as any).sourceOfInfo) && (
                                                <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                                    {(premise as any).occupantName && <div>Occupant: {(premise as any).occupantName} {(premise as any).mobileNumber ? `(${(premise as any).mobileNumber})` : ''}</div>}
                                                    {(premise as any).sourceOfInfo && <div>Source: {(premise as any).sourceOfInfo}</div>}
                                                    {(premise as any).distanceFromCrpfCamp > 0 && (
                                                        <div className="flex items-center text-blue-600 font-medium">
                                                            <MapPin className="h-3 w-3 mr-1" />
                                                            {premise.distanceFromCrpfCamp} km from CRPF Camp
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={premise.decisionStatus === 'APPROVED' ? 'default' : premise.decisionStatus === 'REJECTED' ? 'destructive' : 'secondary'}>
                                            {premise.decisionStatus}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => setDeleteId(premise.id)}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {/* Recce Status Control */}
                                        <div className="space-y-2">
                                            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Recce Status</span>
                                            <div className="flex items-center gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm" className="w-full justify-between">
                                                            {premise.recceStatus}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => updateStatus.mutate({ id: premise.id, type: 'recce', status: 'PENDING' })}>
                                                            PENDING
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => updateStatus.mutate({ id: premise.id, type: 'recce', status: 'COMPLETED' })}>
                                                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> COMPLETED
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => updateStatus.mutate({ id: premise.id, type: 'recce', status: 'ISSUE' })}>
                                                            <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" /> ISSUE
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {/* Decision Status Control */}
                                        <div className="space-y-2">
                                            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Decision</span>
                                            <div className="flex items-center gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild disabled={premise.recceStatus !== 'COMPLETED'}>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full justify-between"
                                                            disabled={premise.recceStatus !== 'COMPLETED'}
                                                        >
                                                            {premise.decisionStatus}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => updateStatus.mutate({ id: premise.id, type: 'decision', status: 'PENDING' })}>
                                                            PENDING
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => updateStatus.mutate({ id: premise.id, type: 'decision', status: 'APPROVED' })}>
                                                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> GO
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => updateStatus.mutate({ id: premise.id, type: 'decision', status: 'REJECTED' })}>
                                                            <XCircle className="mr-2 h-4 w-4 text-red-500" /> NO-GO
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                {premise.recceStatus !== 'COMPLETED' && (
                                                    <span className="text-xs text-muted-foreground">Recce required</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Requisition Control */}
                                        <div className="space-y-2">
                                            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Requisition</span>
                                            <div className="flex items-center gap-2">
                                                <RequisitionDialog
                                                    premiseId={premise.id}
                                                    existingRequirements={(premise as any).requirements}
                                                    trigger={
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full justify-between"
                                                            disabled={premise.decisionStatus !== 'APPROVED'}
                                                        >
                                                            {(premise as any).requirements ? 'Edit Requirements' : 'Set Requirements'}
                                                        </Button>
                                                    }
                                                />
                                                {premise.decisionStatus !== 'APPROVED' && (
                                                    <span className="text-xs text-muted-foreground">Wait for Approval</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Resources Info */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Resources</span>
                                                <ResourceAllocationDialog
                                                    premiseId={premise.id}
                                                    searchId={searchId}
                                                />
                                            </div>

                                            {/* Validation Logic Display */}
                                            {(() => {
                                                const issues = []
                                                if (premise.nature === 'RESIDENTIAL') {
                                                    const hasFemale = premise.assignedResources.some((r: any) => r.resource.gender === 'FEMALE')
                                                    if (!hasFemale) issues.push("Missing Female Resource")
                                                }
                                                const hasOfficial = premise.assignedResources.some((r: any) => r.resource.type === 'OFFICIAL')
                                                if (!hasOfficial) issues.push("No Official Assigned")

                                                if (issues.length > 0 && premise.assignedResources.length > 0) {
                                                    return (
                                                        <div className="rounded-md bg-yellow-50 p-2 text-xs text-yellow-800 flex items-start gap-1">
                                                            <AlertTriangle className="h-3.5 w-3.5 mt-0.5" />
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold">Team Composition Issues:</span>
                                                                {issues.map((issue, idx) => (
                                                                    <span key={idx}>• {issue}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            })()}

                                            <div className="flex flex-col gap-2">
                                                {premise.assignedResources && premise.assignedResources.length > 0 ? (
                                                    premise.assignedResources.map((allocation) => (
                                                        <div key={allocation.id} className="flex items-center justify-between text-sm border rounded p-2 bg-muted/40">
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{allocation.resource.name}</span>
                                                                <span className="text-[10px] text-muted-foreground uppercase">{allocation.resource.type} {(allocation.resource as any).gender === 'FEMALE' ? '(F)' : ''} {(allocation.resource as any).rank ? `• ${(allocation.resource as any).rank}` : ''}</span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                                onClick={() => deallocate.mutate({ allocationId: allocation.id, resourceId: allocation.resourceId })}
                                                                disabled={deallocate.isPending}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic">No resources assigned</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
