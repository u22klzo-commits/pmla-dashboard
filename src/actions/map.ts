
'use server'

import { prisma } from "@/lib/prisma"
import { SearchStatus, AllocationStatus } from "@prisma/client"

export async function getTacticalData(searchId?: string | null) {
    try {
        const where: any = {
            gpsLat: { not: null },
            gpsLong: { not: null },
        }

        if (searchId && searchId !== 'global-view') {
            where.searchId = searchId
        }

        const premises = await prisma.premise.findMany({
            include: {
                search: {
                    select: {
                        name: true,
                        status: true,
                    }
                }
            },
            where
        });

        return {
            success: true,
            data: premises.map(p => ({
                id: p.id,
                name: p.name,
                address: p.address,
                coords: [p.gpsLat!, p.gpsLong!] as [number, number],
                status: p.search.status === 'ACTIVE' ? 'Alert' : (p.search.status === 'COMPLETED' ? 'Monitoring' : 'Planned'),
                searchName: p.search.name,
                intensity: p.search.status === 'ACTIVE' ? 'Critical' : 'Medium'
            }))
        };
    } catch (error) {
        console.error("Failed to fetch tactical data:", error);
        return { success: false, error: "Data fetch failed" };
    }
}
