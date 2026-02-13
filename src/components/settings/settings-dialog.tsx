'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Settings, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { getFieldConfigs, updateFieldConfig } from "@/actions/settings"

const CONFIGURABLE_FIELDS = [
    { view: 'premise', field: 'recceNotes', label: 'Recce Notes' },
    { view: 'premise', field: 'photos', label: 'Premise Photos' },
    { view: 'premise', field: 'address', label: 'Full Address' },
]

export function SettingsDialog() {
    const [open, setOpen] = useState(false)
    const [configs, setConfigs] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            setLoading(true)
            getFieldConfigs().then(data => {
                setConfigs(data)
                setLoading(false)
            })
        }
    }, [open])

    const handleToggle = async (view: string, field: string, type: 'isRequired' | 'isVisible', currentValue: boolean) => {
        // Optimistic update
        const newConfigs = [...configs]
        const existingIndex = newConfigs.findIndex(c => c.viewName === view && c.fieldName === field)

        if (existingIndex >= 0) {
            newConfigs[existingIndex] = { ...newConfigs[existingIndex], [type]: !currentValue }
        } else {
            newConfigs.push({ viewName: view, fieldName: field, isRequired: false, isVisible: true, [type]: !currentValue })
        }
        setConfigs(newConfigs)

        await updateFieldConfig(view, field, { [type]: !currentValue })
    }

    const getConfig = (view: string, field: string) => {
        return configs.find(c => c.viewName === view && c.fieldName === field) || { isRequired: false, isVisible: true }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Settings">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>System Configuration</DialogTitle>
                    <DialogDescription>
                        Manage field requirements and visibility across the dashboard.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : (
                    <div className="grid gap-6 py-4">
                        <div className="space-y-4">
                            <h4 className="font-medium leading-none text-muted-foreground text-sm uppercase tracking-wider">Premise Management</h4>
                            {CONFIGURABLE_FIELDS.filter(f => f.view === 'premise').map((field) => {
                                const config = getConfig(field.view, field.field)
                                return (
                                    <div key={field.field} className="flex items-center justify-between space-x-4 border p-3 rounded-md">
                                        <Label htmlFor={field.field} className="flex flex-col space-y-1">
                                            <span>{field.label}</span>
                                            <span className="font-normal text-xs text-muted-foreground">Adjust validation rules</span>
                                        </Label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`${field.field}-req`}
                                                    checked={config.isRequired}
                                                    onCheckedChange={() => handleToggle(field.view, field.field, 'isRequired', config.isRequired)}
                                                />
                                                <label
                                                    htmlFor={`${field.field}-req`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Required
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
