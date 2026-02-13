'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { LocationType, PremiseNature } from '@prisma/client'
import { createPremise, updatePremise } from '@/actions/premises'
import { useState } from 'react'

// Enum values from Prisma schema
const LOCATION_TYPE_OPTIONS = [
    { value: 'KOLKATA', label: 'Kolkata' },
    { value: 'OUTSIDE', label: 'Outside Kolkata' },
] as const

const PREMISE_NATURE_OPTIONS = [
    { value: 'RESIDENTIAL', label: 'Residential' },
    { value: 'COMMERCIAL', label: 'Commercial' },
    { value: 'OFFICE', label: 'Office' },
    { value: 'INDUSTRIAL', label: 'Industrial' },
    { value: 'OTHERS', label: 'Others' },
] as const

const SOURCE_OF_INFO_OPTIONS = [
    { value: 'INFORMER', label: 'Informer' },
    { value: 'COMPLAINT', label: 'Complaint' },
    { value: 'INTELLIGENCE', label: 'Intelligence' },
    { value: 'OTHER', label: 'Other' },
] as const

// Schema for premise form - matching Prisma enums exactly
const premiseFormSchema = z.object({
    name: z.string().min(2, {
        message: 'Premise name must be at least 2 characters.',
    }),
    address: z.string().min(5, {
        message: 'Address is required.',
    }),
    locationType: z.enum(['KOLKATA', 'OUTSIDE']),
    nature: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'OFFICE', 'INDUSTRIAL', 'OTHERS']),
    occupantName: z.string().optional(),
    mobileNumber: z.string().optional(),
    sourceOfInfo: z.enum(['INFORMER', 'COMPLAINT', 'INTELLIGENCE', 'OTHER']).optional(),
    gpsLat: z.number().optional(),
    gpsLong: z.number().optional(),
    distanceFromCrpfCamp: z.number().optional(),
    liveLocationUrl1: z.string().url().optional().or(z.literal('')),
    liveLocationUrl2: z.string().url().optional().or(z.literal('')),
    photoUrl: z.string().url().optional().or(z.literal('')),
    recceNotes: z.string().optional(),
})

export type PremiseFormValues = z.infer<typeof premiseFormSchema>

// Type for existing premise data (for editing)
export interface ExistingPremise {
    id: string
    searchId: string
    name: string
    address: string
    locationType: LocationType
    nature: PremiseNature
    occupantName?: string | null
    mobileNumber?: string | null
    sourceOfInfo?: string | null
    gpsLat?: number | null
    gpsLong?: number | null
    distanceFromCrpfCamp?: number | null
    liveLocationUrl1?: string | null
    liveLocationUrl2?: string | null
    photoUrl?: string | null
    recceNotes?: string | null
}

interface PremiseFormProps {
    searchId: string
    premise?: ExistingPremise
    onSuccess?: () => void
}

export function PremiseForm({ searchId, premise, onSuccess }: PremiseFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const isEditing = !!premise

    const form = useForm<PremiseFormValues>({
        resolver: zodResolver(premiseFormSchema),
        defaultValues: {
            name: premise?.name || '',
            address: premise?.address || '',
            locationType: premise?.locationType || 'KOLKATA',
            nature: premise?.nature || 'RESIDENTIAL',
            occupantName: premise?.occupantName || '',
            mobileNumber: premise?.mobileNumber || '',
            sourceOfInfo: (premise?.sourceOfInfo as PremiseFormValues['sourceOfInfo']) || undefined,
            gpsLat: premise?.gpsLat ?? undefined,
            gpsLong: premise?.gpsLong ?? undefined,
            distanceFromCrpfCamp: premise?.distanceFromCrpfCamp ?? undefined,
            liveLocationUrl1: premise?.liveLocationUrl1 || '',
            liveLocationUrl2: premise?.liveLocationUrl2 || '',
            photoUrl: premise?.photoUrl || '',
            recceNotes: premise?.recceNotes || '',
        },
    })

    async function onSubmit(values: PremiseFormValues) {
        setIsSubmitting(true)
        setError(null)

        try {
            if (isEditing && premise) {
                // Update existing premise
                const result = await updatePremise(premise.id, {
                    name: values.name,
                    address: values.address,
                    locationType: values.locationType as LocationType,
                    nature: values.nature as PremiseNature,
                    occupantName: values.occupantName,
                    mobileNumber: values.mobileNumber,
                    sourceOfInfo: values.sourceOfInfo,
                    gpsLat: values.gpsLat,
                    gpsLong: values.gpsLong,
                    distanceFromCrpfCamp: values.distanceFromCrpfCamp,
                    liveLocationUrl1: values.liveLocationUrl1,
                    liveLocationUrl2: values.liveLocationUrl2,
                    photoUrl: values.photoUrl,
                    recceNotes: values.recceNotes,
                })

                if (result.success) {
                    onSuccess?.()
                    router.push(`/dashboard/operations/premises`)
                    router.refresh()
                } else {
                    setError(result.error || 'Failed to update premise')
                }
            } else {
                // Create new premise
                const result = await createPremise({
                    searchId,
                    name: values.name,
                    address: values.address,
                    locationType: values.locationType as LocationType,
                    nature: values.nature as PremiseNature,
                    occupantName: values.occupantName,
                    mobileNumber: values.mobileNumber,
                    sourceOfInfo: values.sourceOfInfo,
                    gpsLat: values.gpsLat,
                    gpsLong: values.gpsLong,
                    distanceFromCrpfCamp: values.distanceFromCrpfCamp,
                    liveLocationUrl1: values.liveLocationUrl1,
                    liveLocationUrl2: values.liveLocationUrl2,
                    photoUrl: values.photoUrl,
                    recceNotes: values.recceNotes,
                })

                if (result.success) {
                    onSuccess?.()
                    form.reset()
                } else {
                    setError(result.error || 'Failed to create premise')
                }
            }
        } catch (err) {
            console.error('Form submission error:', err)
            setError('An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {/* Basic Information Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Target Name / Identifier *</FormLabel>
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
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Full Address *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter complete address with landmarks"
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nature"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nature of Premise *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select nature" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {PREMISE_NATURE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
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
                            name="locationType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select location" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {LOCATION_TYPE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Occupant Information Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Occupant Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="occupantName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Occupant Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Name of known occupant" {...field} />
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
                                        <Input placeholder="Contact number" {...field} />
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
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select source" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {SOURCE_OF_INFO_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Location & GPS Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Location & GPS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="gpsLat"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>GPS Latitude</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="any"
                                            placeholder="e.g. 22.5726"
                                            value={field.value ?? ''}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                field.onChange(val === '' ? undefined : parseFloat(val))
                                            }}
                                        />
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
                                        <Input
                                            type="number"
                                            step="any"
                                            placeholder="e.g. 88.3639"
                                            value={field.value ?? ''}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                field.onChange(val === '' ? undefined : parseFloat(val))
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="distanceFromCrpfCamp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Distance from CRPF Camp (km)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="e.g. 5.5"
                                            value={field.value ?? ''}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                field.onChange(val === '' ? undefined : parseFloat(val))
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="liveLocationUrl1"
                            render={({ field }) => (
                                <FormItem className="md:col-span-3">
                                    <FormLabel>Live Location URL 1</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="url"
                                            placeholder="https://maps.google.com/..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Google Maps or similar location link
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="liveLocationUrl2"
                            render={({ field }) => (
                                <FormItem className="md:col-span-3">
                                    <FormLabel>Live Location URL 2 (Backup)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="url"
                                            placeholder="https://maps.google.com/..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="photoUrl"
                            render={({ field }) => (
                                <FormItem className="md:col-span-3">
                                    <FormLabel>Photo Link</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="url"
                                            placeholder="https://drive.google.com/..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Link to premise photo (Google Drive, etc.)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Recce Notes Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recce Notes</h3>
                    <FormField
                        control={form.control}
                        name="recceNotes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preliminary Notes</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Entry/exit points, security measures, observation times, etc."
                                        className="min-h-[100px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Any observations from initial reconnaissance
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Update Premise' : 'Create Premise'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
