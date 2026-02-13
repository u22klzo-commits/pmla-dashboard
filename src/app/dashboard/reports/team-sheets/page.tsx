
import { getAllPremises } from "@/actions/premises"
import { TeamSheetsClient } from "@/components/reports/team-sheets-client"
import { getSelectedSearchId } from "@/lib/services/search-service"
import { ExportButton } from "@/components/dashboard/export-button"

export const dynamic = 'force-dynamic'

export default async function TeamSheetsPage() {
    const searchId = await getSelectedSearchId()
    const isGlobal = !searchId || searchId === 'global-view'

    const premises = await getAllPremises(isGlobal ? undefined : searchId)

    const formattedData = premises.map(p => {
        const resources = p.assignedResources.map(ar => ar.resource)

        const officials = resources.filter(r => r.type === 'OFFICIAL')
        const teamLeaderResource = officials.length > 0 ? officials[0] : null

        const officers = officials
            .filter(o => o.id !== teamLeaderResource?.id)
            .map(o => ({
                name: o.name,
                rank: o.rank || 'Officer',
                mobile: o.contactNumber || undefined
            }))

        const witnesses = resources
            .filter(r => r.type === 'WITNESS')
            .map(w => ({
                name: w.name,
                mobile: w.contactNumber || undefined,
                address: w.address || w.area || undefined
            }))

        const drivers = resources
            .filter(r => r.type === 'DRIVER')
            .map(d => ({
                name: d.name,
                vehicle: `${d.vehicleType || 'Vehicle'} (${d.vehicleRegNo || 'N/A'})`,
                mobile: d.contactNumber || undefined
            }))

        // Group CRPF teams (conceptually each assigned CRPF *unit* leader represents a team, or just raw list)
        // Here we just list the assigned CRPF resources
        const crpfResources = resources.filter(r => r.type === 'CRPF')
        const crpf = crpfResources.map(c => ({
            leaderName: c.name,
            strength: (c.crpfMaleCount || 0) + (c.crpfFemaleCount || 0)
        }))

        return {
            id: p.id,
            name: p.name,
            address: p.address,
            teamLeader: teamLeaderResource ? {
                name: teamLeaderResource.name,
                rank: teamLeaderResource.rank || 'Officer',
                unit: teamLeaderResource.unit || undefined,
                mobile: teamLeaderResource.contactNumber || undefined
            } : null,
            officers,
            witnesses,
            crpf,
            drivers
        }
    })

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Team Sheets</h2>
                <div className="flex items-center space-x-2">
                    <ExportButton type="auto" searchId={isGlobal ? undefined : searchId} />
                </div>
            </div>
            <TeamSheetsClient data={formattedData} />
        </div>
    )
}
