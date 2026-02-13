"use client"

import * as z from "zod"
import { useForm, UseFormReturn, SubmitHandler, ControllerRenderProps } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createResource, updateResource } from "@/actions/resources"
import { ResourceType, Gender, OfficialRank, ResourceStatus, IdType } from "@/types/resource-types"



const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    type: z.nativeEnum(ResourceType),
    gender: z.nativeEnum(Gender).optional(),
    rank: z.nativeEnum(OfficialRank).optional(),
    details: z.string().optional(),
    status: z.nativeEnum(ResourceStatus).optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
    idType: z.nativeEnum(IdType).optional(),
    idNumber: z.string().optional(),
    designation: z.string().optional(),
    unit: z.string().optional(),
    remarks: z.string().optional(),
    licenseNumber: z.string().optional(),
    vehicleType: z.string().optional(),
    vehicleRegNo: z.string().optional(),
    area: z.string().optional(),
    crpfMaleCount: z.number().optional(),
    crpfFemaleCount: z.number().optional(),
    searchId: z.string().optional(),
})

type ResourceFormValues = z.infer<typeof formSchema>

interface ResourceFormProps {
    initialData?: any
    searchId?: string
}

export function ResourceForm({ initialData, searchId }: ResourceFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const form = useForm<ResourceFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            type: (initialData?.type as ResourceType) || ResourceType.OFFICIAL,
            gender: (initialData?.gender as Gender) || undefined,
            rank: (initialData?.rank as OfficialRank) || undefined,
            details: initialData?.details || "",
            status: (initialData?.status as ResourceStatus) || ResourceStatus.AVAILABLE,
            contactNumber: initialData?.contactNumber || "",
            address: initialData?.address || "",
            idType: (initialData?.idType as IdType) || undefined,
            idNumber: initialData?.idNumber || "",
            designation: initialData?.designation || "",
            unit: initialData?.unit || "",
            vehicleRegNo: initialData?.vehicleRegNo || "",
            vehicleType: initialData?.vehicleType || "",
            licenseNumber: initialData?.licenseNumber || "",
            area: initialData?.area || "",
            remarks: initialData?.remarks || "",
            crpfMaleCount: initialData?.crpfMaleCount ?? undefined,
            crpfFemaleCount: initialData?.crpfFemaleCount ?? undefined,
            searchId: initialData?.searchId || searchId || "",
        },
    })

    const resourceType = form.watch("type")

    const onSubmit = async (data: ResourceFormValues) => {
        setLoading(true)
        try {
            if (initialData?.id) {
                const result = await updateResource(initialData.id, data)
                if (result.success) {
                    toast({
                        title: "Resource updated",
                        description: "The resource has been successfully updated.",
                    })
                    router.push("/dashboard/resources")
                    router.refresh()
                } else {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: result.error || "Failed to update resource.",
                    })
                }
            } else {
                const result = await createResource(data)
                if (result.success) {
                    toast({
                        title: "Resource created",
                        description: "The resource has been successfully created.",
                    })
                    router.push("/dashboard/resources")
                    router.refresh()
                } else {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: result.error || "Failed to create resource.",
                    })
                }
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong.",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "name"> }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Officer Name / Witness Name" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "type"> }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(ResourceType).map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "gender"> }) => (
                            <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(Gender).map((gender) => (
                                            <SelectItem key={gender} value={gender}>
                                                {gender}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contactNumber"
                        render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "contactNumber"> }) => (
                            <FormItem>
                                <FormLabel>Contact Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter contact number" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Witness Specific Fields */}
                    {resourceType === ResourceType.WITNESS && (
                        <>
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "address"> }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter address" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="idType"
                                render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "idType"> }) => (
                                    <FormItem>
                                        <FormLabel>ID Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select ID type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(IdType).map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="idNumber"
                                render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "idNumber"> }) => (
                                    <FormItem>
                                        <FormLabel>ID Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter ID number" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="area"
                                render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "area"> }) => (
                                    <FormItem>
                                        <FormLabel>Area/Zone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter area or zone" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                    {/* Officer Specific Fields */}
                    {resourceType === ResourceType.OFFICIAL && (
                        <>
                            <FormField
                                control={form.control}
                                name="rank"
                                render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "rank"> }) => (
                                    <FormItem>
                                        <FormLabel>Rank</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select rank" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(OfficialRank).map((rank) => (
                                                    <SelectItem key={rank} value={rank}>
                                                        {rank}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="designation"
                                render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "designation"> }) => (
                                    <FormItem>
                                        <FormLabel>Designation</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter designation" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "unit"> }) => (
                                    <FormItem>
                                        <FormLabel>Unit</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter unit" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="remarks"
                                render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "remarks"> }) => (
                                    <FormItem>
                                        <FormLabel>Remarks</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter official remarks" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                    {/* Driver Specific Fields */}
                    {resourceType === ResourceType.DRIVER && (
                        <>
                            <FormField
                                control={form.control}
                                name="licenseNumber"
                                render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "licenseNumber"> }) => (
                                    <FormItem>
                                        <FormLabel>License Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter license number" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="vehicleRegNo"
                                render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "vehicleRegNo"> }) => (
                                    <FormItem>
                                        <FormLabel>Vehicle Reg No</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter vehicle reg no" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="vehicleType"
                                render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "vehicleType"> }) => (
                                    <FormItem>
                                        <FormLabel>Vehicle Type</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter vehicle type (Car/SUV)" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                    {/* CRPF Specific Fields */}
                    {resourceType === ResourceType.CRPF && (
                        <>
                            <FormField
                                control={form.control}
                                name="crpfMaleCount"
                                render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "crpfMaleCount"> }) => (
                                    <FormItem>
                                        <FormLabel>Male Personnel Count</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="crpfFemaleCount"
                                render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "crpfFemaleCount"> }) => (
                                    <FormItem>
                                        <FormLabel>Female Personnel Count</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}
                </div>

                <FormField
                    control={form.control}
                    name="details"
                    render={({ field }: { field: ControllerRenderProps<ResourceFormValues, "details"> }) => (
                        <FormItem>
                            <FormLabel>Additional Details</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter any other details..."
                                    className="min-h-[80px]"
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Save changes" : "Create resource"}
                </Button>
            </form>
        </Form>
    )
}
