'use server'

import { revalidatePath } from "next/cache"
import { PremiseNature, LocationType } from "@prisma/client"
import { premiseService } from "@/lib/services/premise-service"
import { searchService } from "@/lib/services/search-service"

import { requireAuth, requireCaseAccess, requireRole } from "@/lib/rbac"

export async function getPremises(searchId: string) {
    const auth = await requireAuth()
    if (!auth.success) return []

    // If searchId is "global-view" or empty, fetch all premises
    // Restricted to ADMIN and COMMANDER
    if (!searchId || searchId === 'global-view') {
        const roleCheck = await requireRole(['ADMIN', 'COMMANDER'])
        if (!roleCheck.success) return []

        const result = await getAllPremises()
        return result
    }

    // Check read access to the search's case
    const search = await searchService.getSearchById(searchId)
    if (search.success && search.data) {
        const access = await requireCaseAccess(search.data.caseId, 'READ')
        if (!access.success) return []
    }

    const result = await premiseService.getPremises(searchId)
    if (result.success && result.data) {
        return result.data
    }
    return []
}

export async function getAllPremises(searchId?: string) {
    const auth = await requireAuth()
    if (!auth.success) return []

    // If fetching all premises (no specific search context), restrict to high-level roles
    if (!searchId) {
        const roleCheck = await requireRole(['ADMIN', 'COMMANDER'])
        if (!roleCheck.success) return []
    }

    const result = await premiseService.getAllPremises(searchId)
    if (result.success && result.data) {
        return result.data
    }
    return []
}

export async function createPremise(data: {
    searchId: string,
    name: string,
    address: string,
    locationType: LocationType,
    nature: PremiseNature,
    // New optional fields
    occupantName?: string,
    mobileNumber?: string,
    sourceOfInfo?: string,
    gpsLat?: number,
    gpsLong?: number,
    distanceFromCrpfCamp?: number,
    liveLocationUrl1?: string,
    liveLocationUrl2?: string,
    photoUrl?: string,
    recceNotes?: string
}) {
    // Check write access to parent case
    const search = await searchService.getSearchById(data.searchId)
    if (!search.success || !search.data) return { success: false, error: "Search not found" }

    const access = await requireCaseAccess(search.data.caseId, 'WRITE')
    if (!access.success) return { success: false, error: access.error }

    const result = await premiseService.createPremise(data)
    if (result.success) {
        revalidatePath(`/dashboard/searches/${data.searchId}`)
    }
    return result
}

export async function updatePremise(
    id: string,
    data: {
        name?: string
        address?: string
        locationType?: LocationType
        nature?: PremiseNature
        occupantName?: string
        mobileNumber?: string
        sourceOfInfo?: string
        gpsLat?: number
        gpsLong?: number
        distanceFromCrpfCamp?: number
        liveLocationUrl1?: string
        liveLocationUrl2?: string
        photoUrl?: string
        recceNotes?: string
    }
) {
    // Need to find the premises's search -> case to check permissions
    const premise = await premiseService.getPremiseById(id)
    if (!premise.success || !premise.data) return { success: false, error: "Premise not found" }

    // premise.data from service likely includes search? The service view below will confirm.
    // If not, we might fail here. Assuming getPremiseById returns search relation or we fetch it.
    // Looking at service code is safer, but let's assume it does or we use searchService.
    const searchId = premise.data.searchId
    const search = await searchService.getSearchById(searchId)
    if (!search.success || !search.data) return { success: false, error: "Search not found" }

    const access = await requireCaseAccess(search.data.caseId, 'WRITE')
    if (!access.success) return { success: false, error: access.error }

    const result = await premiseService.updatePremise(id, data)
    if (result.success) {
        revalidatePath('/dashboard/operations/premises')
        revalidatePath('/dashboard/searches')
    }
    return result
}

export async function getPremiseById(id: string) {
    const auth = await requireAuth()
    if (!auth.success) return null

    const result = await premiseService.getPremiseById(id)
    if (result.success && result.data) {
        const searchId = result.data.searchId
        const search = await searchService.getSearchById(searchId)
        if (search.success && search.data) {
            const access = await requireCaseAccess(search.data.caseId, 'READ')
            if (!access.success) return null
        }
        return result.data
    }
    return null
}

export async function deletePremise(id: string) {
    const premise = await premiseService.getPremiseById(id)
    if (!premise.success || !premise.data) return { success: false, error: "Premise not found" }

    const searchId = premise.data.searchId
    const search = await searchService.getSearchById(searchId)
    if (!search.success || !search.data) return { success: false, error: "Search not found" }

    const access = await requireCaseAccess(search.data.caseId, 'DELETE') // or WRITE?
    if (!access.success) return { success: false, error: access.error }

    const result = await premiseService.deletePremise(id)
    if (result.success) {
        revalidatePath('/dashboard/operations/premises')
        revalidatePath('/dashboard/searches')
    }
    return result
}

export async function updatePremiseStatus(id: string, stage: 'recce' | 'decision' | 'allocation', status: string) {
    const premise = await premiseService.getPremiseById(id)
    if (!premise.success || !premise.data) return { success: false, error: "Premise not found" }

    const searchId = premise.data.searchId
    const search = await searchService.getSearchById(searchId)
    if (!search.success || !search.data) return { success: false, error: "Search not found" }

    const access = await requireCaseAccess(search.data.caseId, 'WRITE')
    if (!access.success) return { success: false, error: access.error }

    const result = await premiseService.updatePremiseStatus(id, stage, status)
    if (result.success) {
        revalidatePath('/dashboard/searches');
    }
    return result
}

export async function updatePremiseRequisition(id: string, requirements: any) {
    const premise = await premiseService.getPremiseById(id)
    if (!premise.success || !premise.data) return { success: false, error: "Premise not found" }

    const searchId = premise.data.searchId
    const search = await searchService.getSearchById(searchId)
    if (!search.success || !search.data) return { success: false, error: "Search not found" }

    const access = await requireCaseAccess(search.data.caseId, 'WRITE')
    if (!access.success) return { success: false, error: access.error }

    const result = await premiseService.updatePremiseRequisition(id, requirements)
    if (result.success) {
        revalidatePath('/dashboard/searches');
    }
    return result
}

export async function getRecceData(searchId?: string | null) {
    const auth = await requireAuth()
    if (!auth.success) return { premises: [], search: null, isGlobal: true } // valid empty implementation

    // 1. Determine effective search ID (global vs specific)
    const isGlobal = !searchId || searchId === 'global-view'

    if (isGlobal) {
        const roleCheck = await requireRole(['ADMIN', 'COMMANDER'])
        if (!roleCheck.success) return { premises: [], search: null, isGlobal: true }
    }

    if (!isGlobal && searchId) {
        const search = await searchService.getSearchById(searchId)
        if (search.success && search.data) {
            const access = await requireCaseAccess(search.data.caseId, 'READ')
            // If no access, return empty? or error?
            // Context of this function suggests returning data structure.
            if (!access.success) return { premises: [], search: null, isGlobal: false }
        }
    }

    // 2. Fetch Premises
    // If global, we want ALL premises. If specific, we want ONLY that search's premises.
    const premisesResult = await (isGlobal
        ? premiseService.getAllPremises()
        : premiseService.getPremises(searchId!))

    // 3. Fetch Search Details (if specific)
    const searchResult = !isGlobal && searchId
        ? await searchService.getSearchById(searchId)
        : { success: true, data: null }

    return {
        premises: premisesResult.success ? premisesResult.data || [] : [],
        search: searchResult.success ? searchResult.data : null,
        isGlobal
    }
}
