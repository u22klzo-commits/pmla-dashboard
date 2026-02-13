import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { CaseList } from "@/components/cases/case-list"
import { CreateCaseDialog } from "@/components/cases/create-case-dialog"
import { getCases } from "@/actions/cases"

export const dynamic = 'force-dynamic'

export default async function CasesPage() {
    const cases = await getCases()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Case Management</h2>
                <div className="flex items-center space-x-2">
                    <CreateCaseDialog />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Active Cases</CardTitle>
                    <CardDescription>Manage your investigative cases here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CaseList initialData={cases} />
                </CardContent>
            </Card>
        </div>
    )
}
