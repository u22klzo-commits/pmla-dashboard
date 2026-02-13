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
import { Plus, Loader2 } from "lucide-react"
import { createCase } from "@/actions/cases"
import { useQueryClient } from "@tanstack/react-query"

import { useToast } from "@/components/ui/use-toast"

interface CreateCaseDialogProps {
    trigger?: React.ReactNode
}

export function CreateCaseDialog({ trigger }: CreateCaseDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const [formData, setFormData] = useState({
        ecir: "",
        title: "",
        actType: "", // Not in schema, but present in UI. Mapping? Case schema has description.
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Mapping UI fields to Schema fields
            // ecir -> caseNumber
            // title -> title
            // actType -> description (or part of it)

            const result = await createCase({
                caseNumber: formData.ecir,
                title: formData.title,
                description: formData.actType
            })

            if (result.success) {
                setOpen(false)
                setFormData({ ecir: "", title: "", actType: "" })
                queryClient.invalidateQueries({ queryKey: ['cases'] })
                toast({
                    title: "Success",
                    description: "Case created successfully.",
                })
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to create case",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "An error occurred while creating the case.",
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
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Case
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Case</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new ECIR case.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="ecir" className="text-right">
                                ECIR Number
                            </Label>
                            <Input
                                id="ecir"
                                placeholder="ECIR/..."
                                className="col-span-3"
                                value={formData.ecir}
                                onChange={(e) => setFormData({ ...formData, ecir: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title/Subject
                            </Label>
                            <Input
                                id="title"
                                placeholder="Case Title"
                                className="col-span-3"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Act Type
                            </Label>
                            <Input
                                id="type"
                                placeholder="PMLA / FEMA"
                                className="col-span-3"
                                value={formData.actType}
                                onChange={(e) => setFormData({ ...formData, actType: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Case
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
