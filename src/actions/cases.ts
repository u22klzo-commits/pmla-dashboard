'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireAuth, requireCaseAccess, requireRole } from "@/lib/rbac"
import { caseCreateSchema, caseUpdateSchema } from "@/lib/schemas"

export async function getCases() {
    try {
        const auth = await requireAuth()
        if (!auth.success) return []

        const { id: userId, role } = auth.session.user
        const where: any = {}

        // Admin and Commanders see all cases? Or just Admins? 
        // Let's say Admin see all. Commanders/Officers/Viewers see only assigned/owned.
        if (role !== 'ADMIN') {
            where.OR = [
                { ownerId: userId },
                { collaborators: { some: { id: userId } } }
            ]
        }

        const cases = await prisma.case.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: { searches: true }
                },
                owner: { select: { id: true, name: true, username: true, email: true } },
                collaborators: { select: { id: true, name: true, username: true } }
            }
        })
        return cases
    } catch (error) {
        console.error("Failed to fetch cases:", error)
        return []
    }
}

export async function createCase(data: { caseNumber: string; title: string; description?: string }) {
    try {
        // Restrict creation to non-VIEWER roles
        const auth = await requireRole(['ADMIN', 'COMMANDER', 'OFFICER'])
        if (!auth.success) return { success: false, error: auth.error }

        const validatedFields = caseCreateSchema.safeParse(data)
        if (!validatedFields.success) {
            return { success: false, error: "Invalid fields", details: validatedFields.error.flatten() }
        }

        const newCase = await prisma.case.create({
            data: {
                caseNumber: validatedFields.data.caseNumber,
                title: validatedFields.data.title,
                description: validatedFields.data.description,
                status: 'ACTIVE',
                ownerId: auth.session.user.id
            }
        })

        revalidatePath('/dashboard/cases')
        return { success: true, data: newCase }
    } catch (error) {
        console.error("Failed to create case:", error)
        return { success: false, error: "Failed to create case" }
    }
}

export async function updateCaseStatus(id: string, status: string) {
    try {
        const access = await requireCaseAccess(id, 'WRITE')
        if (!access.success) return { success: false, error: access.error }

        const updatedCase = await prisma.case.update({
            where: { id },
            data: { status }
        })
        revalidatePath('/dashboard/cases')
        return { success: true, data: updatedCase }
    } catch (error) {
        console.error("Failed to update case:", error)
        return { success: false, error: "Failed to update case" }
    }
}

export async function getCaseById(id: string) {
    try {
        const auth = await requireCaseAccess(id, 'READ')
        if (!auth.success) return null

        const caseItem = await prisma.case.findUnique({
            where: { id },
            include: {
                searches: {
                    orderBy: { date: 'desc' },
                    include: {
                        _count: {
                            select: { premises: true }
                        }
                    }
                },
                _count: {
                    select: { searches: true }
                },
                owner: { select: { id: true, name: true, username: true, email: true } },
                collaborators: { select: { id: true, name: true, username: true, email: true, role: true } }
            }
        })

        return caseItem
    } catch (error) {
        console.error("Failed to fetch case:", error)
        return null
    }
}

export async function updateCase(id: string, data: { caseNumber: string; title: string; description?: string }) {
    try {
        const access = await requireCaseAccess(id, 'WRITE')
        if (!access.success) return { success: false, error: access.error }

        const validatedFields = caseUpdateSchema.safeParse(data)
        if (!validatedFields.success) {
            return { success: false, error: "Invalid fields", details: validatedFields.error.flatten() }
        }

        const updatedCase = await prisma.case.update({
            where: { id },
            data: {
                caseNumber: validatedFields.data.caseNumber,
                title: validatedFields.data.title,
                description: validatedFields.data.description,
            }
        })
        revalidatePath('/dashboard/cases')
        revalidatePath(`/dashboard/cases/${id}`)
        return { success: true, data: updatedCase }
    } catch (error) {
        console.error("Failed to update case:", error)
        return { success: false, error: "Failed to update case" }
    }
}

export async function deleteCase(id: string) {
    try {
        const access = await requireCaseAccess(id, 'DELETE')
        if (!access.success) return { success: false, error: access.error }

        await prisma.case.delete({
            where: { id }
        })
        revalidatePath('/dashboard/cases')
        return { success: true }
    } catch (error) {
        console.error("Failed to delete case:", error)
        return { success: false, error: "Failed to delete case" }
    }
}

export async function assignCaseOwner(caseId: string, newOwnerId: string) {
    try {
        const auth = await requireRole(['ADMIN'])
        if (!auth.success) return { success: false, error: auth.error }

        const updatedCase = await prisma.case.update({
            where: { id: caseId },
            data: { ownerId: newOwnerId }
        })

        revalidatePath('/dashboard/cases')
        return { success: true, data: updatedCase }
    } catch (error) {
        console.error("Failed to reassign case:", error)
        return { success: false, error: "Failed to reassign case" }
    }
}

export async function addCaseCollaborator(caseId: string, userId: string) {
    try {
        // Only Owner or Admin can manage collaborators.
        // requireCaseAccess(id, 'DELETE') enforces Owner or Admin. 
        // So we can reuse 'DELETE' permission check effectively for Management rights.
        const access = await requireCaseAccess(caseId, 'DELETE')
        if (!access.success) return { success: false, error: "Unauthorized: Only owner or admin can add collaborators" }

        await prisma.case.update({
            where: { id: caseId },
            data: {
                collaborators: {
                    connect: { id: userId }
                }
            }
        })

        revalidatePath('/dashboard/cases')
        return { success: true }
    } catch (error) {
        console.error("Failed to add collaborator:", error)
        return { success: false, error: "Failed to add collaborator" }
    }
}

export async function removeCaseCollaborator(caseId: string, userId: string) {
    try {
        const access = await requireCaseAccess(caseId, 'DELETE')
        if (!access.success) return { success: false, error: "Unauthorized: Only owner or admin can remove collaborators" }

        await prisma.case.update({
            where: { id: caseId },
            data: {
                collaborators: {
                    disconnect: { id: userId }
                }
            }
        })
        revalidatePath('/dashboard/cases')
        return { success: true }
    } catch (error) {
        console.error("Failed to remove collaborator:", error)
        return { success: false, error: "Failed to remove collaborator" }
    }
}
