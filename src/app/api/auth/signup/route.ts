import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(req: NextRequest) {
    try {
        const { name, username, email, password } = await req.json()

        // Validate required fields
        if (!name || !username || !email || !password) {
            return NextResponse.json(
                { error: "All fields are required." },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters." },
                { status: 400 }
            )
        }

        // Check if username or email already exists
        const existing = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        })

        if (existing) {
            return NextResponse.json(
                { error: "Username or email already exists." },
                { status: 409 }
            )
        }

        // Create user (not approved by default — admin must approve)
        const passwordHash = await hash(password, 12)
        await prisma.user.create({
            data: {
                name,
                username,
                email,
                passwordHash,
                role: "VIEWER",
                isApproved: false,
            },
        })

        return NextResponse.json(
            { message: "Account created. An administrator must approve your account before you can log in." },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("[Signup] Error:", error.message)
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        )
    }
}
