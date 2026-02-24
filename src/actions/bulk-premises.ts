'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { LocationType, PremiseNature, SourceOfInfo } from "@prisma/client"
import { requireAuth, requireCaseAccess } from "@/lib/rbac"
import { searchService } from "@/lib/services/search-service"

const VALID_LOCATION_TYPES: string[] = Object.values(LocationType)
const VALID_NATURES: string[] = Object.values(PremiseNature)
const VALID_SOURCE_OF_INFO: string[] = Object.values(SourceOfInfo)

export async function bulkImportPremises(
    searchId: string,
    data: Record<string, string>[]
) {
    try {
        const auth = await requireAuth()
        if (!auth.success) return { success: false, error: "Unauthorized" }

        // Check write access to the search's case
        const search = await searchService.getSearchById(searchId)
        if (!search.success || !search.data) {
            return { success: false, error: "Search not found" }
        }

        const access = await requireCaseAccess(search.data.caseId, 'WRITE')
        if (!access.success) return { success: false, error: access.error }

        const errors: string[] = []
        const validRows: any[] = []

        for (let i = 0; i < data.length; i++) {
            const row = data[i]
            const rowNum = i + 2 // +2 because row 1 is header, data starts at row 2

            // Skip instruction/comment rows
            if (row.name?.startsWith('#') || row.name?.trim() === '') continue

            // Validate required fields
            if (!row.name || row.name.trim() === '') {
                errors.push(`Row ${rowNum}: name is required`)
                continue
            }
            if (!row.address || row.address.trim() === '') {
                errors.push(`Row ${rowNum}: address is required`)
                continue
            }

            // Validate and map locationType
            const locationType = (row.locationType || '').trim().toUpperCase()
            if (!VALID_LOCATION_TYPES.includes(locationType)) {
                errors.push(`Row ${rowNum}: invalid locationType "${row.locationType}". Must be: ${VALID_LOCATION_TYPES.join(', ')}`)
                continue
            }

            // Validate and map nature
            const nature = (row.nature || '').trim().toUpperCase()
            if (!VALID_NATURES.includes(nature)) {
                errors.push(`Row ${rowNum}: invalid nature "${row.nature}". Must be: ${VALID_NATURES.join(', ')}`)
                continue
            }

            // Validate sourceOfInfo (optional)
            let sourceOfInfo: SourceOfInfo | undefined
            if (row.sourceOfInfo && row.sourceOfInfo.trim() !== '') {
                const src = row.sourceOfInfo.trim().toUpperCase()
                if (!VALID_SOURCE_OF_INFO.includes(src)) {
                    errors.push(`Row ${rowNum}: invalid sourceOfInfo "${row.sourceOfInfo}". Must be: ${VALID_SOURCE_OF_INFO.join(', ')}`)
                    continue
                }
                sourceOfInfo = src as SourceOfInfo
            }

            validRows.push({
                searchId,
                name: row.name.trim(),
                address: row.address.trim(),
                locationType: locationType as LocationType,
                nature: nature as PremiseNature,
                occupantName: row.occupantName?.trim() || null,
                mobileNumber: row.mobileNumber?.trim() || null,
                sourceOfInfo: sourceOfInfo || null,
                gpsLat: row.gpsLat ? parseFloat(row.gpsLat) : null,
                gpsLong: row.gpsLong ? parseFloat(row.gpsLong) : null,
                liveLocationUrl1: row.liveLocationUrl1?.trim() || null,
                liveLocationUrl2: row.liveLocationUrl2?.trim() || null,
                recceStatus: 'PENDING',
                decisionStatus: 'PENDING',
                allocationStatus: 'PENDING',
            })
        }

        if (validRows.length === 0) {
            return {
                success: false,
                error: errors.length > 0
                    ? `No valid rows found. Errors:\n${errors.join('\n')}`
                    : "No data rows found in CSV."
            }
        }

        await prisma.premise.createMany({ data: validRows })

        revalidatePath(`/dashboard/searches/${searchId}`)
        revalidatePath('/dashboard/operations/premises')

        return {
            success: true,
            count: validRows.length,
            errors: errors.length > 0 ? errors : undefined
        }
    } catch (error) {
        console.error("Bulk premise import failed:", error)
        return { success: false, error: "Internal server error during import." }
    }
}
