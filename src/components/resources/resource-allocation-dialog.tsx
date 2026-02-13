'use client'

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getResources, allocateResource } from "@/actions/resources"
// Resource type removed to fix lint warning
import { Loader2, UserPlus, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface ResourceAllocationDialogProps {
    premiseId: string;
    searchId: string;
    trigger?: React.ReactNode;
}

export function ResourceAllocationDialog({ premiseId, searchId, trigger }: ResourceAllocationDialogProps) {
    const [open, setOpen] = useState(false)
    const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)
    const { toast } = useToast()
    const router = useRouter()
    const queryClient = useQueryClient()

    const { data: resources, isLoading } = useQuery({
        queryKey: ['resources', 'available', searchId],
        queryFn: async () => await getResources(undefined, searchId),
        enabled: open // Only fetch when dialog opens
    })

    const mutation = useMutation({
        mutationFn: async () => {
            if (!selectedResourceId) return
            const result = await allocateResource(premiseId, selectedResourceId)
            if (!result.success) throw new Error(result.error)
            return result
        },
        onSuccess: () => {
            setOpen(false)
            setSelectedResourceId(null)
            toast({
                title: "Success",
                description: "Resource allocated successfully.",
            })
            // Invalidating searches query to refresh the premise list
            queryClient.invalidateQueries({ queryKey: ['searches', searchId] })
            router.refresh()
        },
        onError: (err) => {
            toast({
                title: "Error",
                description: err.message || "Failed to allocate resource",
                variant: "destructive"
            })
        }
    })

    const handleAllocate = () => {
        if (selectedResourceId) {
            mutation.mutate()
        }
    }

    // Filter only available resources
    const availableResources = resources?.filter(r => r.status === 'AVAILABLE') || []

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline" size="sm"><UserPlus className="h-4 w-4 mr-2" /> Allocate</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Allocate Resource</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded p-2">
                            {availableResources.length === 0 ? (
                                <div className="text-center text-muted-foreground p-4">
                                    No available resources found.
                                </div>
                            ) : (
                                availableResources.map((resource: any) => ( // Using any to bypass potential missing types
                                    <div
                                        key={resource.id}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded border cursor-pointer hover:bg-accent transition-colors",
                                            selectedResourceId === resource.id ? "border-primary bg-primary/5" : "border-transparent bg-card"
                                        )}
                                        onClick={() => setSelectedResourceId(resource.id)}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{resource.name}</span>
                                            <div className="flex gap-2 text-xs text-muted-foreground">
                                                <Badge variant="outline" className="text-[10px]">{resource.type}</Badge>
                                                {resource.type === 'OFFICIAL' && <Badge variant="secondary" className="text-[10px]">{resource.rank}</Badge>}
                                                <span>{resource.gender}</span>
                                            </div>
                                        </div>
                                        {selectedResourceId === resource.id && (
                                            <div className="h-3 w-3 rounded-full bg-primary" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleAllocate}
                            disabled={!selectedResourceId || mutation.isPending}
                        >
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Assign
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
