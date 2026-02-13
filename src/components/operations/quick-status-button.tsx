"use client"

import { useState, useTransition } from "react"
import { Check, X, Clock, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updatePremiseStatus } from "@/actions/premises"
import { cn } from "@/lib/utils"

interface StatusButtonProps {
    premiseId: string
    stage: 'recce' | 'decision' | 'allocation'
    currentStatus: string
}

const statusConfig = {
    recce: {
        PENDING: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
        IN_PROGRESS: { icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
        COMPLETED: { icon: Check, color: "text-green-600", bg: "bg-green-50" },
        COULD_NOT_LOCATE: { icon: X, color: "text-red-600", bg: "bg-red-50" },
    },
    decision: {
        PENDING: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
        APPROVED: { icon: Check, color: "text-green-600", bg: "bg-green-50" },
        REJECTED: { icon: X, color: "text-red-600", bg: "bg-red-50" },
        ON_HOLD: { icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    },
    allocation: {
        PENDING: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
        DONE: { icon: Check, color: "text-green-600", bg: "bg-green-50" },
    },
}

export function QuickStatusButton({ premiseId, stage, currentStatus }: StatusButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [status, setStatus] = useState(currentStatus)

    const config = statusConfig[stage]
    const currentConfig = config[status as keyof typeof config] || { icon: Clock, color: "text-gray-600", bg: "bg-gray-50" }
    const Icon = currentConfig.icon

    const handleStatusChange = (newStatus: string) => {
        startTransition(async () => {
            const result = await updatePremiseStatus(premiseId, stage, newStatus)
            if (result.success) {
                setStatus(newStatus)
            }
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-7 px-2 gap-1", currentConfig.bg, currentConfig.color)}
                    disabled={isPending}
                >
                    {isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <Icon className="h-3 w-3" />
                    )}
                    <span className="text-xs font-medium">{status}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
                {Object.entries(config).map(([key, val]) => {
                    const StatusIcon = val.icon
                    return (
                        <DropdownMenuItem
                            key={key}
                            onClick={() => handleStatusChange(key)}
                            className={cn(status === key && "bg-accent")}
                        >
                            <StatusIcon className={cn("mr-2 h-4 w-4", val.color)} />
                            {key.replace(/_/g, ' ')}
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
