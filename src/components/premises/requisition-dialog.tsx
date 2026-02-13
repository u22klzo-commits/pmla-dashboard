'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePremiseRequisition } from '@/actions/premises';
import { ClipboardList } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface RequisitionDialogProps {
    premiseId: string;
    existingRequirements?: any;
    trigger?: React.ReactNode;
}

export function RequisitionDialog({ premiseId, existingRequirements, trigger }: RequisitionDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const [requirements, setRequirements] = useState({
        maleWitness: existingRequirements?.maleWitness || 2,
        femaleWitness: existingRequirements?.femaleWitness || 0,
        crpfTeamSize: existingRequirements?.crpfTeamSize || 5,
        crpfMaleCount: existingRequirements?.crpfMaleCount || 0,
        crpfFemaleCount: existingRequirements?.crpfFemaleCount || 0,
        vehicles: existingRequirements?.vehicles || 2,
        distanceFromCrpfCamp: existingRequirements?.distanceFromCrpfCamp || 0,
    });

    const handleChange = (field: string, value: string) => {
        setRequirements(prev => ({ ...prev, [field]: parseInt(value) || 0 }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const result = await updatePremiseRequisition(premiseId, requirements);
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Requisition updated successfully.",
                });
                setOpen(false);
                router.refresh();
            } else {
                toast({
                    title: "Error",
                    description: (result as any).error || "Failed to update requisition",
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "An unexpected error occurred",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Requisition
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Resource Requisition</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="maleWitness" className="col-span-2">
                            Male Witnesses
                        </Label>
                        <Input
                            id="maleWitness"
                            type="number"
                            value={requirements.maleWitness}
                            onChange={(e) => handleChange('maleWitness', e.target.value)}
                            className="col-span-2"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="femaleWitness" className="col-span-2">
                            Female Witnesses
                        </Label>
                        <Input
                            id="femaleWitness"
                            type="number"
                            value={requirements.femaleWitness}
                            onChange={(e) => handleChange('femaleWitness', e.target.value)}
                            className="col-span-2"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="crpfTeamSize" className="col-span-2">
                            CRPF Team Size (Total)
                        </Label>
                        <Input
                            id="crpfTeamSize"
                            type="number"
                            value={requirements.crpfTeamSize}
                            onChange={(e) => handleChange('crpfTeamSize', e.target.value)}
                            className="col-span-2"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="crpfMaleCount" className="col-span-2">
                            CRPF Male Count
                        </Label>
                        <Input
                            id="crpfMaleCount"
                            type="number"
                            value={requirements.crpfMaleCount}
                            onChange={(e) => handleChange('crpfMaleCount', e.target.value)}
                            className="col-span-2"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="crpfFemaleCount" className="col-span-2">
                            CRPF Female Count
                        </Label>
                        <Input
                            id="crpfFemaleCount"
                            type="number"
                            value={requirements.crpfFemaleCount}
                            onChange={(e) => handleChange('crpfFemaleCount', e.target.value)}
                            className="col-span-2"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="vehicles" className="col-span-2">
                            Vehicles Required
                        </Label>
                        <Input
                            id="vehicles"
                            type="number"
                            value={requirements.vehicles}
                            onChange={(e) => handleChange('vehicles', e.target.value)}
                            className="col-span-2"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="distanceFromCrpfCamp" className="col-span-2">
                            Dist. from CRPF (km)
                        </Label>
                        <Input
                            id="distanceFromCrpfCamp"
                            type="number"
                            step="0.1"
                            value={(requirements as any).distanceFromCrpfCamp}
                            onChange={(e) => setRequirements(prev => ({ ...prev, distanceFromCrpfCamp: parseFloat(e.target.value) || 0 }))}
                            className="col-span-2"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Requirements'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
