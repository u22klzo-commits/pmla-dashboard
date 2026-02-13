"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RotateCcw } from "lucide-react"

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("[Dashboard Error Boundary]", error)
    }, [error])

    const isTransient =
        error.message.includes("connection pool") ||
        error.message.includes("timed out") ||
        error.message.includes("temporarily") ||
        error.message.includes("P2024") ||
        error.message.includes("P1001")

    return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
            <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>

            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                    {isTransient ? "Temporary Connection Issue" : "Something went wrong"}
                </h2>
                <p className="max-w-md text-sm text-muted-foreground">
                    {isTransient
                        ? "The database is momentarily busy. This usually resolves itself — click Retry."
                        : "An unexpected error occurred while loading this page. Please try again."}
                </p>
            </div>

            <Button onClick={reset} variant="default" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Retry
            </Button>

            {error.digest && (
                <p className="text-xs text-muted-foreground/50">
                    Error ID: {error.digest}
                </p>
            )}
        </div>
    )
}
