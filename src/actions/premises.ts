'use server'

import { revalidatePath } from "next/cache"
import { PremiseNature, LocationType } from "@prisma/client"
import { premiseService } from "@/lib/services/premise-service"
import { searchService } from "@/lib/services/search-service"

export async function getPremises(searchId: string) {
    // If searchId is "global-view" or empty, fetch all premises
    if (!searchId || searchId === 'global-view') {
        return getAllPremises()
    }
    const result = await premiseService.getPremises(searchId)
    if (result.success && result.data) {
        return result.data
    }
    return []
}

export async function getAllPremises(searchId?: string) {
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
    const result = await premiseService.updatePremise(id, data)
    if (result.success) {
        revalidatePath('/dashboard/operations/premises')
        revalidatePath('/dashboard/searches')
    }
    return result
}

export async function getPremiseById(id: string) {
    const result = await premiseService.getPremiseById(id)
    if (result.success && result.data) {
        return result.data
    }
    return null
}

export async function deletePremise(id: string) {
    const result = await premiseService.deletePremise(id)
    if (result.success) {
        revalidatePath('/dashboard/operations/premises')
        revalidatePath('/dashboard/searches')
    }
    return result
}

export async function updatePremiseStatus(id: string, stage: 'recce' | 'decision' | 'allocation', status: string) {
    const result = await premiseService.updatePremiseStatus(id, stage, status)
    if (result.success) {
        revalidatePath('/dashboard/searches');
    }
    return result
}

export async function updatePremiseRequisition(id: string, requirements: any) {
    const result = await premiseService.updatePremiseRequisition(id, requirements)
    if (result.success) {
        revalidatePath('/dashboard/searches');
    }
    return result
}

export async function getRecceData(searchId?: string | null) {
    // 1. Determine effective search ID (global vs specific)
    const isGlobal = !searchId || searchId === 'global-view'

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
