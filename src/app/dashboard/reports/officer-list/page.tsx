
import { prisma } from "@/lib/prisma"
import { OfficerListClient } from "@/components/reports/officer-list-client"
import { getSelectedSearchId } from "@/lib/services/search-service"
import { ExportButton } from "@/components/dashboard/export-button"

export const dynamic = 'force-dynamic'

export default async function OfficerListPage() {
    const searchId = await getSelectedSearchId()
    const isGlobal = !searchId || searchId === 'global-view'

    const where: any = { type: 'OFFICIAL' }

    if (!isGlobal && searchId) {
        where.OR = [
            { searchId },
            {
                allocations: {
                    some: {
                        premise: {
                            searchId: searchId
                        }
                    }
                }
            }
        ]
    }

    const officers = await prisma.resource.findMany({
        where,
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
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Officers</h2>
                <div className="flex items-center space-x-2">
                    <ExportButton type="auto" searchId={isGlobal ? undefined : searchId} />
                </div>
            </div>
            <OfficerListClient data={formattedData} />
        </div>
    )
}
