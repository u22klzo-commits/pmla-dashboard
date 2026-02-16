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

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export default async function CasesPage() {
    const cases = await getCases()
    const session = await getServerSession(authOptions)
    const canCreate = session?.user?.role && session.user.role !== 'VIEWER'

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Case Management</h2>
                <div className="flex items-center space-x-2">
                    {canCreate && <CreateCaseDialog />}
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
