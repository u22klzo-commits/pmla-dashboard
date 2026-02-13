"use client"

import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createCase, updateCase } from "@/actions/cases"

const formSchema = z.object({
    caseNumber: z.string().min(1, "Case Ref/ECIR is required"),
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().optional(),
})

type CaseFormValues = z.infer<typeof formSchema>

interface CaseFormProps {
    initialData?: any
}

export function CaseForm({ initialData }: CaseFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const form = useForm<CaseFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            caseNumber: initialData?.caseNumber || "",
            title: initialData?.title || "",
            description: initialData?.description || "",
        },
    })

    async function onSubmit(data: CaseFormValues) {
        setLoading(true)
        try {
            if (initialData) {
                const result = await updateCase(initialData.id, data)
                if (result.success) {
                    toast({
                        title: "Case updated",
                        description: "The case has been successfully updated.",
                    })
                    router.push("/dashboard/cases")
                    router.refresh()
                } else {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: result.error || "Failed to update case.",
                    })
                }
            } else {
                const result = await createCase(data)
                if (result.success) {
                    toast({
                        title: "Case created",
                        description: "The case has been successfully created.",
                    })
                    router.push("/dashboard/cases")
                    router.refresh()
                } else {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: result.error || "Failed to create case.",
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
                        name="caseNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Case Ref / ECIR</FormLabel>
                                <FormControl>
                                    <Input placeholder="ECIR/01/2024" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Unique reference number for the case.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Case vs. XYZ" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Descriptive title for the case.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter case details and background info..."
                                    className="min-h-[120px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Save changes" : "Create case"}
                </Button>
            </form>
        </Form>
    )
}
