'use server'

import { revalidatePath } from "next/cache"
import { searchService } from "@/lib/services/search-service"

export async function getSearches(caseId?: string) {
    const result = await searchService.getSearches(caseId)
    if (result.success && result.data) {
        return result.data
    }
    return []
}

export async function getSearchById(id: string) {
    const result = await searchService.getSearchById(id)
    if (result.success && result.data) {
        return result.data
    }
    return null
}

export async function createSearch(data: { caseId: string; name: string; date: Date }) {
    const result = await searchService.createSearch(data)
    if (result.success) {
        revalidatePath('/dashboard/searches')
        revalidatePath('/dashboard/cases')
    }
    return result
}

export async function updateSearchStatus(id: string, status: 'PLANNED' | 'ACTIVE' | 'COMPLETED') {
    const result = await searchService.updateSearchStatus(id, status)
    if (result.success) {
        revalidatePath('/dashboard/searches')
    }
    return result
}

export async function updateSearch(id: string, data: { name: string; date: Date; caseId?: string }) {
    const result = await searchService.updateSearch(id, data)
    if (result.success) {
        revalidatePath('/dashboard/searches')
        revalidatePath(`/dashboard/searches/${id}`)
    }
    return result
}

export async function deleteSearch(id: string) {
    const result = await searchService.deleteSearch(id)
    if (result.success) {
        revalidatePath('/dashboard/searches')
    }
    return result
}
