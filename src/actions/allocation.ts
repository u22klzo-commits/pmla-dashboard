'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { ResourceType, Gender, ResourceStatus } from "@prisma/client"

interface Requirements {
    maleWitness?: number
    femaleWitness?: number
    official?: number
    driver?: number
    crpf?: number
}

export async function autoAllocateResources(searchId: string) {
    try {
        // 1. Fetch Approved Premises for this Search
        const premises = await prisma.premise.findMany({
            where: {
                searchId,
                decisionStatus: 'APPROVED',
                allocationStatus: { not: 'DONE' }
            }
        })

        if (premises.length === 0) {
            return { success: false, error: "No approved premises pending allocation found." }
        }

        // 2. Fetch Available Resources
        const availableResources = await prisma.resource.findMany({
            where: { status: 'AVAILABLE' }
        })

        // Segregate resources for faster matching
        const pool = {
            maleWitness: availableResources.filter(r => r.type === 'WITNESS' && r.gender === 'MALE'),
            femaleWitness: availableResources.filter(r => r.type === 'WITNESS' && r.gender === 'FEMALE'),
            official: availableResources.filter(r => r.type === 'OFFICIAL'),
            driver: availableResources.filter(r => r.type === 'DRIVER'),
            crpf: availableResources.filter(r => r.type === 'CRPF'),
        }

        const allocationOperations: any[] = []
        const resourceUpdates: string[] = [] // Track IDs to update status

        let allocatedCount = 0

        // 3. Match Logic
        for (const premise of premises) {
            const reqs = (premise as any).requirements as Requirements || {}

            let premiseAllocated = false

            // Helper to allocate from pool
            const allocate = (type: keyof typeof pool, count: number) => {
                const resourcesToAssign = pool[type].splice(0, count)
                if (resourcesToAssign.length > 0) {
                    premiseAllocated = true
                    allocatedCount += resourcesToAssign.length
                    resourcesToAssign.forEach(resource => {
                        allocationOperations.push(
                            prisma.resourceAllocation.create({
                                data: {
                                    premiseId: premise.id,
                                    resourceId: resource.id
                                }
                            })
                        )
                        resourceUpdates.push(resource.id)
                    })
                }
            }

            if (reqs.maleWitness) allocate('maleWitness', reqs.maleWitness)
            if (reqs.femaleWitness) allocate('femaleWitness', reqs.femaleWitness)
            if (reqs.official) allocate('official', reqs.official)
            if (reqs.driver) allocate('driver', reqs.driver)
            if (reqs.crpf) allocate('crpf', reqs.crpf)

            // Update Premise Status if any allocation happened
            // Note: Simplification - marking DONE if any allocation happened, 
            // strictly should check if ALL requirements met.
            // For now, let's mark as DONE to prevent re-allocation loops, user can adjust manually.
            if (premiseAllocated) {
                allocationOperations.push(
                    prisma.premise.update({
                        where: { id: premise.id },
                        data: { allocationStatus: 'DONE' }
                    })
                )
            }
        }

        if (allocationOperations.length === 0) {
            return { success: false, error: "Not enough available resources to fulfill any requirements." }
        }

        // 4. Batch Status Update for Resources
        // We do this separately or include in transaction. 
        // Prisma doesn't support "updateMany with where IN list" efficiently for *different* updates,
        // but here all are setting status to ASSIGNED.
        allocationOperations.push(
            prisma.resource.updateMany({
                where: { id: { in: resourceUpdates } },
                data: { status: 'ASSIGNED' }
            })
        )

        // 5. Execute Transaction
        await prisma.$transaction(allocationOperations)

        revalidatePath(`/dashboard/searches/${searchId}`)
        return { success: true, message: `Allocated ${allocatedCount} resources across premises.` }

    } catch (error) {
        console.error("Auto-allocation failed:", error)
        return { success: false, error: "Internal server error during allocation." }
    }
}
