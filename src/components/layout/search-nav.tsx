"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface SearchNavProps {
    searchId: string
    className?: string
}

export function SearchNav({ searchId, className }: SearchNavProps) {
    const pathname = usePathname()

    const routes = [
        {
            href: `/dashboard/searches/${searchId}`,
            label: "Overview",
            active: pathname === `/dashboard/searches/${searchId}`,
        },
        {
            href: `/dashboard/searches/${searchId}/premises`,
            label: "Premises",
            active: pathname === `/dashboard/searches/${searchId}/premises`,
        },
        {
            href: `/dashboard/searches/${searchId}/recce`,
            label: "Recce",
            active: pathname === `/dashboard/searches/${searchId}/recce`,
        },
        // Placeholder links for future modules
        {
            href: `/dashboard/searches/${searchId}/decision`,
            label: "Decision",
            active: pathname === `/dashboard/searches/${searchId}/decision`,
            disabled: true,
        },
        {
            href: `/dashboard/searches/${searchId}/deployment`,
            label: "Deployment",
            active: pathname === `/dashboard/searches/${searchId}/deployment`,
            disabled: true,
        },
        {
            href: `/dashboard/searches/${searchId}/requisition`,
            label: "Requisition",
            active: pathname === `/dashboard/searches/${searchId}/requisition`,
            disabled: true,
        },
    ]

    return (
        <nav
            className={cn("flex items-center space-x-4 lg:space-x-6 border-b pb-4 mb-4", className)}
        >
            {routes.map((route) => (
                <Link
                    key={route.href}
                    href={route.disabled ? "#" : route.href}
                    className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        route.active
                            ? "text-primary border-b-2 border-primary pb-1"
                            : "text-muted-foreground",
                        route.disabled && "pointer-events-none opacity-50"
                    )}
                >
                    {route.label}
                </Link>
            ))}
        </nav>
    )
}
