"use client"

import * as z from "zod"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { createSearch, updateSearch } from "@/actions/searches"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    caseId: z.string().min(1, "Case is required"),
    date: z.date({
        message: "Date is required",
    }),
})

type SearchFormValues = z.infer<typeof formSchema>

interface SearchFormProps {
    initialData?: any
    cases: { id: string; caseNumber: string; title: string }[]
}

export function SearchForm({ initialData, cases }: SearchFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const title = initialData ? "Edit Search Operation" : "Create Search Operation"
    const description = initialData ? "Edit details of the search operation." : "Add a new search operation to a case."
    const action = initialData ? "Save changes" : "Create"

    const form = useForm<SearchFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
            ? {
                name: initialData.name,
                caseId: initialData.caseId,
                date: new Date(initialData.date),
            }
            : {
                name: "",
                caseId: "",
                date: undefined as any,
            },
    })

    const onSubmit = async (data: SearchFormValues) => {
        try {
            setLoading(true)
            if (initialData) {
                const res = await updateSearch(initialData.id, data)
                if (res.success) {
                    toast({
                        title: "Success",
                        description: "Search operation updated successfully.",
                    })
                    router.push("/dashboard/searches")
                    router.refresh()
                } else {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: res.error,
                    })
                }
            } else {
                const res = await createSearch(data)
                if (res.success) {
                    toast({
                        title: "Success",
                        description: "Search operation created successfully.",
                    })
                    router.push("/dashboard/searches")
                    router.refresh()
                } else {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: res.error,
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
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid gap-8 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Operation Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Operation Alpha..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="caseId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Case</FormLabel>
                                    <Select
                                        disabled={loading || !!initialData}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a case" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {cases.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.caseNumber} - {c.title}
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
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date of Search</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date: Date) =>
                                                    date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button disabled={loading} type="submit">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {action}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
