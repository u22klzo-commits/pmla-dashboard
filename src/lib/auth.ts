import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null
                }

                try {
                    // Check for email or username
                    const user = await prisma.user.findFirst({
                        where: {
                            OR: [
                                { username: credentials.username },
                                { email: credentials.username }
                            ]
                        }
                    })

                    if (!user) {
                        return null
                    }

                    // Secure password comparison
                    const isPasswordValid = await compare(credentials.password, user.passwordHash)

                    if (!isPasswordValid) {
                        return null
                    }

                    // Strict RBAC: Check if user is approved
                    if (!user.isApproved) {
                        throw new Error("Account pending approval. Please contact an administrator.")
                    }

                    return {
                        id: user.id,
                        name: user.username,
                        role: user.role,
                    }
                } catch (error: any) {
                    // Re-throw auth-specific errors (approval pending, etc.)
                    if (error.message?.includes("approval") || error.message?.includes("Account")) {
                        throw error
                    }
                    // DB connection failures → user-friendly message
                    console.error("[Auth] Database error during login:", error.message)
                    throw new Error("Service temporarily unavailable. Please try again shortly.")
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string // Type assertion needed or extending types
            }
            return session
        },
    },
    pages: {
        signIn: '/login', // Custom login page
    },
    session: {
        strategy: "jwt"
    }
}
