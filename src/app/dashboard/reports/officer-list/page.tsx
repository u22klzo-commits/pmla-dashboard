
import { prisma } from "@/lib/prisma"
import { OfficerListClient } from "@/components/reports/officer-list-client"

export const dynamic = 'force-dynamic'

export default async function OfficerListPage() {
    const officers = await prisma.resource.findMany({
        where: { type: 'OFFICIAL' },
        include: {
            allocations: {
                take: 1, // Assume one active allocation per resource for now
                orderBy: { assignedAt: 'desc' },
                include: {
                    premise: true
                }
            }
        },
        orderBy: { name: 'asc' }
    })

    const formattedData = officers.map(o => {
        const allocation = o.allocations[0]
        return {
            id: o.id,
            name: o.name,
            rank: (o as any).rank,
            designation: (o as any).designation,
            unit: (o as any).unit,
            mobile: (o as any).contactNumber,
            status: o.status,
            assignedPremise: allocation ? {
                name: allocation.premise.name,
                address: allocation.premise.address
            } : null
        }
    })

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Officers</h2>
            <OfficerListClient data={formattedData} />
        </div>
    )
}
