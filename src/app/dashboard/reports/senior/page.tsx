
import { getAllPremises } from "@/actions/premises"
import { SeniorReportClient } from "@/components/reports/senior-report-client"
import { OfficialRank, ResourceType } from "@prisma/client"

export const dynamic = 'force-dynamic'

export default async function SeniorReportPage() {
    const premises = await getAllPremises()

    const formattedData = premises.map(p => {
        const resources = p.assignedResources.map(ar => ar.resource)

        // Extract Team Leader (Generic Logic: Highest Rank Official or just First Assigned Official if no logic specified)
        // Ideally we pick by Rank. For now, simple find first Official.
        const officials = resources.filter(r => r.type === 'OFFICIAL')
        const teamLeaderResource = officials.length > 0 ? officials[0] : null

        const officers = officials
            .filter(o => o.id !== teamLeaderResource?.id)
            .map(o => ({
                name: o.name,
                rank: o.rank || 'Officer'
            }))

        const witnesses = resources
            .filter(r => r.type === 'WITNESS')
            .map(w => ({
                name: w.name,
                mobile: w.contactNumber || undefined
            }))

        // Calculate CRPF Strength
        const crpfStrength = resources
            .filter(r => r.type === 'CRPF')
            .reduce((acc, r) => acc + (r.crpfMaleCount || 0) + (r.crpfFemaleCount || 0), 0)

        const driverCount = resources.filter(r => r.type === 'DRIVER').length

        return {
            id: p.id,
            name: p.name,
            address: p.address,
            gpsLat: p.gpsLat,
            gpsLong: p.gpsLong,
            locationType: p.locationType,
            teamLeader: teamLeaderResource ? {
                name: teamLeaderResource.name,
                rank: teamLeaderResource.rank || 'Officer',
                mobile: teamLeaderResource.contactNumber || undefined
            } : null,
            officers,
            witnesses,
            crpfStrength,
            driverCount
        }
    })

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Senior Report</h2>
            </div>
            <SeniorReportClient data={formattedData} />
        </div>
    )
}
