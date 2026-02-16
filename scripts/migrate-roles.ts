
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting role migration...')

    // 1. Downgrade existing OFFICERs to VIEWER
    const officers = await prisma.user.updateMany({
        where: { role: 'OFFICER' },
        data: { role: 'VIEWER' }
    })
    console.log(`Downgraded ${officers.count} 'OFFICER' users to 'VIEWER'.`)

    // 2. Migrate existing COMMANDERs to OFFICER
    const commanders = await prisma.user.updateMany({
        where: { role: 'COMMANDER' },
        data: { role: 'OFFICER' }
    })
    console.log(`Migrated ${commanders.count} 'COMMANDER' users to 'OFFICER'.`)

    console.log('Migration complete.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
