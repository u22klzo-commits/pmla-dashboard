'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getCases() {
    try {
        const cases = await prisma.case.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: { searches: true }
                },
                owner: { select: { id: true, name: true, username: true, email: true } },
                collaborators: { select: { id: true, name: true, username: true } }
            }
        } as any)
        return cases
    } catch (error) {
        console.error("Failed to fetch cases:", error)
        return []
    }
}

export async function createCase(data: { caseNumber: string; title: string; description?: string }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const newCase = await prisma.case.create({
            data: {
                caseNumber: data.caseNumber,
                title: data.title,
                description: data.description,
                status: 'OPEN',
                ownerId: session.user.id
            } as any
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
        } as any)
        return caseItem
    } catch (error) {
        console.error("Failed to fetch case:", error)
        return null
    }
}

export async function updateCase(id: string, data: { caseNumber: string; title: string; description?: string }) {
    try {
        const updatedCase = await prisma.case.update({
            where: { id },
            data: {
                caseNumber: data.caseNumber,
                title: data.title,
                description: data.description,
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
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return { success: false, error: "Unauthorized: Admins only" }
        }

        const updatedCase = await prisma.case.update({
            where: { id: caseId },
            data: { ownerId: newOwnerId }
        } as any)

        revalidatePath('/dashboard/cases')
        return { success: true, data: updatedCase }
    } catch (error) {
        console.error("Failed to reassign case:", error)
        return { success: false, error: "Failed to reassign case" }
    }
}

export async function addCaseCollaborator(caseId: string, userId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return { success: false, error: "Unauthorized" }

        // Verify ownership (or Admin)
        const currentCase = await prisma.case.findUnique({ where: { id: caseId } } as any)
        if (!currentCase) return { success: false, error: "Case not found" }

        if ((currentCase as any).ownerId !== session.user.id && session.user.role !== 'ADMIN') {
            return { success: false, error: "Unauthorized: Only owner can add collaborators" }
        }

        await prisma.case.update({
            where: { id: caseId },
            data: {
                collaborators: {
                    connect: { id: userId }
                }
            }
        } as any)

        revalidatePath('/dashboard/cases')
        return { success: true }
    } catch (error) {
        console.error("Failed to add collaborator:", error)
        return { success: false, error: "Failed to add collaborator" }
    }
}

export async function removeCaseCollaborator(caseId: string, userId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return { success: false, error: "Unauthorized" }

        // Verify ownership (or Admin)
        const currentCase = await prisma.case.findUnique({ where: { id: caseId } } as any)
        if (!currentCase) return { success: false, error: "Case not found" }

        if ((currentCase as any).ownerId !== session.user.id && session.user.role !== 'ADMIN') {
            return { success: false, error: "Unauthorized: Only owner can remove collaborators" }
        }

        await prisma.case.update({
            where: { id: caseId },
            data: {
                collaborators: {
                    disconnect: { id: userId }
                }
            }
        } as any)
        revalidatePath('/dashboard/cases')
        return { success: true }
    } catch (error) {
        console.error("Failed to remove collaborator:", error)
        return { success: false, error: "Failed to remove collaborator" }
    }
}
