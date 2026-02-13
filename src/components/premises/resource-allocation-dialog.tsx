'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, User, Shield, Car, Plus, X, AlertCircle, Save, Ban, Wand2 } from 'lucide-react';
import { getPremiseById } from '@/actions/premises';
import { getResources, syncResourceAllocations, suggestResourceAllocation } from '@/actions/resources';
import { Resource, ResourceType } from '@prisma/client';

interface ResourceAllocationDialogProps {
    premiseId: string;
    searchId: string;
    premiseName: string;
    trigger?: React.ReactNode;
}

type AssignedResource = {
    allocationId: string;
    resource: Resource;
}

export function ResourceAllocationDialog({ premiseId, searchId, premiseName, trigger }: ResourceAllocationDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isAutoAssigning, setIsAutoAssigning] = useState(false);

    // Initial Data State
    const [initialAssigned, setInitialAssigned] = useState<AssignedResource[]>([]);
    const [initialAvailable, setInitialAvailable] = useState<Resource[]>([]);

    // Pending Changes State
    const [pendingAdds, setPendingAdds] = useState<Set<string>>(new Set());
    const [pendingRemoves, setPendingRemoves] = useState<Set<string>>(new Set());

    const [resourceType, setResourceType] = useState<ResourceType>('WITNESS');

    // Fetch data when dialog opens or tab changes
    useEffect(() => {
        if (open) {
            fetchData();
            // Reset pending state on open
            setPendingAdds(new Set());
            setPendingRemoves(new Set());
        }
    }, [open, resourceType]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch current assignments
            const premise = await getPremiseById(premiseId);
            if (premise && premise.assignedResources) {
                const formatted = premise.assignedResources.map(ar => ({
                    allocationId: ar.id,
                    resource: ar.resource
                }));
                setInitialAssigned(formatted);
            }

            // 2. Fetch available resources of current type and search context
            const resources = await getResources(resourceType, searchId);
            // Only keep resources that are TRULY available in DB
            const availableFiltered = resources.filter(r => r.status === 'AVAILABLE');
            setInitialAvailable(availableFiltered);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAllocate = (resourceId: string) => {
        const newPendingAdds = new Set(pendingAdds);
        const newPendingRemoves = new Set(pendingRemoves);

        if (newPendingRemoves.has(resourceId)) {
            // Re-adding something we intended to remove
            newPendingRemoves.delete(resourceId);
        } else {
            // Adding something new
            newPendingAdds.add(resourceId);
        }

        setPendingAdds(newPendingAdds);
        setPendingRemoves(newPendingRemoves);
    };

    const handleDeallocate = (resourceId: string) => {
        const newPendingAdds = new Set(pendingAdds);
        const newPendingRemoves = new Set(pendingRemoves);

        if (newPendingAdds.has(resourceId)) {
            // Removing something we just added
            newPendingAdds.delete(resourceId);
        } else {
            // Removing something originally assigned
            newPendingRemoves.add(resourceId);
        }

        setPendingAdds(newPendingAdds);
        setPendingRemoves(newPendingRemoves);
    };


    const handleSave = async () => {
        if (pendingAdds.size === 0 && pendingRemoves.size === 0) {
            setOpen(false);
            return;
        }

        setSaving(true);
        try {
            const addedIds = Array.from(pendingAdds);
            const removedIds = Array.from(pendingRemoves);

            const result = await syncResourceAllocations(premiseId, searchId, addedIds, removedIds);

            if (result.success) {
                // Do NOT close the dialog, just refresh state
                // setOpen(false); 
                setPendingAdds(new Set());
                setPendingRemoves(new Set());
                await fetchData(); // Refresh data to show confirmed assignments
            } else {
                alert(result.error);
                // Refresh data to show current state if failure
                fetchData();
            }
        } catch (error) {
            console.error("Save failed", error);
        } finally {
            setSaving(false);
        }
    };

    const handleAutoAssign = async () => {
        setIsAutoAssigning(true);
        try {
            const result = await suggestResourceAllocation(premiseId);
            if (result.success && result.data?.suggestedIds) {
                const newPendingAdds = new Set(pendingAdds);
                let addedCount = 0;

                // 1. Get all currently known resource IDs (initially assigned) to check against
                const currentlyAssignedIds = new Set(initialAssigned.map(a => a.resource.id));

                result.data.suggestedIds.forEach(id => {
                    // Only add if NOT already assigned AND NOT already in pendingAdds
                    if (!currentlyAssignedIds.has(id)) {
                        newPendingAdds.add(id);
                        addedCount++;
                    }
                });

                setPendingAdds(newPendingAdds);

                let message = `Auto-assigned ${addedCount} resources. Review tabs to see changes.`;
                if ((result as any).warnings && (result as any).warnings.length > 0) {
                    message += `\n\nWARNINGS:\n- ${(result as any).warnings.join('\n- ')}`;
                }

                if (addedCount > 0) {

                    // Ideally we should fetch ALL available resources? Or just rely on tab switching to load valid data?
                    // If we add an ID that isn't in 'initialAvailable', 'renderResourceCard' won't work for it in the current view.
                    // But 'effectiveAssigned' logic is: initialAvailable.filter(r => pendingAdds.has(r.id)).

                    // So, strictly speaking, if we add ID 'A' (Driver) while on 'WITNESS' tab, 
                    // 'A' is in pendingAdds. 
                    // But when we switch to Driver tab, 'initialAvailable' updates, and then 'addedResources' will find 'A'.
                    // So visually it works fine as the user navigates.

                    alert(`Auto-assigned ${addedCount} resources. Review tabs to see changes.`);
                } else {
                    alert("No new resources to assign based on requirements.");
                }

            } else {
                alert(result.error || "Failed to auto-assign.");
            }
        } catch (error) {
            console.error("Auto assign failed", error);
            alert("An error occurred during auto-assignment.");
        } finally {
            setIsAutoAssigning(false);
        }
    };

    // --- DERIVED STATE CALCULATIONS ---

    // 1. Calculate Effective Available
    // Start with initial available
    // REMOVE items in pendingAdds
    // ADD items in pendingRemoves (that belong to this resourceType)
    const effectiveAvailable = [
        ...initialAvailable.filter(r => !pendingAdds.has(r.id)),
        ...initialAssigned
            .filter(a => pendingRemoves.has(a.resource.id) && a.resource.type === resourceType)
            .map(a => a.resource)
    ].sort((a, b) => a.name.localeCompare(b.name));

    // 2. Calculate Effective Assigned (for current Type)
    // Start with initial assigned of current type
    // ADD items in pendingAdds (that match current type - need to find them in initialAvailable)
    // REMOVE items in pendingRemoves
    const addedResources = initialAvailable.filter(r => pendingAdds.has(r.id));

    // Check if we need to include resources that were originally removed but added back? 
    // No, handleAllocate handles the set logic.

    const effectiveAssigned = [
        ...initialAssigned.filter(a => a.resource.type === resourceType && !pendingRemoves.has(a.resource.id)).map(a => a.resource),
        ...addedResources
    ].sort((a, b) => a.name.localeCompare(b.name));

    const hasChanges = pendingAdds.size > 0 || pendingRemoves.size > 0;

    const renderResourceCard = (resource: Resource, isAssignedView: boolean) => (
        <div key={resource.id} className="flex items-center justify-between p-2 border rounded-md text-sm mb-2">
            <div className="flex flex-col">
                <span className="font-semibold flex items-center gap-2">
                    {resource.name}
                    {/* Indicate new/removed status */}
                    {isAssignedView && pendingAdds.has(resource.id) && <Badge variant="outline" className="text-[10px] h-4 px-1 text-green-600 border-green-200 bg-green-50">New</Badge>}
                    {!isAssignedView && pendingRemoves.has(resource.id) && <Badge variant="outline" className="text-[10px] h-4 px-1 text-amber-600 border-amber-200 bg-amber-50">Removed</Badge>}
                </span>
                <span className="text-xs text-muted-foreground">
                    {(resource as any).rank || (resource as any).vehicleType || (resource as any).area || (resource as any).designation || 'Resource'}
                </span>
                {resource.type === 'CRPF' && (
                    <span className="text-[10px] text-muted-foreground">
                        Strength: {((resource as any).crpfMaleCount || 0) + ((resource as any).crpfFemaleCount || 0)}
                    </span>
                )}
            </div>
            {isAssignedView ? (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeallocate(resource.id)}>
                    <X className="h-4 w-4" />
                </Button>
            ) : (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleAllocate(resource.id)}>
                    <Plus className="h-4 w-4" />
                </Button>
            )}
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={(v) => {
            if (!v && hasChanges) {
                if (confirm("You have unsaved changes. Are you sure you want to close?")) {
                    setOpen(false);
                }
            } else {
                setOpen(v);
            }
        }}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Manage Resources</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Mange Resources: {premiseName}</DialogTitle>
                    <DialogDescription>Assign Witnesses, Officers, Drivers and CRPF to this premise.</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="WITNESS" value={resourceType} onValueChange={(v) => setResourceType(v as ResourceType)} className="flex-1 flex flex-col min-h-0">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="WITNESS">Witnesses</TabsTrigger>
                        <TabsTrigger value="OFFICIAL">Officers</TabsTrigger>
                        <TabsTrigger value="DRIVER">Drivers</TabsTrigger>
                        <TabsTrigger value="CRPF">CRPF</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 grid grid-cols-2 gap-4 min-h-0 py-4">
                        {/* LEFT: Available */}
                        <Card className="flex flex-col min-h-0 border-dashed">
                            <CardContent className="p-3 flex flex-col h-full">
                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-green-700">
                                    Available {resourceType}s
                                    <Badge variant="outline" className="ml-auto">{effectiveAvailable.length}</Badge>
                                </h3>
                                <div className="flex-1 overflow-y-auto pr-2">
                                    {loading && initialAvailable.length === 0 ? (
                                        <div className="flex justify-center p-4"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>
                                    ) : effectiveAvailable.length === 0 ? (
                                        <div className="text-center text-xs text-muted-foreground py-8">No available resources found.</div>
                                    ) : (
                                        effectiveAvailable.map(r => renderResourceCard(r, false))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* RIGHT: Assigned */}
                        <Card className="flex flex-col min-h-0 border-blue-200 bg-blue-50/30">
                            <CardContent className="p-3 flex flex-col h-full">
                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-blue-700">
                                    Assigned to Premise
                                    <Badge variant="secondary" className="ml-auto">{effectiveAssigned.length}</Badge>
                                </h3>
                                <div className="flex-1 overflow-y-auto pr-2">
                                    {loading && initialAssigned.length === 0 ? (
                                        <div className="flex justify-center p-4"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>
                                    ) : effectiveAssigned.length === 0 ? (
                                        <div className="text-center text-xs text-muted-foreground py-8">No assigned resources.</div>
                                    ) : (
                                        effectiveAssigned.map(r => renderResourceCard(r, true))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </Tabs>

                <DialogFooter className="gap-2 sm:gap-0 flex sm:justify-between w-full">
                    <div className="flex-1 flex justify-start">
                        <Button
                            variant="secondary"
                            className="gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
                            onClick={handleAutoAssign}
                            disabled={loading || saving || isAutoAssigning}
                        >
                            {isAutoAssigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            Auto Assign
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving || !hasChanges} className="gap-2">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {saving ? "Saving..." : "Confirm Assignments"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
