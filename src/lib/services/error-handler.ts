import { Prisma } from "@prisma/client"
import { ServiceResult } from "./types"

export function handlePrismaError<T>(error: any, operation: string): ServiceResult<T> {
    console.error(`Error during ${operation}:`, error)

    // --- Transient / connection errors (self-recoverable) ---
    if (error instanceof Prisma.PrismaClientInitializationError) {
        return {
            success: false,
            error: "Database connection is starting up. Please try again in a moment."
        }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2024': // Connection pool timeout
                return {
                    success: false,
                    error: "The database is temporarily busy. Please try again in a few seconds."
                }
            case 'P2002':
                return {
                    success: false,
                    error: `A unique constraint was violated. (Field: ${error.meta?.target || 'unknown'})`
                }
            case 'P2025':
                return {
                    success: false,
                    error: "The requested record was not found."
                }
            case 'P2003':
                return {
                    success: false,
                    error: "This operation cannot be completed because of related records."
                }
            case 'P1001': // Can't reach database
            case 'P1002': // Database timed out
            case 'P1008': // Operations timed out
            case 'P1017': // Server closed connection
                return {
                    success: false,
                    error: "Database is temporarily unavailable. Please retry shortly."
                }
        }
    }

    // Connection pool timeout can also appear as a generic error message
    if (error instanceof Error && error.message.includes('connection pool')) {
        return {
            success: false,
            error: "The database is temporarily busy. Please try again in a few seconds."
        }
    }

    return {
        success: false,
        error: `An unexpected database error occurred during ${operation}.`
    }
}
