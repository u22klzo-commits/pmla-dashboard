'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wand2, Loader2 } from "lucide-react"
import { autoAssignAllPremises } from "@/actions/resources"
import { useToast } from "@/components/ui/use-toast"

export function AutoAssignButton() {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleAutoAssign = async () => {
        setLoading(true)
        try {
            const result = await autoAssignAllPremises()
            if (result.success && result.data) {
                toast({
                    title: "Success",
                    description: `Successfully assigned ${result.data.count} resources across all units.`,
                })
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to auto-assign resources.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Auto-assign error:", error)
            toast({
                title: "Error",
                description: "An error occurred during auto-assignment.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleAutoAssign}
            disabled={loading}
            variant="outline"
            className="gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Auto Assign All
        </Button>
    )
}
