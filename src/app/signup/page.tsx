"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
    const router = useRouter()
    const [form, setForm] = useState({ name: "", username: "", email: "", password: "" })
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        setLoading(true)

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Signup failed.")
            } else {
                setSuccess(data.message)
                setTimeout(() => router.push("/login"), 3000)
            }
        } catch {
            setError("Network error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-950">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>Sign up to request access to the dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" value={form.username} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={form.email} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        {success && <p className="text-green-600 text-sm">{success}</p>}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating account..." : "Sign Up"}
                        </Button>
                    </form>

                    <p className="text-sm text-center text-muted-foreground mt-4">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary underline hover:no-underline">
                            Log in
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
