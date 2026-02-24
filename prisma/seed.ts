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

    const hashedOfficerPassword = await hash('password123', 12)
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

    // 2. Clear previous data
    await prisma.resourceAllocation.deleteMany({})
    await prisma.premise.deleteMany({})
    await prisma.resource.deleteMany({})
    await prisma.search.deleteMany({})
    await prisma.case.deleteMany({})
    console.log("Cleared old data.")

    // 3. Cases & Searches
    const casesData = [
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
            desc: 'Investigation into cross-border money laundering via shell companies.',
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
            desc: 'Aviation sector financial fraud and diversion of funds.',
            searches: [
                { name: 'Airport Hangar Audit', date: new Date(), status: 'ACTIVE' },
                { name: 'Offshore Fund Tracking', date: new Date(Date.now() - 86400000 * 10), status: 'COMPLETED' }
            ]
        }
    ];

    // Create all cases and searches first
    const searchRecords: { search: any; caseTitle: string; status: string }[] = [];

    for (const c of casesData) {
        const createdCase = await prisma.case.create({
            data: {
                title: c.title,
                caseNumber: c.number,
                description: c.desc,
                status: 'OPEN',
                ownerId: admin.id,
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
            searchRecords.push({ search, caseTitle: c.title, status: s.status });
        }
    }
    console.log(`Created ${searchRecords.length} searches across ${casesData.length} cases.`)

    // 4. Create Resources linked to active/completed searches
    const activeSearches = searchRecords.filter(sr => sr.status === 'ACTIVE' || sr.status === 'COMPLETED');

    // Officials — Spread across searches
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

    const createdOfficials = [];
    for (let i = 0; i < officialData.length; i++) {
        const o = officialData[i];
        const searchId = activeSearches[i % activeSearches.length].search.id;
        const official = await prisma.resource.create({
            data: {
                name: o.name,
                type: 'OFFICIAL',
                gender: o.gender as any,
                rank: o.rank as any,
                designation: o.designation,
                unit: o.unit,
                contactNumber: o.contact,
                idType: 'AADHAAR',
                idNumber: `${100000000000 + i}`,
                address: 'ED Office, CGO Complex, Kolkata',
                area: 'Salt Lake',
                remarks: 'Verified Official',
                status: 'AVAILABLE',
                searchId,
            }
        })
        createdOfficials.push(official);
    }
    console.log(`Created ${createdOfficials.length} officials.`)

    // CRPF teams
    const crpfTeams = [
        { name: 'CRPF Alpha Coy', male: 25, female: 5 },
        { name: 'CRPF Bravo Coy', male: 12, female: 3 },
        { name: 'CRPF Charlie Coy', male: 10, female: 2 },
        { name: 'CRPF Delta Coy', male: 6, female: 2 },
        { name: 'CRPF Echo Coy', male: 5, female: 0 },
        { name: 'CRPF Golf Coy', male: 15, female: 2 },
        { name: 'CRPF Hotel Coy', male: 15, female: 5 },
        { name: 'CRPF India Coy', male: 10, female: 0 },
    ];

    const createdCrpf = [];
    for (let i = 0; i < crpfTeams.length; i++) {
        const c = crpfTeams[i];
        const searchId = activeSearches[i % activeSearches.length].search.id;
        const crpfResource = await prisma.resource.create({
            data: {
                name: c.name,
                type: 'CRPF',
                crpfMaleCount: c.male,
                crpfFemaleCount: c.female,
                unit: 'CRPF 105 Battalion, Rajarhat',
                contactNumber: `90001${String(i + 1).padStart(5, '0')}`,
                address: 'CRPF Camp, Rajarhat, Kolkata',
                area: 'Rajarhat',
                remarks: 'Ready for deployment',
                status: 'AVAILABLE',
                searchId,
            }
        })
        createdCrpf.push(crpfResource);
    }
    console.log(`Created ${createdCrpf.length} CRPF teams.`)

    // Witnesses — unique contact details
    const witnessData = [
        { name: 'Mr. Rajesh Iyer', gender: 'MALE', contact: '9800100001', address: '45, Lake Town, Kolkata', idNum: 'WB/VID/001' },
        { name: 'Mr. Sumit Bond', gender: 'MALE', contact: '9800100002', address: '12, Gariahat Road, Kolkata', idNum: 'WB/VID/002' },
        { name: 'Mrs. Kavita Reddy', gender: 'FEMALE', contact: '9800100003', address: '78, Jadavpur, Kolkata', idNum: 'WB/VID/003' },
        { name: 'Ms. Anjali Gupta', gender: 'FEMALE', contact: '9800100004', address: '3, New Town, Kolkata', idNum: 'WB/VID/004' },
        { name: 'Mr. Debashis Roy', gender: 'MALE', contact: '9800100005', address: '22, Behala, Kolkata', idNum: 'WB/VID/005' },
        { name: 'Mr. Vikram Singh', gender: 'MALE', contact: '9800100006', address: '9, Alipore, Kolkata', idNum: 'WB/VID/006' },
        { name: 'Ms. Pooja Batra', gender: 'FEMALE', contact: '9800100007', address: '56, Dum Dum, Kolkata', idNum: 'WB/VID/007' },
        { name: 'Mr. Amitav Ghosh', gender: 'MALE', contact: '9800100008', address: '34, Barrackpore, Kolkata', idNum: 'WB/VID/008' },
        { name: 'Mr. Shyam Prasad', gender: 'MALE', contact: '9800100009', address: '18, Tollygunge, Kolkata', idNum: 'WB/VID/009' },
        { name: 'Mrs. Sunita Devi', gender: 'FEMALE', contact: '9800100010', address: '67, Howrah, West Bengal', idNum: 'WB/VID/010' },
    ];

    const createdWitnesses = [];
    for (let i = 0; i < witnessData.length; i++) {
        const w = witnessData[i];
        const searchId = activeSearches[i % activeSearches.length].search.id;
        const witness = await prisma.resource.create({
            data: {
                name: w.name,
                type: 'WITNESS',
                gender: w.gender as any,
                address: w.address,
                contactNumber: w.contact,
                idType: 'VOTER_ID',
                idNumber: w.idNum,
                area: 'Kolkata',
                remarks: `Father: N/A | Available for search duty`,
                status: 'AVAILABLE',
                searchId,
            }
        })
        createdWitnesses.push(witness);
    }
    console.log(`Created ${createdWitnesses.length} witnesses.`)

    // Drivers — unique vehicles, contacts, license numbers
    const driverData = [
        { name: 'Ram Singh', vehicle: 'Innova Crysta', reg: 'WB-01-AA-1234', contact: '9700200001', license: 'WB01 2024 0001001' },
        { name: 'Shambhu Nath', vehicle: 'Mahindra Scorpio', reg: 'WB-02-BB-5678', contact: '9700200002', license: 'WB02 2023 0002002' },
        { name: 'Karim Sheikh', vehicle: 'Maruti Ertiga', reg: 'WB-06-FF-1122', contact: '9700200003', license: 'WB06 2022 0003003' },
        { name: 'Satish Mondal', vehicle: 'Mahindra Bolero', reg: 'WB-07-GG-3344', contact: '9700200004', license: 'WB07 2024 0004004' },
        { name: 'Tapas Sarkar', vehicle: 'Tata Sumo', reg: 'WB-03-CC-9900', contact: '9700200005', license: 'WB03 2023 0005005' },
        { name: 'Biswajit Das', vehicle: 'Toyota Fortuner', reg: 'WB-04-DD-7788', contact: '9700200006', license: 'WB04 2024 0006006' },
    ];

    const createdDrivers = [];
    for (let i = 0; i < driverData.length; i++) {
        const d = driverData[i];
        const searchId = activeSearches[i % activeSearches.length].search.id;
        const driver = await prisma.resource.create({
            data: {
                name: d.name,
                type: 'DRIVER',
                gender: 'MALE',
                vehicleType: d.vehicle,
                vehicleRegNo: d.reg,
                contactNumber: d.contact,
                licenseNumber: d.license,
                idType: 'PAN',
                idNumber: `ABCDE${1000 + i}F`,
                address: 'Kolkata, West Bengal',
                area: 'Kolkata',
                remarks: 'Vehicle Owner: Self',
                status: 'AVAILABLE',
                searchId,
            }
        })
        createdDrivers.push(driver);
    }
    console.log(`Created ${createdDrivers.length} drivers.`)

    // 5. Create premises and allocations
    const premiseNames = [
        ['Office of M/s Shell Corp Ltd.', 'Residence of A. Roy'],
        ['Godown - Park Street', 'Flat of D. Mukherjee'],
        ['Workshop - Rajarhat', null],
        ['Office of ABC Trading Co.', 'House of P. Kumar'],
        ['Factory - Howrah', null],
        ['Jewel House - Bowbazar', null],
        ['Hangar Office - Airport', 'Residence of S. Ghosh'],
        ['Offshore Holdings Office', null],
    ];

    const kolkataLocations = [
        { area: 'Sector V, Salt Lake', lat: 22.5726, lng: 88.4340 },
        { area: '14A, Ballygunge Circular Rd', lat: 22.5254, lng: 88.3639 },
        { area: '78, Park Street', lat: 22.5513, lng: 88.3554 },
        { area: 'Rajarhat Action Area II', lat: 22.5932, lng: 88.4847 },
        { area: '12, Howrah Maidan', lat: 22.5847, lng: 88.3245 },
        { area: '56, Bowbazar Lane', lat: 22.5679, lng: 88.3561 },
        { area: 'NSCBI Airport Complex', lat: 22.6547, lng: 88.4467 },
        { area: '3, Strand Road, BBD Bagh', lat: 22.5720, lng: 88.3470 },
    ];

    let premiseIndex = 0;
    let officialIdx = 0;
    let witnessIdx = 0;
    let crpfIdx = 0;
    let driverIdx = 0;

    for (const sr of searchRecords) {
        const isActiveOrComplete = sr.status === 'ACTIVE' || sr.status === 'COMPLETED';
        const premiseCount = sr.search.name.includes('HQ') || sr.search.name.includes('Raid') ? 2 : 1;

        for (let i = 0; i < premiseCount; i++) {
            const nameData = premiseNames[premiseIndex % premiseNames.length];
            const locData = kolkataLocations[premiseIndex % kolkataLocations.length];
            const isResidential = i === 1;
            const premiseName = (isResidential && nameData[1]) ? nameData[1] : (nameData[0] || `Premise ${premiseIndex + 1}`);

            const premise = await prisma.premise.create({
                data: {
                    searchId: sr.search.id,
                    name: premiseName,
                    address: locData.area + ', Kolkata, West Bengal',
                    locationType: premiseIndex % 5 === 4 ? 'OUTSIDE' : 'KOLKATA',
                    nature: isResidential ? 'RESIDENTIAL' : (i === 0 && premiseIndex % 3 === 0 ? 'COMMERCIAL' : (premiseIndex % 4 === 2 ? 'INDUSTRIAL' : 'OFFICE')),
                    occupantName: isResidential ? 'Mr. Suspect Person' : 'M/s Shell Company Ltd.',
                    mobileNumber: `98765${String(premiseIndex).padStart(5, '0')}`,
                    sourceOfInfo: (['INFORMER', 'COMPLAINT', 'INTELLIGENCE', 'OTHER'] as const)[premiseIndex % 4],
                    recceStatus: sr.status === 'COMPLETED' ? 'COMPLETED' : (sr.status === 'ACTIVE' ? 'COMPLETED' : 'PENDING'),
                    recceNotes: sr.status !== 'PLANNED' ? 'Premise verified and accessible. Multiple entry/exit points identified. Cooperation expected.' : null,
                    decisionStatus: sr.status === 'COMPLETED' ? 'APPROVED' : (sr.status === 'ACTIVE' ? 'APPROVED' : 'PENDING'),
                    allocationStatus: isActiveOrComplete ? 'DONE' : 'PENDING',
                    requirements: {
                        maleWitness: 2,
                        femaleWitness: isResidential ? 1 : 0,
                        crpfTeamSize: 10,
                        vehicles: 1
                    },
                    gpsLat: locData.lat + (Math.random() - 0.5) * 0.01,
                    gpsLong: locData.lng + (Math.random() - 0.5) * 0.01,
                    distanceFromCrpfCamp: parseFloat((3 + Math.random() * 12).toFixed(1)),
                    liveLocationUrl1: `https://www.google.com/maps?q=${locData.lat},${locData.lng}`,
                    liveLocationUrl2: `https://maps.apple.com/?ll=${locData.lat},${locData.lng}`,
                    photoUrl: null,
                }
            });

            // Allocations for Active/Completed searches
            if (isActiveOrComplete) {
                // Team Leader (highest rank official)
                const leader = createdOfficials[officialIdx % createdOfficials.length];
                officialIdx++;
                await prisma.resourceAllocation.create({
                    data: { premiseId: premise.id, resourceId: leader.id }
                });
                if (sr.status === 'ACTIVE') {
                    await prisma.resource.update({ where: { id: leader.id }, data: { status: 'ASSIGNED' } });
                }

                // 1-2 more officers
                const teamSize = premiseCount > 1 ? 2 : 1;
                for (let j = 0; j < teamSize; j++) {
                    const member = createdOfficials[officialIdx % createdOfficials.length];
                    officialIdx++;
                    await prisma.resourceAllocation.create({
                        data: { premiseId: premise.id, resourceId: member.id }
                    });
                    if (sr.status === 'ACTIVE') {
                        await prisma.resource.update({ where: { id: member.id }, data: { status: 'ASSIGNED' } });
                    }
                }

                // 2 Witnesses
                for (let j = 0; j < 2; j++) {
                    const witness = createdWitnesses[witnessIdx % createdWitnesses.length];
                    witnessIdx++;
                    await prisma.resourceAllocation.create({
                        data: { premiseId: premise.id, resourceId: witness.id }
                    });
                    if (sr.status === 'ACTIVE') {
                        await prisma.resource.update({ where: { id: witness.id }, data: { status: 'ASSIGNED' } });
                    }
                }

                // 1 CRPF team
                const crpfTeam = createdCrpf[crpfIdx % createdCrpf.length];
                crpfIdx++;
                await prisma.resourceAllocation.create({
                    data: { premiseId: premise.id, resourceId: crpfTeam.id }
                });
                if (sr.status === 'ACTIVE') {
                    await prisma.resource.update({ where: { id: crpfTeam.id }, data: { status: 'ASSIGNED' } });
                }

                // 1 Driver
                const driver = createdDrivers[driverIdx % createdDrivers.length];
                driverIdx++;
                await prisma.resourceAllocation.create({
                    data: { premiseId: premise.id, resourceId: driver.id }
                });
                if (sr.status === 'ACTIVE') {
                    await prisma.resource.update({ where: { id: driver.id }, data: { status: 'ASSIGNED' } });
                }
            }

            premiseIndex++;
        }
    }

    console.log(`Created ${premiseIndex} premises with allocations.`)
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
