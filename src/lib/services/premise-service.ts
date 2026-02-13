import { prisma } from "@/lib/prisma"
import { PremiseNature, LocationType, RecceStatus, DecisionStatus, Premise, Search, Resource, ResourceAllocation } from "@prisma/client"
import { ServiceResult } from "./types"
import { handlePrismaError } from "./error-handler"

export type PremiseWithRelations = Premise & {
    search: Search
    assignedResources: (ResourceAllocation & {
        resource: Resource
    })[]
}

export class PremiseService {
    async getPremises(searchId: string): Promise<ServiceResult<PremiseWithRelations[]>> {
        try {
            const premises = await prisma.premise.findMany({
                where: { searchId },
                orderBy: { createdAt: 'desc' },
                include: {
                    search: true,
                    assignedResources: {
                        include: {
                            resource: true
                        }
                    }
                }
            })
            return { success: true, data: premises }
        } catch (error) {
            return handlePrismaError(error, "fetch premises")
        }
    }

    async getAllPremises(searchId?: string): Promise<ServiceResult<PremiseWithRelations[]>> {
        try {
            const where = searchId ? { searchId } : {}
            const premises = await prisma.premise.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    search: true,
                    assignedResources: {
                        include: {
                            resource: true
                        }
                    }
                }
            })
            return { success: true, data: premises }
        } catch (error) {
            return handlePrismaError(error, "fetch all premises")
        }

    }

    async createPremise(data: {
        searchId: string,
        name: string,
        address: string,
        locationType: LocationType,
        nature: PremiseNature,
        occupantName?: string,
        mobileNumber?: string,
        sourceOfInfo?: string,
        gpsLat?: number,
        gpsLong?: number,
        distanceFromCrpfCamp?: number,
        liveLocationUrl1?: string,
        liveLocationUrl2?: string,
        recceNotes?: string
    }): Promise<ServiceResult<Premise>> {
        try {
            const newPremise = await prisma.premise.create({
                data: {
                    searchId: data.searchId,
                    name: data.name,
                    address: data.address,
                    locationType: data.locationType,
                    nature: data.nature,
                    occupantName: data.occupantName,
                    mobileNumber: data.mobileNumber,
                    sourceOfInfo: data.sourceOfInfo as any,
                    gpsLat: data.gpsLat,
                    gpsLong: data.gpsLong,
                    distanceFromCrpfCamp: data.distanceFromCrpfCamp,
                    liveLocationUrl1: data.liveLocationUrl1,
                    liveLocationUrl2: data.liveLocationUrl2,
                    recceNotes: data.recceNotes,
                    recceStatus: 'PENDING',
                    decisionStatus: 'PENDING',
                    allocationStatus: 'PENDING'
                }
            })
            return { success: true, data: newPremise }
        } catch (error) {
            return handlePrismaError(error, "create premise")
        }
    }

    async updatePremise(
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
            recceNotes?: string
        }
    ): Promise<ServiceResult<Premise>> {
        try {
            const updatedPremise = await prisma.premise.update({
                where: { id },
                data: {
                    name: data.name,
                    address: data.address,
                    locationType: data.locationType,
                    nature: data.nature,
                    occupantName: data.occupantName,
                    mobileNumber: data.mobileNumber,
                    sourceOfInfo: data.sourceOfInfo as any,
                    gpsLat: data.gpsLat,
                    gpsLong: data.gpsLong,
                    distanceFromCrpfCamp: data.distanceFromCrpfCamp,
                    liveLocationUrl1: data.liveLocationUrl1,
                    liveLocationUrl2: data.liveLocationUrl2,
                    recceNotes: data.recceNotes,
                }
            })
            return { success: true, data: updatedPremise }
        } catch (error) {
            return handlePrismaError(error, "update premise")
        }
    }

    async getPremiseById(id: string): Promise<ServiceResult<PremiseWithRelations | null>> {
        try {
            const premise = await prisma.premise.findUnique({
                where: { id },
                include: {
                    search: true,
                    assignedResources: {
                        include: {
                            resource: true
                        }
                    }
                }
            })
            return { success: true, data: premise }
        } catch (error) {
            return handlePrismaError(error, "fetch premise")
        }
    }

    async deletePremise(id: string): Promise<ServiceResult<void>> {
        try {
            await prisma.premise.delete({
                where: { id }
            })
            return { success: true }
        } catch (error) {
            return handlePrismaError(error, "delete premise")
        }
    }

    async updatePremiseStatus(id: string, stage: 'recce' | 'decision' | 'allocation', status: string): Promise<ServiceResult<void>> {
        try {
            const updateData: any = {};
            if (stage === 'recce') updateData.recceStatus = status;
            if (stage === 'decision') updateData.decisionStatus = status;
            if (stage === 'allocation') updateData.allocationStatus = status;

            await prisma.premise.update({
                where: { id },
                data: updateData
            });

            return { success: true };
        } catch (error) {
            return handlePrismaError(error, "update premise status")
        }
    }

    async updatePremiseRequisition(id: string, requirements: any): Promise<ServiceResult<void>> {
        try {
            await prisma.premise.update({
                where: { id },
                data: {
                    requirements,
                    distanceFromCrpfCamp: (requirements as any).distanceFromCrpfCamp
                }
            });

            return { success: true };
        } catch (error) {
            return handlePrismaError(error, "update requisition")
        }
    }
}

export const premiseService = new PremiseService()
