'use server'

import { revalidatePath } from "next/cache"
import { searchService } from "@/lib/services/search-service"

import { requireAuth, requireRole, requireCaseAccess } from "@/lib/rbac"

export async function getSearches(caseId?: string) {
    const auth = await requireAuth()
    if (!auth.success) return []

    // If caseId is provided, check access to that case
    if (caseId) {
        const access = await requireCaseAccess(caseId, 'READ')
        if (!access.success) return []
    }

    const result = await searchService.getSearches(caseId)
    if (result.success && result.data) {
        return result.data
    }
    return []
}

export async function getSearchById(id: string) {
    const auth = await requireAuth()
    if (!auth.success) return null

    const result = await searchService.getSearchById(id)
    if (result.success && result.data) {
        // Check access to the parent case
        const access = await requireCaseAccess(result.data.caseId, 'READ')
        if (!access.success) return null

        return result.data
    }
    return null
}

export async function createSearch(data: { caseId: string; name: string; date: Date }) {
    // Check write access to the case
    const access = await requireCaseAccess(data.caseId, 'WRITE')
    if (!access.success) return { success: false, error: access.error }

    const result = await searchService.createSearch(data)
    if (result.success) {
        revalidatePath('/dashboard/searches')
        revalidatePath('/dashboard/cases')
    }
    return result
}

export async function updateSearchStatus(id: string, status: 'PLANNED' | 'ACTIVE' | 'COMPLETED') {
    // Verify user can edit the search (via parent case write access)
    // We need the caseId first. 
    // Optimization: we could assume searchService handles checking existence, 
    // but for RBAC we need caseId. searchService.getSearchById is efficient enough?
    const search = await searchService.getSearchById(id)
    if (!search.success || !search.data) return { success: false, error: "Search not found" }

    const access = await requireCaseAccess(search.data.caseId, 'WRITE')
    if (!access.success) return { success: false, error: access.error }

    const result = await searchService.updateSearchStatus(id, status)
    if (result.success) {
        revalidatePath('/dashboard/searches')
    }
    return result
}

export async function updateSearch(id: string, data: { name: string; date: Date; caseId?: string }) {
    const search = await searchService.getSearchById(id)
    if (!search.success || !search.data) return { success: false, error: "Search not found" }

    const access = await requireCaseAccess(search.data.caseId, 'WRITE')
    if (!access.success) return { success: false, error: access.error }

    const result = await searchService.updateSearch(id, data)
    if (result.success) {
        revalidatePath('/dashboard/searches')
        revalidatePath(`/dashboard/searches/${id}`)
    }
    return result
}

export async function deleteSearch(id: string) {
    const search = await searchService.getSearchById(id)
    if (!search.success || !search.data) return { success: false, error: "Search not found" }

    // Deletion might require higher privs or simple WRITE on case? 
    // Let's go with DELETE permission on case for consistency.
    const access = await requireCaseAccess(search.data.caseId, 'DELETE')
    if (!access.success) return { success: false, error: access.error }

    const result = await searchService.deleteSearch(id)
    if (result.success) {
        revalidatePath('/dashboard/searches')
    }
    return result
}
