import { notFound } from "next/navigation"
import { getResourceById } from "@/actions/resources"
import { getSelectedSearchId } from "@/actions/context"
import { ResourceForm } from "@/components/resources/resource-form"

export const dynamic = "force-dynamic"

export default async function EditResourcePage({ params }: { params: Promise<{ resourceId: string }> }) {
    const { resourceId } = await params
    const resource = await getResourceById(resourceId) as any
    const selectedSearchId = await getSelectedSearchId()

    if (!resource) {
        notFound()
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Edit Resource</h2>
            </div>
            <ResourceForm initialData={resource} searchId={selectedSearchId || undefined} />
        </div>
    )
}
