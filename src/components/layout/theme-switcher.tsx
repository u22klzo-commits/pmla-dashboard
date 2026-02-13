
'use client'

import * as React from "react"
import { Sun, Moon, Zap } from "lucide-react"
import { useTacticalTheme, Theme } from "@/components/providers/theme-provider"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function ThemeSwitcher() {
    const { theme, setTheme } = useTacticalTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Sun className={cn("h-5 w-5 rotate-0 scale-100 transition-all", theme === 'day' ? "block" : "hidden")} />
                    <Moon className={cn("h-5 w-5 transition-all text-blue-400", theme === 'night' ? "block" : "hidden")} />
                    <Zap className={cn("h-5 w-5 transition-all text-green-500", theme === 'mfd' ? "block" : "hidden")} />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-panel border-white/10">
                <DropdownMenuItem
                    onClick={() => setTheme("day")}
                    className={cn("flex items-center gap-2 cursor-pointer hover:bg-white/5", theme === 'day' && "bg-primary/20")}
                >
                    <Sun className="h-4 w-4" />
                    <span>Day Mode</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("night")}
                    className={cn("flex items-center gap-2 cursor-pointer hover:bg-white/5", theme === 'night' && "bg-primary/20")}
                >
                    <Moon className="h-4 w-4 text-blue-400" />
                    <span>Night Ops</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("mfd")}
                    className={cn("flex items-center gap-2 cursor-pointer hover:bg-white/5", theme === 'mfd' && "bg-primary/20")}
                >
                    <Zap className="h-4 w-4 text-green-500" />
                    <span>MFD (Avionic)</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
