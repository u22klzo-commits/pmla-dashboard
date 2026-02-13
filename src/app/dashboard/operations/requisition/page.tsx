import { getAllPremises } from "@/actions/premises"
import { DataTable } from "@/components/ui/data-table"
import { requisitionColumns, RequisitionColumn } from "@/components/operations/requisition-columns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, AlertCircle, CheckCircle, Search } from "lucide-react"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function RequisitionPage() {
    const cookieStore = await cookies()
    const selectedSearchId = cookieStore.get('selected_search_id')?.value || null

    if (!selectedSearchId) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6 flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-muted/50 mb-4">
                    <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">No Search Selected</h2>
                <p className="text-muted-foreground max-w-md mt-2">
                    Please select an active search from the dashboard to view and manage its resource requisitions.
                </p>
                <div className="mt-6 flex gap-4">
                    <a href="/dashboard" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                        Back to Dashboard
                    </a>
                </div>
            </div>
        )
    }

    const premises = await getAllPremises(selectedSearchId)

    // Transform premises data for requisition view
    const requisitionData: RequisitionColumn[] = premises.map((premise) => {
        const hasRequirements = premise.requirements &&
            Object.values(premise.requirements as object).some(v => v !== null && v !== 0)

        return {
            id: premise.id,
            premiseName: premise.name,
            city: premise.address || '',
            requirements: premise.requirements as any,
            requisitionStatus: hasRequirements ? 'COMPLETED' : 'PENDING',
        }
    })

    // Count stats
    const completed = requisitionData.filter(r => r.requisitionStatus === 'COMPLETED').length
    const pending = requisitionData.filter(r => r.requisitionStatus === 'PENDING').length

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <ClipboardList className="h-8 w-8 text-primary" />
                    Requisition Management
                </h2>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Premises</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{requisitionData.length}</div>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Requirements Set</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">{completed}</div>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">Pending</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{pending}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Resource Requirements by Premise</CardTitle>
                    <CardDescription>
                        Define resource requirements (witnesses, CRPF, vehicles) for each premise before allocation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={requisitionColumns}
                        data={requisitionData}
                        searchKey="premiseName"
                        searchPlaceholder="Search premises..."
                    />
                </CardContent>
            </Card>
        </div>
    )
}
