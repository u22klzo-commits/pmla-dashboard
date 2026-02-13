import { prisma } from "@/lib/prisma"
import { Resource, ResourceType, Gender, OfficialRank, IdType, ResourceStatus } from "@prisma/client"
import { ServiceResult } from "./types"
import { handlePrismaError } from "./error-handler"
import { revalidatePath } from "next/cache"

export class ResourceService {
    async getResources(type?: ResourceType, searchId?: string): Promise<ServiceResult<Resource[]>> {
        try {
            const where: any = {}
            if (type) where.type = type
            if (searchId) where.searchId = searchId

            const resources = await prisma.resource.findMany({
                where,
                orderBy: { name: 'asc' }
            })
            return { success: true, data: resources }
        } catch (error) {
            return handlePrismaError(error, "fetch resources")
        }
    }

    async getResourceById(id: string): Promise<ServiceResult<Resource | null>> {
        try {
            const resource = await prisma.resource.findUnique({
                where: { id }
            })
            return { success: true, data: resource }
        } catch (error) {
            return handlePrismaError(error, "fetch resource")
        }
    }

    async createResource(data: any): Promise<ServiceResult<Resource>> {
        try {
            const resource = await prisma.resource.create({
                data: {
                    ...data,
                    status: 'AVAILABLE'
                }
            })
            return { success: true, data: resource }
        } catch (error) {
            return handlePrismaError(error, "create resource")
        }
    }

    async updateResource(id: string, data: any): Promise<ServiceResult<Resource>> {
        try {
            const resource = await prisma.resource.update({
                where: { id },
                data
            })
            return { success: true, data: resource }
        } catch (error) {
            return handlePrismaError(error, "update resource")
        }
    }

    async deleteResource(id: string): Promise<ServiceResult<void>> {
        try {
            await prisma.resource.delete({
                where: { id }
            })
            return { success: true }
        } catch (error) {
            return handlePrismaError(error, "delete resource")
        }
    }

    async allocateResource(premiseId: string, resourceId: string): Promise<ServiceResult<void>> {
        try {
            const premise = await prisma.premise.findUnique({
                where: { id: premiseId }
            })
            const resource = await prisma.resource.findUnique({ where: { id: resourceId } })

            if (!premise || !resource) {
                return { success: false, error: "Premise or Resource not found" }
            }

            if (resource.status !== 'AVAILABLE') {
                return { success: false, error: "Resource is already assigned" }
            }

            // Drivers rule
            if (resource.type === 'DRIVER' && resource.gender !== 'MALE') {
                return { success: false, error: "Drivers must be Male (Policy)." }
            }

            const rankPriority: Record<string, number> = {
                'AD': 1,
                'EO': 2,
                'AEO': 3,
                'DSP': 4,
                'INSPECTOR': 5,
                'SI': 6,
                'ASI': 7,
                'HC': 8,
                'CONSTABLE': 9,
                'OTHER': 10
            }

            await prisma.$transaction([
                prisma.resourceAllocation.create({
                    data: {
                        premiseId,
                        resourceId
                    }
                }),
                prisma.resource.update({
                    where: { id: resourceId },
                    data: { status: 'ASSIGNED' }
                })
            ])

            return { success: true }
        } catch (error) {
            return handlePrismaError(error, "allocate resource")
        }
    }

    async deallocateResource(allocationId: string, resourceId: string): Promise<ServiceResult<void>> {
        try {
            await prisma.$transaction([
                prisma.resourceAllocation.delete({
                    where: { id: allocationId }
                }),
                prisma.resource.update({
                    where: { id: resourceId },
                    data: { status: 'AVAILABLE' }
                })
            ])
            return { success: true }
        } catch (error) {
            return handlePrismaError(error, "deallocate")
        }
    }

    async syncAllocations(
        premiseId: string,
        addedResourceIds: string[],
        removedResourceIds: string[]
    ): Promise<ServiceResult<void>> {
        try {
            await prisma.$transaction(async (tx) => {
                if (removedResourceIds.length > 0) {
                    const allocationsToDelete = await tx.resourceAllocation.findMany({
                        where: {
                            premiseId: premiseId,
                            resourceId: { in: removedResourceIds }
                        },
                        select: { id: true }
                    })

                    const allocationIds = allocationsToDelete.map(a => a.id)

                    if (allocationIds.length > 0) {
                        await tx.resourceAllocation.deleteMany({
                            where: { id: { in: allocationIds } }
                        })

                        await tx.resource.updateMany({
                            where: { id: { in: removedResourceIds } },
                            data: { status: 'AVAILABLE' }
                        })
                    }
                }

                if (addedResourceIds.length > 0) {
                    const availableResources = await tx.resource.findMany({
                        where: {
                            id: { in: addedResourceIds },
                            status: 'AVAILABLE'
                        }
                    })

                    if (availableResources.length !== addedResourceIds.length) {
                        throw new Error("One or more resources are no longer available.")
                    }

                    await tx.resourceAllocation.createMany({
                        data: addedResourceIds.map(resourceId => ({
                            premiseId,
                            resourceId
                        }))
                    })

                    await tx.resource.updateMany({
                        where: { id: { in: addedResourceIds } },
                        data: { status: 'ASSIGNED' }
                    })
                }
            })
            return { success: true }
        } catch (error: any) {
            return handlePrismaError(error, "sync allocations")
        }
    }

    async validateTeamComposition(premiseId: string): Promise<ServiceResult<{ valid: boolean; message?: string }>> {
        try {
            const premise = await prisma.premise.findUnique({
                where: { id: premiseId },
                include: { assignedResources: { include: { resource: true } } }
            })

            if (!premise) return { success: false, error: "Premise not found" }

            const resources = premise.assignedResources.map(r => r.resource)

            if (premise.nature === 'RESIDENTIAL') {
                const hasFemale = resources.some(r => r.gender === 'FEMALE')
                if (!hasFemale) {
                    return { success: true, data: { valid: false, message: "Residential premises require at least one Female member." } }
                }
            }

            const officials = resources.filter(r => r.type === 'OFFICIAL')
            if (officials.length > 0) {
                const hasLeader = officials.some(r => ['EO', 'AD'].includes(r.rank || ''))
                if (!hasLeader) {
                    return { success: true, data: { valid: false, message: "Team requires a Team Leader of rank EO or above." } }
                }
            } else {
                return { success: true, data: { valid: false, message: "No Officials assigned to the team." } }
            }

            return { success: true, data: { valid: true } }
        } catch (error) {
            return handlePrismaError(error, "validate team composition")
        }
    }
}

export const resourceService = new ResourceService()
