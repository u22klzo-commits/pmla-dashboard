'use server'

import { revalidatePath } from "next/cache"
import { ResourceType } from "@prisma/client"
import { resourceService } from "@/lib/services/resource-service"
import { Gender, OfficialRank, IdType, ResourceStatus } from "@/types/resource-types"
import { AllocationService } from "@/lib/services/allocation-service"

export async function getResources(type?: ResourceType, searchId?: string) {
    const result = await resourceService.getResources(type, searchId)
    return result.data || []
}

export async function getResourceById(id: string) {
    const result = await resourceService.getResourceById(id)
    return result.data || null
}

export async function allocateResource(premiseId: string, resourceId: string) {
    const result = await resourceService.allocateResource(premiseId, resourceId)
    if (result.success) {
        // Need to find searchId for revalidation
        const resourceResult = await resourceService.getResourceById(resourceId)
        const resource = resourceResult.data as any
        if (resource?.searchId) {
            revalidatePath(`/dashboard/searches/${resource.searchId}`)
        }
    }
    return result
}

export async function deallocateResource(allocationId: string, resourceId: string, searchId: string) {
    const result = await resourceService.deallocateResource(allocationId, resourceId)
    if (result.success) {
        revalidatePath(`/dashboard/searches/${searchId}`)
    }
    return result
}

export async function validateTeamComposition(premiseId: string) {
    const result = await resourceService.validateTeamComposition(premiseId)
    if (!result.success) return { valid: false, message: result.error }
    return result.data!
}

export async function createResource(data: any) {
    const result = await resourceService.createResource(data)
    if (result.success) {
        revalidatePath('/dashboard/resources')
    }
    return result
}

export async function deleteResource(resourceId: string) {
    const result = await resourceService.deleteResource(resourceId)
    if (result.success) {
        revalidatePath('/dashboard/resources')
    }
    return result
}

export async function updateResource(resourceId: string, data: any) {
    const result = await resourceService.updateResource(resourceId, data)
    if (result.success) {
        revalidatePath('/dashboard/resources')
    }
    return result
}

export async function syncResourceAllocations(
    premiseId: string,
    searchId: string,
    addedResourceIds: string[],
    removedResourceIds: string[]
) {
    const result = await resourceService.syncAllocations(premiseId, addedResourceIds, removedResourceIds)
    if (result.success) {
        revalidatePath(`/dashboard/searches/${searchId}`)
    }
    return result
}

export async function suggestResourceAllocation(premiseId: string) {
    return await AllocationService.suggestAllocation(premiseId)
}

export async function autoAssignAllPremises() {
    const result = await AllocationService.autoAssignAllPremises()
    if (result.success) {
        revalidatePath('/dashboard/operations/deployment')
    }
    return result
}

