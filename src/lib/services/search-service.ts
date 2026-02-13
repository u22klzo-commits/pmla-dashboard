import { prisma } from "@/lib/prisma"
import { Search, Case, Premise, ResourceAllocation, Resource } from "@prisma/client"
import { ServiceResult } from "./types"
import { handlePrismaError } from "./error-handler"

export type SearchWithCase = Search & {
    case: {
        caseNumber: string
        title: string | null
        searches?: {
            id: string
            name: string
            status: string
            date: Date
        }[]
    }
    _count: {
        premises: number
    }
}

export type SearchWithDetails = SearchWithCase & {
    premises: (Premise & {
        assignedResources: (ResourceAllocation & {
            resource: Resource
        })[]
    })[]
}

export class SearchService {
    async getSearches(caseId?: string): Promise<ServiceResult<SearchWithCase[]>> {
        try {
            const where = caseId ? { caseId } : {}
            const searches = await prisma.search.findMany({
                where,
                orderBy: { date: 'desc' },
                include: {
                    case: {
                        select: { caseNumber: true, title: true }
                    },
                    _count: {
                        select: { premises: true }
                    }
                }
            })
            return { success: true, data: searches }
        } catch (error) {
            return handlePrismaError(error, "fetch searches")
        }
    }

    async getSearchById(id: string): Promise<ServiceResult<SearchWithDetails | null>> {
        try {
            const search = await prisma.search.findUnique({
                where: { id },
                include: {
                    case: {
                        include: {
                            searches: {
                                select: {
                                    id: true,
                                    name: true,
                                    status: true,
                                    date: true
                                },
                                orderBy: { date: 'desc' }
                            }
                        }
                    },
                    premises: {
                        include: {
                            assignedResources: {
                                include: {
                                    resource: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: { premises: true }
                    }
                }
            })
            return { success: true, data: search }
        } catch (error) {
            return handlePrismaError(error, "fetch search")
        }
    }

    async createSearch(data: { caseId: string; name: string; date: Date }): Promise<ServiceResult<Search>> {
        try {
            const newSearch = await prisma.search.create({
                data: {
                    caseId: data.caseId,
                    name: data.name,
                    date: data.date,
                    status: 'PLANNED'
                }
            })
            return { success: true, data: newSearch }
        } catch (error) {
            return handlePrismaError(error, "create search")
        }
    }

    async updateSearchStatus(id: string, status: 'PLANNED' | 'ACTIVE' | 'COMPLETED'): Promise<ServiceResult<Search>> {
        try {
            const updatedSearch = await prisma.search.update({
                where: { id },
                data: { status }
            })
            return { success: true, data: updatedSearch }
        } catch (error) {
            return handlePrismaError(error, "update search status")
        }
    }

    async updateSearch(id: string, data: { name: string; date: Date; caseId?: string }): Promise<ServiceResult<Search>> {
        try {
            const updatedSearch = await prisma.search.update({
                where: { id },
                data: {
                    name: data.name,
                    date: data.date,
                    ...(data.caseId && { caseId: data.caseId })
                }
            })
            return { success: true, data: updatedSearch }
        } catch (error) {
            return handlePrismaError(error, "update search")
        }
    }

    async deleteSearch(id: string): Promise<ServiceResult<void>> {
        try {
            await prisma.search.delete({
                where: { id }
            })
            return { success: true }
        } catch (error) {
            return handlePrismaError(error, "delete search")
        }
    }
}

export const searchService = new SearchService()
