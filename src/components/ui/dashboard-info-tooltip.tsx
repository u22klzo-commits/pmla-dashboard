'use client'

import { Info } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface DashboardInfoTooltipProps {
    content: string | string[]
    className?: string
}

export function DashboardInfoTooltip({ content, className }: DashboardInfoTooltipProps) {
    const lines = Array.isArray(content) ? content : [content]

    return (
        <TooltipProvider>
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        className={`inline-flex items-center justify-center p-1 rounded-full hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground ${className || ''}`}
                    >
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Dashboard usage instructions</span>
                    </button>
                </TooltipTrigger>
                <TooltipContent
                    side="bottom"
                    align="start"
                    className="max-w-[350px] p-3 space-y-1.5"
                >
                    {lines.map((line, i) => (
                        <p key={i} className="text-xs leading-relaxed">{line}</p>
                    ))}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
