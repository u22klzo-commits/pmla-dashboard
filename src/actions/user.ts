'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hash, compare } from "bcryptjs"
import { Role } from "@prisma/client"

export async function getUserProfileData() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                role: true,
                createdAt: true,
                isApproved: true,
            }
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        return { success: true, data: user }
    } catch (error) {
        console.error("Failed to fetch user profile:", error)
        return { success: false, error: "Internal server error" }
    }
}

export async function updateUserDetails(data: { name?: string; email?: string; username?: string }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        // Check availability if username/email is changed
        if (data.email || data.username) {
            const existing = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: data.email },
                        { username: data.username }
                    ],
                    NOT: { id: session.user.id }
                }
            })
            if (existing) {
                return { success: false, error: "Email or username already in use" }
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: data.name,
                email: data.email,
                username: data.username,
            }
        })

        return { success: true, data: updatedUser }
    } catch (error) {
        console.error("Failed to update user profile:", error)
        return { success: false, error: "Internal server error" }
    }
}

export async function changePassword(currentPassword: string, newPassword: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return { success: false, error: "Not authenticated" }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user) return { success: false, error: "User not found" }

        const isValid = await compare(currentPassword, user.passwordHash)
        if (!isValid) return { success: false, error: "Incorrect current password" }

        const hashedPassword = await hash(newPassword, 12)

        await prisma.user.update({
            where: { id: session.user.id },
            data: { passwordHash: hashedPassword }
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to change password:", error)
        return { success: false, error: "Internal server error" }
    }
}

export async function getProfileStats() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return { success: false, error: "Not authenticated" }

        const [casesCount, searchesCount, premisesCount, completedSearchesCount] = await Promise.all([
            prisma.case.count(),
            prisma.search.count(),
            prisma.premise.count(),
            prisma.search.count({ where: { status: 'COMPLETED' } })
        ])

        return {
            success: true,
            data: {
                casesManaged: casesCount,
                searchesLed: searchesCount,
                premisesSecured: premisesCount,
                alertsHandled: completedSearchesCount
            }
        }
    } catch (error) {
        console.error("Failed to fetch profile stats:", error)
        return { success: false, error: "Internal server error" }
    }
}

// Admin Actions

export async function getAllUsers() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return { success: false, error: "Unauthorized" }
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                role: true,
                isApproved: true,
                createdAt: true
            }
        })

        return { success: true, data: users }
    } catch (error) {
        console.error("Failed to fetch users:", error)
        return { success: false, error: "Internal server error" }
    }
}

export async function updateUserStatus(userId: string, isApproved: boolean) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { isApproved }
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to update user status:", error)
        return { success: false, error: "Internal server error" }
    }
}

export async function updateUserRole(userId: string, role: Role) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role }
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to update user role:", error)
        return { success: false, error: "Internal server error" }
    }
}

export async function createUser(data: any) {
    try {
        const userCount = await prisma.user.count()
        const isFirstUser = userCount === 0

        const session = await getServerSession(authOptions)

        // Allow creation if it's the first user OR if the requester is an ADMIN
        if (!isFirstUser && (!session?.user?.id || session.user.role !== 'ADMIN')) {
            return { success: false, error: "Unauthorized" }
        }

        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: data.email },
                    { username: data.username }
                ]
            }
        })

        if (existing) {
            return { success: false, error: "Email or username already exists" }
        }

        const hashedPassword = await hash(data.password, 12)

        const newUser = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                username: data.username,
                passwordHash: hashedPassword,
                role: isFirstUser ? 'ADMIN' : (data.role || 'VIEWER'),
                isApproved: isFirstUser ? true : true // Admin created users (and first user) are auto-approved
            }
        })

        return { success: true, data: newUser }
    } catch (error) {
        console.error("Failed to create user:", error)
        return { success: false, error: "Internal server error" }
    }
}

export async function deleteUser(userId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return { success: false, error: "Unauthorized" }
        }

        // Prevent deleting self
        if (userId === session.user.id) {
            return { success: false, error: "Cannot delete your own account" }
        }

        // Detach cases from this user so they aren't deleted or orphaned
        // Set ownerId to null so they can be reassigned by Admin later
        await prisma.case.updateMany({
            where: { ownerId: userId },
            data: { ownerId: null }
        })

        await prisma.user.delete({
            where: { id: userId }
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to delete user:", error)
        return { success: false, error: "Internal server error" }
    }
}
