"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
    navbar: React.ReactNode
    children: React.ReactNode
}

export function DashboardShell({ navbar, children }: DashboardShellProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false)

    return (
        <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
            <Sidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                className="flex-shrink-0"
            />
            <div className="flex flex-col flex-1 min-w-0">
                {navbar}
                <main className={cn(
                    "flex-1 overflow-hidden pt-4 px-4 pb-0 transition-all duration-300",
                    "bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary)_/_0.05,_transparent_50%)]"
                )}>
                    <div className="mx-auto w-full max-w-[1440px] h-full animate-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
