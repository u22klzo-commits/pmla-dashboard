import { prisma } from "@/lib/prisma"
import { ResourceType, Gender } from "@prisma/client"
import { handlePrismaError } from "./error-handler"
import { ServiceResult } from "./types"

export class AllocationService {

    /**
     * Suggests resources for a premise based on its requirements and current assignments.
     */
    static async suggestAllocation(premiseId: string): Promise<ServiceResult<{ suggestedIds: string[], warnings: string[] }>> {
        try {
            const premise = await prisma.premise.findUnique({
                where: { id: premiseId },
                include: {
                    assignedResources: { include: { resource: true } }
                }
            })

            if (!premise || !(premise as any).requirements) {
                return { success: false, error: "Premise or requirements not found" }
            }

            const requirements = (premise as any).requirements

            // Filter out DEPLOYED or UNAVAILABLE resources generally, and ensure they belong to the same search
            const availableResources = await prisma.resource.findMany({
                where: {
                    status: 'AVAILABLE',
                    searchId: premise.searchId
                } as any
            })

            const suggestedIds: string[] = []
            const usedResourceIds = new Set<string>()

            // Helper to grab resources
            const grabResources = (type: ResourceType, count: number, gender?: Gender) => {
                const candidates = availableResources.filter(r =>
                    r.type === type &&
                    (!gender || r.gender === gender) &&
                    !usedResourceIds.has(r.id)
                )

                // Simplistic greedy selection
                for (let i = 0; i < count && i < candidates.length; i++) {
                    suggestedIds.push(candidates[i].id)
                    usedResourceIds.add(candidates[i].id)
                }
            }

            const assigned = premise.assignedResources.map(ar => ar.resource)

            // 1. Witnesses
            const existingWitnessCount = assigned.filter(r => r.type === 'WITNESS').length

            const neededMaleWitness = Math.max(0, (requirements.maleWitness || 0) - assigned.filter(r => r.type === 'WITNESS' && r.gender === Gender.MALE).length)
            if (neededMaleWitness > 0) grabResources('WITNESS', neededMaleWitness, Gender.MALE)

            const neededFemaleWitness = Math.max(0, (requirements.femaleWitness || 0) - assigned.filter(r => r.type === 'WITNESS' && r.gender === Gender.FEMALE).length)
            if (neededFemaleWitness > 0) grabResources('WITNESS', neededFemaleWitness, Gender.FEMALE)

            // Ensure minimum 2 witnesses total (Existing + Suggested)
            const totalWitnessSoFar = existingWitnessCount + suggestedIds.filter(id => {
                const res = availableResources.find(r => r.id === id)
                return res?.type === 'WITNESS'
            }).length

            if (totalWitnessSoFar < 2) {
                grabResources('WITNESS', 2 - totalWitnessSoFar)
            }

            // 2. Drivers
            const existingDriverCount = assigned.filter(r => r.type === 'DRIVER').length
            if ((requirements.vehicles || 0) > existingDriverCount) {
                grabResources('DRIVER', (requirements.vehicles || 0) - existingDriverCount)
            }

            // 3. CRPF
            const reqCrpfMale = requirements.crpfMaleCount || 0
            const reqCrpfFemale = requirements.crpfFemaleCount || 0
            const reqCrpfTotal = requirements.crpfTeamSize || (reqCrpfMale + reqCrpfFemale)

            const crpfCandidates = availableResources.filter(r =>
                r.type === 'CRPF' && !usedResourceIds.has(r.id)
            ).sort((a, b) => {
                const totalA = ((a as any).crpfMaleCount || 0) + ((a as any).crpfFemaleCount || 0)
                const totalB = ((b as any).crpfMaleCount || 0) + ((b as any).crpfFemaleCount || 0)
                return totalA - totalB
            })

            // Initialize with EXISTING assignments
            let currentCrpfMale = assigned.filter(r => r.type === 'CRPF').reduce((sum, r) => sum + ((r as any).crpfMaleCount || 0), 0)
            let currentCrpfFemale = assigned.filter(r => r.type === 'CRPF').reduce((sum, r) => sum + ((r as any).crpfFemaleCount || 0), 0)
            let currentCrpfTotal = currentCrpfMale + currentCrpfFemale

            const remainingMale = Math.max(0, reqCrpfMale - currentCrpfMale)
            const remainingFemale = Math.max(0, reqCrpfFemale - currentCrpfFemale)
            const remainingTotal = Math.max(0, reqCrpfTotal - currentCrpfTotal)

            if (remainingMale > 0 || remainingFemale > 0 || remainingTotal > 0) {
                // Check for a single perfect/sufficient match
                const sufficientSingle = crpfCandidates.filter(r => {
                    const m = (r as any).crpfMaleCount || 0
                    const f = (r as any).crpfFemaleCount || 0
                    return m >= remainingMale && f >= remainingFemale && (m + f) >= remainingTotal
                }).sort((a, b) => {
                    // Sort by total size ASCENDING to pick the smallest sufficient one
                    const totalA = ((a as any).crpfMaleCount || 0) + ((a as any).crpfFemaleCount || 0)
                    const totalB = ((b as any).crpfMaleCount || 0) + ((b as any).crpfFemaleCount || 0)
                    return totalA - totalB
                })

                if (sufficientSingle.length > 0) {
                    suggestedIds.push(sufficientSingle[0].id)
                    usedResourceIds.add(sufficientSingle[0].id)
                } else {
                    // Fallback: Accumulate smallest resources
                    // Re-sort candidates by size (ASC) to minimize overshoot
                    crpfCandidates.sort((a, b) => {
                        const totalA = ((a as any).crpfMaleCount || 0) + ((a as any).crpfFemaleCount || 0)
                        const totalB = ((b as any).crpfMaleCount || 0) + ((b as any).crpfFemaleCount || 0)
                        return totalA - totalB
                    })

                    for (const r of crpfCandidates) {
                        const maleSatisfied = (reqCrpfMale === 0) || (currentCrpfMale >= reqCrpfMale)
                        const femaleSatisfied = (reqCrpfFemale === 0) || (currentCrpfFemale >= reqCrpfFemale)
                        const totalSatisfied = currentCrpfTotal >= reqCrpfTotal

                        if (maleSatisfied && femaleSatisfied && totalSatisfied) {
                            break
                        }

                        suggestedIds.push(r.id)
                        usedResourceIds.add(r.id)

                        const mCount = (r as any).crpfMaleCount || 0
                        const fCount = (r as any).crpfFemaleCount || 0

                        currentCrpfMale += mCount
                        currentCrpfFemale += fCount
                        currentCrpfTotal += (mCount + fCount)
                    }
                }
            }

            // 4. Officers (Heuristic: 1 Team Leader + 1 Support)
            const assignedOfficials = assigned.filter(r => r.type === 'OFFICIAL')
            const alreadyHasLeader = assignedOfficials.some(r =>
                ['EO', 'AD'].includes((r as any).rank || '')
            )
            const currentOfficialCount = assignedOfficials.length

            // A. Team Leader (EO or higher) - Only if we don't have one
            if (!alreadyHasLeader) {
                const teamLeaders = availableResources.filter(r =>
                    r.type === 'OFFICIAL' &&
                    ['EO', 'AD'].includes((r as any).rank || '') &&
                    !usedResourceIds.has(r.id)
                );

                if (teamLeaders.length > 0) {
                    suggestedIds.push(teamLeaders[0].id)
                    usedResourceIds.add(teamLeaders[0].id)
                }
            }

            // B. Support Officer (Any other officer) - Aim for 2 total officers
            const suggestedOfficialsCount = availableResources.filter(r => suggestedIds.includes(r.id) && r.type === 'OFFICIAL').length
            const totalOfficialsIncludingSuggestions = currentOfficialCount + suggestedOfficialsCount

            if (totalOfficialsIncludingSuggestions < 2) {
                const neededSupport = 2 - totalOfficialsIncludingSuggestions
                const supportOfficers = availableResources.filter(r =>
                    r.type === 'OFFICIAL' &&
                    !usedResourceIds.has(r.id)
                );

                for (let i = 0; i < Math.min(neededSupport, supportOfficers.length); i++) {
                    suggestedIds.push(supportOfficers[i].id)
                    usedResourceIds.add(supportOfficers[i].id)
                }
            }

            // 5. Residential Safety Check
            if (premise.nature === 'RESIDENTIAL') {
                const suggestedResources = availableResources.filter(r => suggestedIds.includes(r.id))
                const hasFemale = suggestedResources.some(r => r.gender === Gender.FEMALE)
                    || (currentCrpfFemale > 0)

                if (!hasFemale) {
                    const femaleCandidate = availableResources.find(r =>
                        r.gender === Gender.FEMALE && !usedResourceIds.has(r.id) &&
                        (r.type === 'WITNESS' || r.type === 'OFFICIAL')
                    )

                    if (femaleCandidate) {
                        suggestedIds.push(femaleCandidate.id)
                        usedResourceIds.add(femaleCandidate.id)
                    }
                }
            }

            // VALIDATION & WARNINGS
            const warnings: string[] = []
            const finalResources = availableResources.filter(r => suggestedIds.includes(r.id))

            const countWitness = finalResources.filter(r => r.type === 'WITNESS').length
            const reqWitnessTotal = (requirements.maleWitness || 0) + (requirements.femaleWitness || 0)
            const targetWitnessTotal = Math.max(reqWitnessTotal, 2)

            if (countWitness < targetWitnessTotal) warnings.push(`Short by ${targetWitnessTotal - countWitness} Witnesses (Minimum 2)`)

            const countDriver = finalResources.filter(r => r.type === 'DRIVER').length
            const reqDriver = requirements.vehicles || 0
            if (countDriver < reqDriver) warnings.push(`Short by ${reqDriver - countDriver} Drivers`)

            const countCrpfHumans = finalResources
                .filter(r => r.type === 'CRPF')
                .reduce((sum, r) => sum + ((r as any).crpfMaleCount || 0) + ((r as any).crpfFemaleCount || 0), 0)

            if (countCrpfHumans < reqCrpfTotal) warnings.push(`Short by ${reqCrpfTotal - countCrpfHumans} CRPF personnel`)

            return { success: true, data: { suggestedIds, warnings } }

        } catch (error) {
            return handlePrismaError(error, "suggest resources")
        }
    }

    /**
     * Automatically assigns resources to all approved premises.
     */
    static async autoAssignAllPremises(): Promise<ServiceResult<{ count: number }>> {
        try {
            // 1. Fetch data
            const premises = await prisma.premise.findMany({
                where: { decisionStatus: 'APPROVED' },
                include: { assignedResources: { include: { resource: true } } }
            });

            if (premises.length === 0) {
                return { success: false, error: "No approved premises found for assignment." };
            }

            let availablePool = await prisma.resource.findMany({
                where: { status: 'AVAILABLE' }
            });

            const globallyAssignedIds = new Set<string>();
            const allAssignments: { premiseId: string; resourceId: string }[] = [];

            // Helper to perform assignment in logic
            const assign = (premiseId: string, resourceId: string) => {
                if (globallyAssignedIds.has(resourceId)) return false;
                globallyAssignedIds.add(resourceId);
                allAssignments.push({ premiseId, resourceId });
                return true;
            };

            // --- PASS 1: Essential Leadership (1 Leader per Unit) ---
            for (const premise of premises) {
                const assigned = premise.assignedResources.map(ar => ar.resource);
                const hasLeader = assigned.some(r =>
                    r.type === 'OFFICIAL' && ['AD', 'EO'].includes(r.rank || '')
                );

                if (!hasLeader) {
                    const leader = availablePool.find(r =>
                        r.type === 'OFFICIAL' &&
                        ['AD', 'EO'].includes(r.rank || '') &&
                        !globallyAssignedIds.has(r.id)
                    );
                    if (leader) assign(premise.id, leader.id);
                }
            }

            // --- PASS 2: Residential Gender Compliance ---
            for (const premise of premises) {
                if (premise.nature !== 'RESIDENTIAL') continue;

                const currentResources = [
                    ...premise.assignedResources.map(ar => ar.resource),
                    ...availablePool.filter(r => allAssignments.some(a => a.premiseId === premise.id && a.resourceId === r.id))
                ];

                const hasFemale = currentResources.some(r =>
                    r.gender === 'FEMALE' || (r.type === 'CRPF' && ((r as any).crpfFemaleCount || 0) > 0)
                );

                if (!hasFemale) {
                    const female = availablePool.find(r =>
                        r.gender === 'FEMALE' &&
                        !globallyAssignedIds.has(r.id) &&
                        (r.type === 'OFFICIAL' || r.type === 'WITNESS')
                    );
                    if (female) assign(premise.id, female.id);
                }
            }

            // --- PASS 3: CRPF Matching (Intelligence Fit) ---
            const sortedForCrpf = [...premises].sort((a, b) => {
                const reqA = (a as any).requirements?.crpfTeamSize || 0;
                const reqB = (b as any).requirements?.crpfTeamSize || 0;
                return reqB - reqA;
            });

            for (const premise of sortedForCrpf) {
                const requirements = (premise as any).requirements || {};
                const reqCrpfTotal = requirements.crpfTeamSize || 0;
                if (reqCrpfTotal === 0) continue;

                const existingBatch = allAssignments.filter(a => a.premiseId === premise.id)
                    .map(a => availablePool.find(r => r.id === a.resourceId))
                    .filter(r => r?.type === 'CRPF');

                const existingAssigned = premise.assignedResources.map(ar => ar.resource).filter(r => r.type === 'CRPF');

                let currentStrength = [...existingAssigned, ...existingBatch].reduce((sum, r) =>
                    sum + ((r as any).crpfMaleCount || 0) + ((r as any).crpfFemaleCount || 0), 0
                );

                while (currentStrength < reqCrpfTotal) {
                    const gap = reqCrpfTotal - currentStrength;
                    const bestFit = availablePool
                        .filter(r => r.type === 'CRPF' && !globallyAssignedIds.has(r.id))
                        .sort((a, b) => {
                            const sizeA = ((a as any).crpfMaleCount || 0) + ((a as any).crpfFemaleCount || 0);
                            const sizeB = ((b as any).crpfMaleCount || 0) + ((b as any).crpfFemaleCount || 0);
                            const diffA = Math.abs(sizeA - gap);
                            const diffB = Math.abs(sizeB - gap);
                            if (diffA !== diffB) return diffA - diffB;
                            return sizeB - sizeA;
                        })[0];

                    if (!bestFit) break;
                    assign(premise.id, bestFit.id);
                    currentStrength += ((bestFit as any).crpfMaleCount || 0) + ((bestFit as any).crpfFemaleCount || 0);
                }
            }

            // --- PASS 4: Drivers & Witnesses ---
            for (const premise of premises) {
                const requirements = (premise as any).requirements || {};
                const assigned = [
                    ...premise.assignedResources.map(ar => ar.resource),
                    ...availablePool.filter(r => allAssignments.some(a => a.premiseId === premise.id && a.resourceId === r.id))
                ];

                // Drivers
                const neededDrivers = Math.max(0, (requirements.vehicles || 0) - assigned.filter(r => r.type === 'DRIVER').length);
                for (let i = 0; i < neededDrivers; i++) {
                    const driver = availablePool.find(r => r.type === 'DRIVER' && !globallyAssignedIds.has(r.id));
                    if (driver) assign(premise.id, driver.id);
                }

                // Witnesses
                const maleWitnessReq = requirements.maleWitness || 0;
                const femaleWitnessReq = requirements.femaleWitness || 0;

                const currentMaleWitness = assigned.filter(r => r.type === 'WITNESS' && r.gender === 'MALE').length;
                const currentFemaleWitness = assigned.filter(r => r.type === 'WITNESS' && r.gender === 'FEMALE').length;

                for (let i = 0; i < Math.max(0, maleWitnessReq - currentMaleWitness); i++) {
                    const w = availablePool.find(r => r.type === 'WITNESS' && r.gender === 'MALE' && !globallyAssignedIds.has(r.id));
                    if (w) assign(premise.id, w.id);
                }
                for (let i = 0; i < Math.max(0, femaleWitnessReq - currentFemaleWitness); i++) {
                    const w = availablePool.find(r => r.type === 'WITNESS' && r.gender === 'FEMALE' && !globallyAssignedIds.has(r.id));
                    if (w) assign(premise.id, w.id);
                }
            }

            // --- PASS 5: Support Officers Fill ---
            for (const premise of premises) {
                const assignedCount = [
                    ...premise.assignedResources.map(ar => ar.resource),
                    ...availablePool.filter(r => allAssignments.some(a => a.premiseId === premise.id && a.resourceId === r.id))
                ].filter(r => r.type === 'OFFICIAL').length;

                let gap = 2 - assignedCount;
                while (gap > 0) {
                    const officer = availablePool.find(r => r.type === 'OFFICIAL' && !globallyAssignedIds.has(r.id));
                    if (officer) {
                        assign(premise.id, officer.id);
                        gap--;
                    } else break;
                }
            }

            // 6. Persistence
            if (allAssignments.length > 0) {
                await prisma.$transaction([
                    prisma.resourceAllocation.createMany({ data: allAssignments }),
                    prisma.resource.updateMany({
                        where: { id: { in: Array.from(globallyAssignedIds) } },
                        data: { status: 'ASSIGNED' }
                    })
                ]);
            }

            return { success: true, data: { count: allAssignments.length } };

        } catch (error) {
            return handlePrismaError(error, "bulk auto assign premises")
        }
    }
}
