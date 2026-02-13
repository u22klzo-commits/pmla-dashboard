'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createPremise } from '@/actions/premises'
import { LocationType, PremiseNature } from '@prisma/client'

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'Premise name must be at least 2 characters.',
    }),
    address: z.string().min(5, {
        message: 'Address is required.',
    }),
    locationType: z.enum(['CITY', 'RURAL', 'REMOTE'] as const),
    nature: z.enum(['RESIDENTIAL', 'OFFICE', 'FACTORY', 'WAREHOUSE', 'OTHER'] as const),
    // New Fields
    occupantName: z.string().optional(),
    mobileNumber: z.string().optional(),
    sourceOfInfo: z.enum(['INFORMER', 'SURVEILLANCE', 'OFFICIAL_RECORD', 'OTHER'] as const).optional(),
    gpsLat: z.string().optional(), // Input as string, convert to number
    gpsLong: z.string().optional(),
    liveLocationUrl1: z.string().url().optional().or(z.literal('')),
    liveLocationUrl2: z.string().url().optional().or(z.literal('')),
    recceNotes: z.string().optional(),
})

interface CreatePremiseDialogProps {
    searchId: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultValues?: Partial<z.infer<typeof formSchema>>
}

export function CreatePremiseDialog({ searchId, open: externalOpen, onOpenChange: externalOnOpenChange, defaultValues }: CreatePremiseDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const open = externalOpen ?? internalOpen

    const setOpen = (val: boolean) => {
        if (externalOnOpenChange) {
            externalOnOpenChange(val)
        } else {
            setInternalOpen(val)
        }
    }
    const [isSubmitting, setIsSubmitting] = useState(false)
    const queryClient = useQueryClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            address: '',
            locationType: 'CITY',
            nature: 'RESIDENTIAL',
            occupantName: '',
            mobileNumber: '',
            sourceOfInfo: 'INFORMER',
            gpsLat: '',
            gpsLong: '',
            liveLocationUrl1: '',
            liveLocationUrl2: '',
            recceNotes: '',
            ...defaultValues
        },
    })

    // Reset form when defaultValues change
    useEffect(() => {
        if (defaultValues) {
            form.reset({
                ...form.getValues(),
                ...defaultValues
            })
        }
    }, [defaultValues, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        const result = await createPremise({
            searchId,
            name: values.name,
            address: values.address,
            locationType: values.locationType as LocationType,
            nature: values.nature as PremiseNature,
            occupantName: values.occupantName,
            mobileNumber: values.mobileNumber,
            sourceOfInfo: values.sourceOfInfo,
            gpsLat: values.gpsLat ? parseFloat(values.gpsLat) : undefined,
            gpsLong: values.gpsLong ? parseFloat(values.gpsLong) : undefined,
            liveLocationUrl1: values.liveLocationUrl1,
            liveLocationUrl2: values.liveLocationUrl2,
            recceNotes: values.recceNotes,
        })
        setIsSubmitting(false)

        if (result.success) {
            setOpen(false)
            form.reset()
            queryClient.invalidateQueries({ queryKey: ['premises', searchId] })
        } else {
            console.error(result.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Premise
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Add New Premise</DialogTitle>
                    <DialogDescription>
                        Enter the details of the target premise. This information is confidential.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target Name / Identifier</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. John Doe Residence" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter complete address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="nature"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nature of Premise</FormLabel>
                                        <FormControl>
                                            <select
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                            >
                                                <option value="RESIDENTIAL">Residential</option>
                                                <option value="OFFICE">Office</option>
                                                <option value="FACTORY">Factory</option>
                                                <option value="WAREHOUSE">Warehouse</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="locationType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location Type</FormLabel>
                                        <FormControl>
                                            <select
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                            >
                                                <option value="CITY">City</option>
                                                <option value="RURAL">Rural</option>
                                                <option value="REMOTE">Remote</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sourceOfInfo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Source of Information</FormLabel>
                                        <FormControl>
                                            <select
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                            >
                                                <option value="INFORMER">Informer</option>
                                                <option value="SURVEILLANCE">Surveillance</option>
                                                <option value="OFFICIAL_RECORD">Official Record</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="col-span-2 grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="occupantName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Occupant Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Occupant Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="mobileNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mobile Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Mobile Number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="col-span-2 grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="gpsLat"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>GPS Latitude</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="any" placeholder="Latitude" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gpsLong"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>GPS Longitude</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="any" placeholder="Longitude" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="recceNotes"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Recce Notes</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Preliminary notes..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Premise
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
