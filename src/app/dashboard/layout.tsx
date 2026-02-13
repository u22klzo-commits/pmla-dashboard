import * as React from "react"
import { Navbar } from "@/components/layout/navbar"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <DashboardShell navbar={<Navbar />}>
            {children}
        </DashboardShell>
    )
}
