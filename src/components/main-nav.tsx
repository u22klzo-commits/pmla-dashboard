"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname()

    const groups = [
        {
            title: "Overview",
            isDropdown: false,
            routes: [
                {
                    href: "/dashboard",
                    label: "Dashboard",
                    active: pathname === "/dashboard",
                },
                {
                    href: "/dashboard/cases",
                    label: "Cases",
                    active: pathname?.startsWith("/dashboard/cases"),
                }
            ]
        },
        {
            title: "Operations",
            isDropdown: true,
            routes: [
                {
                    href: "/dashboard/operations/premises",
                    label: "Premise Master",
                    active: pathname?.startsWith("/dashboard/operations/premises"),
                },
                {
                    href: "/dashboard/operations/recce",
                    label: "Recce Stage",
                    active: pathname?.startsWith("/dashboard/operations/recce"),
                },
                {
                    href: "/dashboard/operations/decision",
                    label: "Decision",
                    active: pathname?.startsWith("/dashboard/operations/decision"),
                },
                {
                    href: "/dashboard/operations/deployment",
                    label: "Deployment",
                    active: pathname?.startsWith("/dashboard/operations/deployment"),
                },
                {
                    href: "/dashboard/operations/requisition",
                    label: "Requisition",
                    active: pathname?.startsWith("/dashboard/operations/requisition"),
                },
            ]
        },
        {
            title: "Resources",
            isDropdown: true,
            routes: [
                {
                    href: "/dashboard/resources/officers",
                    label: "Officers",
                    active: pathname?.startsWith("/dashboard/resources/officers"),
                },
                {
                    href: "/dashboard/resources/witnesses",
                    label: "Witnesses",
                    active: pathname?.startsWith("/dashboard/resources/witnesses"),
                },
                {
                    href: "/dashboard/resources/drivers",
                    label: "Drivers",
                    active: pathname?.startsWith("/dashboard/resources/drivers"),
                },
                {
                    href: "/dashboard/resources/crpf",
                    label: "CRPF",
                    active: pathname?.startsWith("/dashboard/resources/crpf"),
                },
            ]
        },
        {
            title: "Reports",
            isDropdown: true,
            routes: [
                {
                    href: "/dashboard/reports/senior",
                    label: "Senior Report",
                    active: pathname?.startsWith("/dashboard/reports/senior"),
                },
                {
                    href: "/dashboard/reports/team-sheets",
                    label: "Team Sheets",
                    active: pathname?.startsWith("/dashboard/reports/team-sheets"),
                },
                {
                    href: "/dashboard/reports/officer-list",
                    label: "Officer List",
                    active: pathname?.startsWith("/dashboard/reports/officer-list"),
                },
            ]
        }
    ]

    return (
        <nav
            className={cn("flex items-center space-x-4 lg:space-x-6", className)}
            {...props}
        >
            {groups.map((group) => {
                // If it's the Overview group, render all its routes as separate links
                if (group.title === "Overview") {
                    return (
                        <div key={group.title} className="flex items-center space-x-4 lg:space-x-6">
                            {group.routes.map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "text-sm font-medium transition-all duration-200 hover:text-primary",
                                        route.active
                                            ? "text-primary font-semibold"
                                            : "text-muted-foreground/80"
                                    )}
                                >
                                    {route.label}
                                </Link>
                            ))}
                        </div>
                    )
                }

                // Otherwise, render a DropdownMenu
                const isActiveGroup = group.routes.some(r => r.active);

                return (
                    <DropdownMenu key={group.title}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "flex items-center gap-1 text-sm font-medium transition-all duration-200 hover:text-primary outline-none ring-0 focus-visible:ring-0",
                                    isActiveGroup
                                        ? "text-primary font-semibold"
                                        : "text-muted-foreground/80"
                                )}
                            >
                                {group.title}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {group.routes.map((route) => (
                                <DropdownMenuItem key={route.href} asChild>
                                    <Link
                                        href={route.href}
                                        className={cn(
                                            "w-full cursor-pointer",
                                            route.active && "bg-accent text-accent-foreground font-medium"
                                        )}
                                    >
                                        {route.label}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            })}
        </nav>
    )
}
