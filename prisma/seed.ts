import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log("Starting Seeding...")

    const hashedAdminPassword = await hash('password123', 12)

    // 1. Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            username: 'admin',
            passwordHash: hashedAdminPassword,
            role: 'ADMIN',
            isApproved: true,
        },
    })
    console.log("Admin user set up.")

    // 2. Clear Simulation Data
    await prisma.resourceAllocation.deleteMany({})
    await prisma.premise.deleteMany({})
    await prisma.search.deleteMany({})
    await prisma.case.deleteMany({})
    await prisma.resource.deleteMany({})
    console.log("Cleared old data.")

    // 3. Create Structured Resources
    const officialData = [
        { name: 'AD Ramesh Gupta', rank: 'AD', designation: 'Assistant Director', unit: 'ED Kolkata', contact: '9876500001', gender: 'MALE' },
        { name: 'EO Priya Singh', rank: 'EO', designation: 'Enforcement Officer', unit: 'ED Kolkata', contact: '9876500002', gender: 'FEMALE' },
        { name: 'ADDL S.K. Roy', rank: 'AD', designation: 'Addl. Director', unit: 'ED Delhi', contact: '9876500003', gender: 'MALE' },
        { name: 'EO Manoj Kumar', rank: 'EO', designation: 'Enforcement Officer', unit: 'ED Kolkata', contact: '9876500004', gender: 'MALE' },
        { name: 'AD Anita Sharma', rank: 'AD', designation: 'Assistant Director', unit: 'ED Kolkata', contact: '9876500009', gender: 'FEMALE' },
        { name: 'AD Vikram Malhotra', rank: 'AD', designation: 'Assistant Director', unit: 'ED Mumbai', contact: '9876500010', gender: 'MALE' },
        { name: 'IO Amit Das', rank: 'INSPECTOR', designation: 'Investigating Officer', unit: 'Local Police', contact: '9876500005', gender: 'MALE' },
        { name: 'AEO Rohit Verma', rank: 'AEO', designation: 'Asst. Enforcement Officer', unit: 'ED Kolkata', contact: '9876500006', gender: 'MALE' },
        { name: 'SI Sneha Patil', rank: 'SI', designation: 'Sub-Inspector', unit: 'Local Police', contact: '9876500007', gender: 'FEMALE' },
        { name: 'SI Arjun Mehra', rank: 'SI', designation: 'Sub-Inspector', unit: 'ED Kolkata', contact: '9876500011', gender: 'MALE' },
        { name: 'AEO Divya Rao', rank: 'AEO', designation: 'Asst. Enforcement Officer', unit: 'ED Chennai', contact: '9876500012', gender: 'FEMALE' },
        { name: 'IO Rahul Khanna', rank: 'INSPECTOR', designation: 'Investigating Officer', unit: 'ED Kolkata', contact: '9876500013', gender: 'MALE' },
    ];

    for (const o of officialData) {
        await prisma.resource.create({
            data: {
                name: o.name,
                type: 'OFFICIAL',
                gender: o.gender as any,
                rank: o.rank as any,
                designation: o.designation,
                unit: o.unit,
                contactNumber: o.contact,
                status: 'AVAILABLE'
            }
        })
    }

    const crpfTeams = [
        { name: 'CRPF Alpha', male: 25, female: 5 },
        { name: 'CRPF Bravo', male: 12, female: 3 },
        { name: 'CRPF Charlie', male: 10, female: 2 },
        { name: 'CRPF Delta', male: 6, female: 2 },
        { name: 'CRPF Echo', male: 5, female: 0 },
        { name: 'CRPF Golf', male: 15, female: 2 },
        { name: 'CRPF Hotel', male: 15, female: 5 },
        { name: 'CRPF India', male: 10, female: 0 },
    ];

    for (const c of crpfTeams) {
        await prisma.resource.create({
            data: {
                name: c.name,
                type: 'CRPF',
                crpfMaleCount: c.male,
                crpfFemaleCount: c.female,
                status: 'AVAILABLE'
            }
        })
    }

    const witnessData = [
        { name: 'Mr. Rajesh Iyer', gender: 'MALE' },
        { name: 'Mr. Sumit Bond', gender: 'MALE' },
        { name: 'Mrs. Kavita Reddy', gender: 'FEMALE' },
        { name: 'Ms. Anjali Gupta', gender: 'FEMALE' },
        { name: 'Mr. Debashis Roy', gender: 'MALE' },
        { name: 'Mr. Vikram Singh', gender: 'MALE' },
        { name: 'Ms. Pooja Batra', gender: 'FEMALE' },
        { name: 'Mr. Amitav Ghosh', gender: 'MALE' },
    ];

    for (const w of witnessData) {
        await prisma.resource.create({
            data: {
                name: w.name,
                type: 'WITNESS',
                gender: w.gender as any,
                address: 'Kolkata Metropolitan Area',
                status: 'AVAILABLE'
            }
        })
    }

    const driverData = [
        { name: 'Driver Ram Singh', vehicle: 'Innova', reg: 'WB-01-A1234' },
        { name: 'Driver Shambhu', vehicle: 'Scorpio', reg: 'WB-02-B5678' },
        { name: 'Driver Karim', vehicle: 'Ertiga', reg: 'WB-06-F1122' },
        { name: 'Driver Satish', vehicle: 'Bolero', reg: 'WB-07-G3344' },
    ];

    for (const d of driverData) {
        await prisma.resource.create({
            data: {
                name: d.name,
                type: 'DRIVER',
                gender: 'MALE',
                vehicleType: d.vehicle,
                vehicleRegNo: d.reg,
                contactNumber: '9000190001',
                status: 'AVAILABLE'
            }
        })
    }

    // 4. Cases & Multiple Searches
    const cases = [
        {
            title: 'G D Mining Case (Kolkata)',
            number: 'ECIR-KOL-2026-667',
            desc: 'Investigation into illegal coal mining and money laundering in West Bengal.',
            searches: [
                { name: 'Kolkata Corporate HQ Raid', date: new Date(), status: 'ACTIVE' },
                { name: 'Asansol Mining Site Audit', date: new Date(Date.now() + 86400000 * 3), status: 'PLANNED' },
                { name: 'Durgapur Warehouse Verification', date: new Date(Date.now() - 86400000 * 2), status: 'COMPLETED' }
            ]
        },
        {
            title: 'Operation Golden Nest',
            number: 'ECIR-KOL-2026-101',
            desc: 'Investigation into cross-border money laundering.',
            searches: [
                { name: 'Kolkata Sector Raid', date: new Date(), status: 'ACTIVE' },
                { name: 'Bongaon Border Check', date: new Date(Date.now() + 86400000 * 2), status: 'PLANNED' },
                { name: 'Central HQ Audit', date: new Date(Date.now() - 86400000 * 5), status: 'COMPLETED' }
            ]
        },
        {
            title: 'Project Blue Diamond',
            number: 'ECIR-DEL-2026-045',
            desc: 'Illegal gems and jewelry trade investigation.',
            searches: [
                { name: 'Jewelry Market Sweep', date: new Date(Date.now() + 86400000 * 7), status: 'PLANNED' },
                { name: 'Warehouse Inspection', date: new Date(Date.now() + 86400000 * 1), status: 'PLANNED' }
            ]
        },
        {
            title: 'Falcon Wing Probe',
            number: 'ECIR-MUM-2026-088',
            desc: 'Aviation sector financial fraud.',
            searches: [
                { name: 'Airport Hangar Audit', date: new Date(), status: 'ACTIVE' },
                { name: 'Offshore Fund Tracking', date: new Date(Date.now() - 86400000 * 10), status: 'COMPLETED' }
            ]
        }
    ];

    // Get all resources to use for allocations later
    const allResources = await prisma.resource.findMany();
    const officials = allResources.filter(r => r.type === 'OFFICIAL');
    const witnesses = allResources.filter(r => r.type === 'WITNESS');
    const drivers = allResources.filter(r => r.type === 'DRIVER');
    const crpf = allResources.filter(r => r.type === 'CRPF');

    const hashedOfficerPassword = await hash('password123', 12)

    // Create a secondary user for transfer testing
    const officer = await prisma.user.upsert({
        where: { email: 'officer@example.com' },
        update: {},
        create: {
            email: 'officer@example.com',
            name: 'Officer John',
            username: 'officer1',
            passwordHash: hashedOfficerPassword,
            role: 'OFFICER',
            isApproved: true,
        },
    })
    console.log("Officer user set up.")

    for (const c of cases) {
        const createdCase = await prisma.case.create({
            data: {
                title: c.title,
                caseNumber: c.number,
                description: c.desc,
                status: 'OPEN',
                ownerId: admin.id // Assign to admin by default
            } as any
        })

        for (const s of c.searches) {
            const search = await prisma.search.create({
                data: {
                    caseId: createdCase.id,
                    name: s.name,
                    date: s.date,
                    status: s.status as any
                }
            })

            // Add premises to EVERY search
            const premiseCount = s.name.includes('HQ') ? 2 : 1;
            for (let i = 0; i < premiseCount; i++) {
                const isResidential = i % 2 === 1 || s.name.includes('Residence');
                const premise = await prisma.premise.create({
                    data: {
                        searchId: search.id,
                        name: `${isResidential ? 'Residential' : 'Office/Commercial'} - ${search.name} ${i + 1}`,
                        address: i === 0 ? 'Sector V, Salt Lake, Kolkata' : 'Ballygunge Circular Road, Kolkata',
                        locationType: 'KOLKATA',
                        nature: isResidential ? 'RESIDENTIAL' : (i === 0 ? 'OFFICE' : 'COMMERCIAL'),
                        recceStatus: s.status === 'COMPLETED' ? 'COMPLETED' : (s.status === 'ACTIVE' ? 'COMPLETED' : 'PENDING'),
                        decisionStatus: s.status === 'COMPLETED' ? 'APPROVED' : (s.status === 'ACTIVE' ? 'APPROVED' : 'PENDING'),
                        requirements: {
                            maleWitness: 2,
                            femaleWitness: isResidential ? 1 : 0,
                            crpfTeamSize: 10,
                            vehicles: 1
                        },
                        gpsLat: 22.5726 + (Math.random() - 0.5) * 0.05,
                        gpsLong: 88.3639 + (Math.random() - 0.5) * 0.05,
                    }
                });

                // 5. Create Allocations for ACTIVE and COMPLETED searches
                if (s.status === 'ACTIVE' || s.status === 'COMPLETED') {
                    // Fetch available resources again to avoid double-assigning
                    const availableOfficials = await prisma.resource.findMany({ where: { type: 'OFFICIAL', status: 'AVAILABLE' } });
                    const availableWitnesses = await prisma.resource.findMany({ where: { type: 'WITNESS', status: 'AVAILABLE' } });
                    const availableCrpf = await prisma.resource.findMany({ where: { type: 'CRPF', status: 'AVAILABLE' } });

                    // Assign 1 Leader (Higher Rank)
                    const leader = availableOfficials.find(o => ['AD', 'EO'].includes(o.rank || ''));
                    if (leader) {
                        await prisma.resourceAllocation.create({
                            data: { premiseId: premise.id, resourceId: leader.id }
                        });
                        if (s.status === 'ACTIVE') {
                            await prisma.resource.update({ where: { id: leader.id }, data: { status: 'ASSIGNED' } });
                        }
                    }

                    // Assign 1-2 more officials
                    const team = availableOfficials.filter(o => o.id !== leader?.id).slice(0, 2);
                    for (const member of team) {
                        await prisma.resourceAllocation.create({
                            data: { premiseId: premise.id, resourceId: member.id }
                        });
                        if (s.status === 'ACTIVE') {
                            await prisma.resource.update({ where: { id: member.id }, data: { status: 'ASSIGNED' } });
                        }
                    }

                    // Assign 1 Witness
                    const witness = availableWitnesses[0];
                    if (witness) {
                        await prisma.resourceAllocation.create({
                            data: { premiseId: premise.id, resourceId: witness.id }
                        });
                        if (s.status === 'ACTIVE') {
                            await prisma.resource.update({ where: { id: witness.id }, data: { status: 'ASSIGNED' } });
                        }
                    }

                    // Assign CRPF
                    const crpfTeam = availableCrpf[0];
                    if (crpfTeam) {
                        await prisma.resourceAllocation.create({
                            data: { premiseId: premise.id, resourceId: crpfTeam.id }
                        });
                        if (s.status === 'ACTIVE') {
                            await prisma.resource.update({ where: { id: crpfTeam.id }, data: { status: 'ASSIGNED' } });
                        }
                    }
                }
            }
        }
    }

    console.log('Seeding Complete.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
