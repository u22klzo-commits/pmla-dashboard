import { prisma } from "@/lib/prisma"
import { Case } from "@prisma/client"
import { ServiceResult } from "./types"
import { handlePrismaError } from "./error-handler"

export class CaseService {
    async getCases(): Promise<ServiceResult<Case[]>> {
        try {
            const cases = await prisma.case.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    searches: {
                        select: { id: true, name: true, status: true }
                    },
                    _count: {
                        select: { searches: true }
                    }
                }
            })
            return { success: true, data: cases }
        } catch (error) {
            return handlePrismaError(error, "fetch cases")
        }
    }

    async getCaseById(id: string): Promise<ServiceResult<Case | null>> {
        try {
            const caseData = await prisma.case.findUnique({
                where: { id },
                include: {
                    searches: {
                        orderBy: { date: 'desc' }
                    }
                }
            })
            return { success: true, data: caseData }
        } catch (error) {
            return handlePrismaError(error, "fetch case")
        }
    }

    async createCase(data: { title: string; caseNumber: string; description?: string }): Promise<ServiceResult<Case>> {
        try {
            const newCase = await prisma.case.create({
                data: {
                    title: data.title,
                    caseNumber: data.caseNumber,
                    description: data.description,
                    status: 'OPEN'
                }
            })
            return { success: true, data: newCase }
        } catch (error) {
            return handlePrismaError(error, "create case")
        }
    }

    async updateCaseStatus(id: string, status: 'OPEN' | 'CLOSED' | 'ARCHIVED'): Promise<ServiceResult<Case>> {
        try {
            const updatedCase = await prisma.case.update({
                where: { id },
                data: { status }
            })
            return { success: true, data: updatedCase }
        } catch (error) {
            return handlePrismaError(error, "update case status")
        }
    }

    async deleteCase(id: string): Promise<ServiceResult<void>> {
        try {
            await prisma.case.delete({
                where: { id }
            })
            return { success: true }
        } catch (error) {
            return handlePrismaError(error, "delete case")
        }
    }
}

export const caseService = new CaseService()
