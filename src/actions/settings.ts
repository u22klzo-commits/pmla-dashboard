'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getFieldConfigs() {
    try {
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
