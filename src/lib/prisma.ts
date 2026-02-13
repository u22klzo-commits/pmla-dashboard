import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
        datasourceUrl: process.env.POSTGRES_PRISMA_URL,
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// ---------------------------------------------------------------------------
// Retry wrapper for transient DB failures (pool timeout, cold start, etc.)
// ---------------------------------------------------------------------------
const RETRYABLE_ERRORS = new Set([
    'P2024', // Timed out fetching a new connection from the connection pool
    'P1001', // Can't reach database server
    'P1002', // Database server reached but timed out
    'P1008', // Operations timed out
    'P1017', // Server has closed the connection
])

type AsyncFn<T> = () => Promise<T>

/**
 * Retries a Prisma operation on transient failures with exponential backoff.
 * Usage: `const result = await prismaRetry(() => prisma.user.findMany())`
 */
export async function prismaRetry<T>(
    fn: AsyncFn<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 300
): Promise<T> {
    let lastError: unknown

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error

            const isRetryable =
                (error instanceof Prisma.PrismaClientKnownRequestError &&
                    RETRYABLE_ERRORS.has(error.code)) ||
                (error instanceof Prisma.PrismaClientInitializationError) ||
                (error instanceof Error &&
                    error.message.includes('connection pool'))

            if (!isRetryable || attempt === maxRetries) {
                throw error
            }

            // Exponential backoff: 300ms, 600ms, 1200ms
            const delay = baseDelayMs * Math.pow(2, attempt)
            console.warn(
                `[Prisma] Transient error (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`,
                error instanceof Error ? error.message : error
            )
            await new Promise((resolve) => setTimeout(resolve, delay))
        }
    }

    throw lastError
}
