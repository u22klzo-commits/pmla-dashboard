"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Eye,
    LayoutDashboard,
    Briefcase,
    Map,
    Users,
    FileText,
    Settings,
    ChevronLeft,
    Menu,
    Search,
    Shield,
    Gavel,
    Truck,
    UserCircle,
    Copy,
    LogOut,
    Car,
    ClipboardList,
    ShieldAlert
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    isCollapsed: boolean
    setIsCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ className, isCollapsed, setIsCollapsed }: SidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()

    const navItems = [
        {
            group: "Operations",
            items: [
                { href: "/dashboard", label: "Operations Hub", icon: LayoutDashboard },
                { href: "/dashboard/cases", label: "Master Cases", icon: Briefcase },
            ]
        },
        {
            group: "Intelligence",
            items: [
                { href: "/dashboard/operations/premises", label: "Target Directory", icon: Map },
                { href: "/dashboard/operations/recce", label: "Tactical Recon", icon: Eye },
                { href: "/dashboard/operations/decision", label: "Action Planning", icon: Gavel },
                { href: "/dashboard/operations/deployment", label: "Field Deployment", icon: Truck },
                { href: "/dashboard/operations/requisition", label: "Requisitions", icon: ClipboardList },
            ]
        },
        {
            group: "Infrastructure",
            items: [
                { href: "/dashboard/resources/officers", label: "Personnel", icon: Shield },
                { href: "/dashboard/resources/witnesses", label: "Public Support", icon: Users },
                { href: "/dashboard/resources/drivers", label: "Logistics", icon: Car },
                { href: "/dashboard/resources/crpf", label: "Security Units", icon: ShieldAlert },
            ]
        },
    ]

    return (
        <TooltipProvider delayDuration={0}>
            <motion.div
                initial={false}
                animate={{
                    width: isCollapsed ? 80 : 280,
                    transition: { duration: 0.3, ease: "easeInOut" }
                }}
                className={cn(
                    "relative flex flex-col border-r bg-card/50 backdrop-blur-xl h-screen z-40 sidebar-gradient",
                    className
                )}
            >
                {/* Header / Logo */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
                    <AnimatePresence mode="wait">
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-center gap-2 font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent whitespace-nowrap overflow-hidden"
                            >
                                <Shield className="h-6 w-6 text-primary" />
                                Unit 2-2
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </Button>
                </div>

                {/* Nav Items */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-hide">
                    {navItems.map((group, groupIdx) => (
                        <div key={groupIdx} className="space-y-2">
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.h3
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2"
                                    >
                                        {group.group}
                                    </motion.h3>
                                )}
                            </AnimatePresence>

                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

                                    return (
                                        <Tooltip key={item.href}>
                                            <TooltipTrigger asChild>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                                        isActive
                                                            ? "bg-primary/10 text-primary"
                                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                    )}
                                                >
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="sidebar-active-indicator"
                                                            className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                                                        />
                                                    )}
                                                    <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />

                                                    <AnimatePresence mode="wait">
                                                        {!isCollapsed && (
                                                            <motion.span
                                                                initial={{ opacity: 0, width: 0 }}
                                                                animate={{ opacity: 1, width: "auto" }}
                                                                exit={{ opacity: 0, width: 0 }}
                                                                className="overflow-hidden whitespace-nowrap"
                                                            >
                                                                {item.label}
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                </Link>
                                            </TooltipTrigger>
                                            {isCollapsed && (
                                                <TooltipContent side="right" className="font-medium bg-card border-border/50 text-foreground">
                                                    {item.label}
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer / User Profile - Removed as requested */}
            </motion.div>
        </TooltipProvider>
    )
}
