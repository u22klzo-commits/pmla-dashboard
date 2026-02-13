import { notFound } from "next/navigation"
import { getCaseById } from "@/actions/cases"
import { CaseForm } from "@/components/cases/case-form"

export default async function EditCasePage({ params }: { params: Promise<{ caseId: string }> }) {
    const { caseId } = await params
    const caseItem = await getCaseById(caseId)

    if (!caseItem) {
        notFound()
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Edit Case</h2>
            </div>
            <CaseForm initialData={caseItem} />
        </div>
    )
}
