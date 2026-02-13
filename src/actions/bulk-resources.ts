'use server';

import { prisma } from '@/lib/prisma';
import { ResourceType, Gender, OfficialRank } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Fallback if IdType is not exported
enum IdType {
    AADHAAR = 'AADHAAR',
    VOTER_ID = 'VOTER_ID',
    PAN = 'PAN',
    OTHER = 'OTHER'
}

export async function bulkImportResources(type: ResourceType, data: any[], searchId?: string) {
    if (!data || data.length === 0) {
        return { success: false, error: 'No data provided' };
    }

    try {
        const resourcesToCreate = data.map(item => {
            const baseResource = {
                type,
                name: item.name,
                gender: (item.gender?.toUpperCase() in Gender) ? item.gender.toUpperCase() as Gender : Gender.MALE,
                contactNumber: item.contactNumber || null,
                searchId: searchId || null,
            };

            switch (type) {
                case 'OFFICIAL':
                    return {
                        ...baseResource,
                        rank: (item.rank?.toUpperCase() in OfficialRank) ? item.rank.toUpperCase() as OfficialRank : OfficialRank.OTHER,
                        designation: item.designation || null,
                        unit: item.unit || null,
                        details: item.remarks || null, // Map remarks to details if needed, or if schema has remarks, use remarks. Schema has remarks.
                        remarks: item.remarks || null,
                    };
                case 'WITNESS':
                    return {
                        ...baseResource,
                        address: item.address || null,
                        idType: (item.idType?.toUpperCase() in IdType) ? item.idType.toUpperCase() as IdType : IdType.OTHER,
                        idNumber: item.idNumber || null,
                    };
                case 'DRIVER':
                    return {
                        ...baseResource,
                        licenseNumber: item.licenseNumber || null,
                        vehicleType: item.vehicleType || null,
                        vehicleRegNo: item.vehicleRegNo || null,
                    };
                case 'CRPF':
                    return {
                        ...baseResource,
                        name: item['Team Leader Name'] || item.name || 'Unknown',
                        crpfMaleCount: item['Male Count'] ? parseInt(item['Male Count']) : (item.crpfMaleCount ? parseInt(item.crpfMaleCount) : 0),
                        crpfFemaleCount: item['Female Count'] ? parseInt(item['Female Count']) : (item.crpfFemaleCount ? parseInt(item.crpfFemaleCount) : 0),
                        contactNumber: item['Contact Number'] || item.contactNumber || null,
                    };
                default:
                    return baseResource;
            }
        });

        await prisma.resource.createMany({
            data: resourcesToCreate,
        });

        revalidatePath('/dashboard/resources');
        const routeMap: Record<string, string> = {
            'OFFICIAL': 'officers',
            'WITNESS': 'witnesses',
            'DRIVER': 'drivers',
            'CRPF': 'crpf'
        };
        revalidatePath(`/dashboard/resources/${routeMap[type] || 'page'}`);

        return { success: true, count: resourcesToCreate.length };
    } catch (error) {
        console.error('Bulk import error:', error);
        return { success: false, error: 'Failed to import resources' };
    }
}
