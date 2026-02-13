"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { createResource } from "@/actions/resources"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface CreateResourceDialogProps {
    initialType?: string
    searchId?: string
}

export function CreateResourceDialog({ initialType, searchId }: CreateResourceDialogProps = {}) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        type: initialType || "",
        gender: "MALE",
        rank: "",
        details: "",
        contactNumber: "",
        // Witness
        address: "",
        area: "",
        idType: "AADHAAR",
        idNumber: "",
        // Officer
        designation: "",
        unit: "",
        remarks: "",
        // Driver
        licenseNumber: "",
        vehicleType: "",
        vehicleRegNo: "",
        // CRPF
        crpfMaleCount: 0,
        crpfFemaleCount: 0
    })

    const { toast } = useToast()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await createResource({
                name: formData.name,
                type: formData.type as any,
                gender: formData.gender as any,
                rank: formData.type === 'OFFICIAL' ? (formData.rank as any) : null,
                details: formData.details,
                contactNumber: formData.contactNumber,
                address: formData.type === 'WITNESS' ? formData.address : undefined,
                area: formData.type === 'WITNESS' ? formData.area : undefined,
                idType: formData.type === 'WITNESS' ? formData.idType as any : undefined,
                idNumber: formData.type === 'WITNESS' ? formData.idNumber : undefined,
                designation: formData.type === 'OFFICIAL' ? formData.designation : undefined,
                unit: formData.type === 'OFFICIAL' ? formData.unit : undefined,
                remarks: formData.type === 'OFFICIAL' ? formData.remarks : undefined,
                licenseNumber: formData.type === 'DRIVER' ? formData.licenseNumber : undefined,
                vehicleType: formData.type === 'DRIVER' ? formData.vehicleType : undefined,
                vehicleRegNo: formData.type === 'DRIVER' ? formData.vehicleRegNo : undefined,
                crpfMaleCount: formData.type === 'CRPF' ? Number(formData.crpfMaleCount) : undefined,
                crpfFemaleCount: formData.type === 'CRPF' ? Number(formData.crpfFemaleCount) : undefined,
                searchId: searchId,
            })

            if (result.success) {
                setOpen(false)
                setFormData({
                    name: "", type: initialType || "", gender: "MALE", rank: "", details: "",
                    contactNumber: "",
                    address: "", area: "", idType: "AADHAAR", idNumber: "",
                    designation: "", unit: "", remarks: "",
                    licenseNumber: "", vehicleType: "", vehicleRegNo: "",
                    crpfMaleCount: 0, crpfFemaleCount: 0
                })
                toast({
                    title: "Success",
                    description: "Resource created successfully.",
                })
                router.refresh()
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to create resource",
                    variant: "destructive"
                })
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "An unexpected error occurred",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Resource
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Resource</DialogTitle>
                    <DialogDescription>
                        Create a new resource to be allocated to searches.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: string) => setFormData({ ...formData, type: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OFFICIAL">Official</SelectItem>
                                        <SelectItem value="CRPF">CRPF</SelectItem>
                                        <SelectItem value="WITNESS">Witness</SelectItem>
                                        <SelectItem value="DRIVER">Driver</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="contactNumber" className="text-right">
                                Contact
                            </Label>
                            <Input
                                id="contactNumber"
                                placeholder="Mobile Number"
                                value={formData.contactNumber}
                                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                className="col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="gender" className="text-right">
                                Gender
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value: string) => setFormData({ ...formData, gender: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {formData.type === 'OFFICIAL' && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="rank" className="text-right">Rank</Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={formData.rank}
                                            onValueChange={(value: string) => setFormData({ ...formData, rank: value })}
                                            required={formData.type === 'OFFICIAL'}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select rank" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="AEO">AEO</SelectItem>
                                                <SelectItem value="EO">EO</SelectItem>
                                                <SelectItem value="AD">AD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="designation" className="text-right">Designation</Label>
                                    <Input id="designation" placeholder="e.g. IO/Assist" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="unit" className="text-right">Unit</Label>
                                    <Input id="unit" placeholder="e.g. HQ/Zone" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="col-span-3" />
                                </div>
                            </>
                        )}

                        {formData.type === 'WITNESS' && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="address" className="text-right">Address</Label>
                                    <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="area" className="text-right">Area</Label>
                                    <Input id="area" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="idType" className="text-right">ID Type</Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={formData.idType}
                                            onValueChange={(value: string) => setFormData({ ...formData, idType: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select ID Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="AADHAAR">Aadhaar</SelectItem>
                                                <SelectItem value="VOTER_ID">Voter ID</SelectItem>
                                                <SelectItem value="PAN">PAN</SelectItem>
                                                <SelectItem value="DRIVING_LICENSE">Driving License</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="idNumber" className="text-right">ID Number</Label>
                                    <Input id="idNumber" value={formData.idNumber} onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })} className="col-span-3" />
                                </div>
                            </>
                        )}

                        {formData.type === 'DRIVER' && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="vehicleType" className="text-right">Vehicle Type</Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={formData.vehicleType}
                                            onValueChange={(value: string) => setFormData({ ...formData, vehicleType: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Vehicle Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="SUV">SUV</SelectItem>
                                                <SelectItem value="CAR">Car</SelectItem>
                                                <SelectItem value="VAN">Van</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="vehicleRegNo" className="text-right">Reg No</Label>
                                    <Input id="vehicleRegNo" placeholder="WB-XX-XXXX" value={formData.vehicleRegNo} onChange={(e) => setFormData({ ...formData, vehicleRegNo: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="licenseNumber" className="text-right">License No</Label>
                                    <Input id="licenseNumber" value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} className="col-span-3" />
                                </div>
                            </>
                        )}

                        {formData.type === 'CRPF' && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="crpfMaleCount" className="text-right">Male Count</Label>
                                    <Input type="number" id="crpfMaleCount" value={formData.crpfMaleCount} onChange={(e) => setFormData({ ...formData, crpfMaleCount: parseInt(e.target.value) || 0 })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="crpfFemaleCount" className="text-right">Female Count</Label>
                                    <Input type="number" id="crpfFemaleCount" value={formData.crpfFemaleCount} onChange={(e) => setFormData({ ...formData, crpfFemaleCount: parseInt(e.target.value) || 0 })} className="col-span-3" />
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="details" className="text-right">
                                Details
                            </Label>
                            <Input
                                id="details"
                                placeholder="e.g. Vehicle Number or Unit"
                                value={formData.details}
                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Resource
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
