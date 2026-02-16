'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

import { requireAuth, requireRole } from "@/lib/rbac"

export async function getFieldConfigs() {
    try {
        const auth = await requireAuth()
        if (!auth.success) return []

        const configs = await prisma.fieldConfig.findMany()
        return configs
    } catch (error) {
        console.error("Failed to fetch field configs:", error)
        return []
    }
}

export async function updateFieldConfig(
    viewName: string,
    fieldName: string,
    data: { isRequired?: boolean; isVisible?: boolean }
) {
    try {
        const auth = await requireRole(['ADMIN'])
        if (!auth.success) return { success: false, error: auth.error }

        await prisma.fieldConfig.upsert({
            where: {
                viewName_fieldName: {
                    viewName,
                    fieldName
                }
            },
            update: data,
            create: {
                viewName,
                fieldName,
                isRequired: data.isRequired ?? false,
                isVisible: data.isVisible ?? true
            }
        })

        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error("Failed to update field config:", error)
        return { success: false, error: "Failed to update configuration" }
    }
}
