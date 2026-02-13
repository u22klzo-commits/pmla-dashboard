"use client"

import { useState, useEffect } from "react"
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
import { Plus, Loader2, Search } from "lucide-react"
import { createSearch } from "@/actions/searches"
import { getCases } from "@/actions/cases"
import { useQueryClient } from "@tanstack/react-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

import { useToast } from "@/components/ui/use-toast"

interface RegisterSearchDialogProps {
    trigger?: React.ReactNode
    defaultCaseId?: string
}

export function RegisterSearchDialog({ trigger, defaultCaseId }: RegisterSearchDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [cases, setCases] = useState<any[]>([])
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const [formData, setFormData] = useState({
        caseId: defaultCaseId || "",
        searchName: "",
        date: format(new Date(), 'yyyy-MM-dd')
    })

    useEffect(() => {
        if (open) {
            // Load cases when dialog opens
            getCases().then(data => {
                setCases(data)
            })
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.caseId) {
            toast({
                title: "Error",
                description: "Please select a case",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            const result = await createSearch({
                caseId: formData.caseId,
                name: formData.searchName || `Search on ${formData.date}`,
                date: new Date(formData.date)
            })

            if (result.success) {
                setOpen(false)
                setFormData({
                    caseId: defaultCaseId || "",
                    searchName: "",
                    date: format(new Date(), 'yyyy-MM-dd')
                })
                queryClient.invalidateQueries({ queryKey: ['searches'] })
                toast({
                    title: "Success",
                    description: "Search operation registered successfully.",
                })
            } else {
                toast({
                    title: "Error",
                    description: "Failed to register search",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "An error occurred",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button variant="outline">
                        <Search className="mr-2 h-4 w-4" /> Register Search
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Register New Search</DialogTitle>
                    <DialogDescription>
                        Plan a new search operation under an existing case.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="case" className="text-right">
                                Select Case
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    value={formData.caseId}
                                    onValueChange={(val: string) => setFormData({ ...formData, caseId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a case..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cases.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.caseNumber} - {c.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Search Name
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g. Operation X (Optional)"
                                className="col-span-3"
                                value={formData.searchName}
                                onChange={(e) => setFormData({ ...formData, searchName: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">
                                Date
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                className="col-span-3"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Register Search
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
