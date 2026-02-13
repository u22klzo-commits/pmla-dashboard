"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTacticalTheme, Theme } from "@/components/providers/theme-provider"
import {
    getUserProfileData,
    updateUserDetails,
    getProfileStats,
    getAllUsers,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    changePassword,
    createUser
} from "@/actions/user"
import { getCases, assignCaseOwner } from "@/actions/cases"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import {
    User,
    Mail,
    Shield,
    Activity,
    Settings,
    Zap,
    Calendar,
    Clock,
    Target,
    CheckCircle2,
    AlertCircle,
    Key,
    UserMinus,
    Users,
    Trash2,
    Check,
    X,
    Briefcase
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/dashboard/export-button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const { theme, setTheme } = useTacticalTheme()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [userData, setUserData] = useState<any>(null)
    const [stats, setStats] = useState<any>(null)
    const [saving, setSaving] = useState(false)

    // Admin State
    const [users, setUsers] = useState<any[]>([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
    const [newUser, setNewUser] = useState({ name: "", email: "", username: "", password: "", role: "VIEWER" })
    const [creatingUser, setCreatingUser] = useState(false)

    // Password State
    const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" })
    const [changingPassword, setChangingPassword] = useState(false)

    // UI Preferences State
    const [preferences, setPreferences] = useState({
        haptic: false,
        themeSync: true,
        autoRefresh: true
    })

    // Case Management State
    const [cases, setCases] = useState<any[]>([])
    const [manageCasesUser, setManageCasesUser] = useState<any>(null)
    const [selectedCases, setSelectedCases] = useState<string[]>([])
    const [targetUser, setTargetUser] = useState<string>("")
    const [transferring, setTransferring] = useState(false)
    const [loadingCases, setLoadingCases] = useState(false)

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [userResult, statsResult] = await Promise.all([
                    getUserProfileData(),
                    getProfileStats()
                ])

                if (userResult.success) {
                    setUserData(userResult.data)
                    if (userResult.data && userResult.data.role === 'ADMIN') {
                        // We can call this without awaiting if we don't want to block the main load
                        // But let's await it to be safe or just call it
                        fetchUsers()
                    }
                }
                if (statsResult.success) setStats(statsResult.data)

                // Load preferences from localStorage
                const savedPrefs = localStorage.getItem('tactical-prefs')
                if (savedPrefs) {
                    try {
                        setPreferences(JSON.parse(savedPrefs))
                    } catch (e) {
                        console.error("Failed to parse prefs", e)
                    }
                }
            } catch (error) {
                console.error("Failed to load initial data", error)
                toast({
                    title: "Error Loading Profile",
                    description: "Please try refreshing the page.",
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }

        if (status === "authenticated") {
            fetchInitialData()
        } else if (status === "unauthenticated") {
            setLoading(false)
            // Optionally redirect here if needed, but middleware handles general protection
            // router.push('/login') 
        }
    }, [status, session, toast])

    const fetchUsers = async () => {
        setLoadingUsers(true)
        const result = await getAllUsers()
        if (result.success && result.data) {
            setUsers(result.data)
        }
        setLoadingUsers(false)
    }

    const savePreferences = (newPrefs: any) => {
        setPreferences(newPrefs)
        localStorage.setItem('tactical-prefs', JSON.stringify(newPrefs))
    }

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)
        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const username = formData.get("username") as string

        const result = await updateUserDetails({ name, email, username })
        if (result.success) {
            setUserData({ ...userData, name, email, username })
            toast({
                title: "Profile Updated",
                description: "Your changes have been saved successfully.",
            })
        } else {
            toast({
                title: "Update Failed",
                description: result.error || "An error occurred while saving.",
                variant: "destructive",
            })
        }
        setSaving(false)
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordData.new !== passwordData.confirm) {
            toast({ title: "Error", description: "New passwords do not match", variant: "destructive" })
            return
        }
        setChangingPassword(true)
        const result = await changePassword(passwordData.current, passwordData.new)
        if (result.success) {
            toast({ title: "Success", description: "Password changed successfully" })
            setPasswordData({ current: "", new: "", confirm: "" })
        } else {
            toast({ title: "Error", description: result.error || "Failed to change password", variant: "destructive" })
        }
        setChangingPassword(false)
    }

    // Admin Handlers
    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        const result = await updateUserStatus(userId, !currentStatus)
        if (result.success) {
            toast({ title: "User Status Updated" })
            fetchUsers()
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" })
        }
    }

    const handleRoleChange = async (userId: string, newRole: string) => {
        const result = await updateUserRole(userId, newRole as any)
        if (result.success) {
            toast({ title: "User Role Updated" })
            fetchUsers()
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" })
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return
        const result = await deleteUser(userId)
        if (result.success) {
            toast({ title: "User Deleted" })
            fetchUsers()
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" })
        }
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreatingUser(true)

        // Basic validation
        if (!newUser.username || !newUser.password || !newUser.email) {
            toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" })
            setCreatingUser(false)
            return
        }

        const result = await createUser(newUser)
        if (result.success) {
            toast({ title: "User Created", description: `User ${result.data?.username} has been created successfully.` })
            setIsCreateUserOpen(false)
            setNewUser({ name: "", email: "", username: "", password: "", role: "VIEWER" })
            fetchUsers()
        } else {
            toast({ title: "Creation Failed", description: result.error, variant: "destructive" })
        }
        setCreatingUser(false)
    }

    const handleRevokeSession = (deviceName: string) => {
        toast({
            title: "Revoking Access",
            description: `Session on ${deviceName} has been terminated.`,
            variant: "destructive"
        })
    }

    const openManageCases = async (user: any) => {
        setManageCasesUser(user)
        setLoadingCases(true)
        const allCases = await getCases()
        // Filter cases owned by this user
        // Using 'any' casting because client types are not yet regenerated
        const userCases = allCases.filter((c: any) => c.ownerId === user.id)
        setCases(userCases)
        setSelectedCases([])
        setTargetUser("")
        setLoadingCases(false)
    }

    const handleTransferCases = async () => {
        if (!targetUser) {
            toast({ title: "Select User", description: "Please select a user to transfer cases to.", variant: "destructive" })
            return
        }
        setTransferring(true)
        try {
            let successCount = 0
            for (const caseId of selectedCases) {
                const res = await assignCaseOwner(caseId, targetUser)
                if (res.success) successCount++
            }
            toast({ title: "Transfer Complete", description: `Successfully transferred ${successCount} cases.` })

            // Refresh
            if (manageCasesUser) {
                openManageCases(manageCasesUser)
            }
        } catch (error) {
            toast({ title: "Transfer Failed", description: "An error occurred during transfer.", variant: "destructive" })
        }
        setTransferring(false)
    }

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground animate-pulse">Initializing Tactical Profile...</p>
                </div>
            </div>
        )
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    }

    return (
        <div className="p-6 space-y-8 max-w-6xl mx-auto">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6"
            >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="flex gap-6 items-center">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-2 border-primary/20 p-1 bg-background">
                                <AvatarImage src="/avatars/01.png" />
                                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                                    {userData?.name?.[0]?.toUpperCase() || userData?.username?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 bg-green-500 h-6 w-6 rounded-full border-4 border-background" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{userData?.name || userData?.username}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="font-mono text-xs uppercase tracking-wider">
                                    {userData?.role}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Active Now
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <ExportButton type="audit" className="glass-panel border-white/10" />
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="glass-panel bg-white/5 border-white/10 w-full justify-start overflow-x-auto">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <Activity className="h-4 w-4" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="account" className="flex items-center gap-2">
                            <User className="h-4 w-4" /> Account Details
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" /> Security
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" /> Preferences
                        </TabsTrigger>
                        {userData?.role === 'ADMIN' && (
                            <TabsTrigger value="users" className="flex items-center gap-2">
                                <Users className="h-4 w-4" /> User Management
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Mission Stats */}
                            <Card className="glass-card md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Target className="h-5 w-5 text-primary" /> Operational Stats
                                    </CardTitle>
                                    <CardDescription>Activity overview across current mission cycles.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { label: "Cases Managed", value: stats?.casesManaged || "0", icon: Clock, color: "text-blue-400" },
                                            { label: "Searches Led", value: stats?.searchesLed || "0", icon: Zap, color: "text-yellow-400" },
                                            { label: "Premises Secured", value: stats?.premisesSecured || "0", icon: CheckCircle2, color: "text-green-400" },
                                            { label: "Alerts Handled", value: stats?.alertsHandled || "0", icon: AlertCircle, color: "text-red-400" },
                                        ].map((stat, i) => (
                                            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1 items-center justify-center text-center">
                                                <stat.icon className={cn("h-5 w-5 mb-2", stat.color)} />
                                                <span className="text-2xl font-bold leading-none">{stat.value}</span>
                                                <span className="text-[10px] uppercase tracking-tighter text-muted-foreground">{stat.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8">
                                        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-primary" /> Performance Index
                                        </h3>
                                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-primary to-primary/40"
                                                initial={{ width: 0 }}
                                                animate={{ width: "85%" }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-mono">
                                            <span>EFFICIENCY: 85%</span>
                                            <span>TARGET: 90%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activity Mini-log */}
                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle className="text-lg">Recent Logs</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                        <Activity className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-sm">Audit trail functionality coming soon.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="account">
                        <Card className="glass-card max-w-2xl">
                            <CardHeader>
                                <CardTitle>Profile Details</CardTitle>
                                <CardDescription>Update your public information and mission identifiers.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username (Identifier)</Label>
                                            <Input
                                                id="username"
                                                name="username"
                                                defaultValue={userData?.username}
                                                className="bg-white/5 border-white/10 font-mono text-xs"
                                            />
                                            <p className="text-[10px] text-muted-foreground italic">Used for system login.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role" className="text-xs uppercase tracking-wider opacity-60">Assigned Role</Label>
                                            <Input
                                                id="role"
                                                defaultValue={userData?.role}
                                                disabled
                                                className="bg-white/5 border-white/10 font-mono text-xs opacity-60"
                                            />
                                            <p className="text-[10px] text-yellow-500/80 italic">Role assignment is managed by HQ.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Display Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="Enter full name"
                                                defaultValue={userData?.name}
                                                className="pl-10 glass-panel"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Official Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="Enter email address"
                                                defaultValue={userData?.email}
                                                className="pl-10 glass-panel"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                            Mission enrollment date: {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button type="submit" disabled={saving} className="min-w-[120px]">
                                            {saving ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                                    Syncing...
                                                </span>
                                            ) : "Commit Changes"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <Card className="glass-card max-w-2xl">
                            <CardHeader>
                                <CardTitle>Security & Access Control</CardTitle>
                                <CardDescription>Manage your authentication credentials and session logs.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">Change Password</h3>
                                    <form onSubmit={handleChangePassword} className="space-y-4 border p-4 rounded-lg bg-white/5 border-white/10">
                                        <div className="space-y-2">
                                            <Label htmlFor="current-password">Current Password</Label>
                                            <Input
                                                id="current-password"
                                                type="password"
                                                value={passwordData.current}
                                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="new-password">New Password</Label>
                                                <Input
                                                    id="new-password"
                                                    type="password"
                                                    value={passwordData.new}
                                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                                <Input
                                                    id="confirm-password"
                                                    type="password"
                                                    value={passwordData.confirm}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={changingPassword} size="sm">
                                                {changingPassword ? "Updating..." : "Update Password"}
                                            </Button>
                                        </div>
                                    </form>
                                </div>

                                <Separator className="bg-white/10" />

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">Session Authorization</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs p-2 rounded bg-white/5">
                                            <span className="font-mono text-muted-foreground uppercase">Current Session (IP: 192.168.1.45)</span>
                                            <span className="text-green-500 font-bold uppercase tracking-widest text-[10px]">Authorized</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs p-2 rounded bg-white/5">
                                            <span className="font-mono text-muted-foreground uppercase">Mobile Handset (Kolkata, IN)</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRevokeSession("Mobile Handset")}
                                                className="h-auto p-0 text-red-500 text-[10px] uppercase font-bold hover:bg-transparent hover:text-red-400 flex items-center gap-1"
                                            >
                                                <UserMinus className="h-3 w-3" /> Revoke
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings">
                        <Card className="glass-card max-w-2xl">
                            <CardHeader>
                                <CardTitle>System & UI Preferences</CardTitle>
                                <CardDescription>Customize your tactical environment interface.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Visual Theme Mode</Label>
                                            <p className="text-xs text-muted-foreground">Select your preferred tactical interface appearance.</p>
                                        </div>
                                        <div className="w-[180px]">
                                            <Select value={theme} onValueChange={(val: Theme) => setTheme(val)}>
                                                <SelectTrigger className="glass-panel border-white/10 bg-white/5 h-9">
                                                    <SelectValue placeholder="Select Theme" />
                                                </SelectTrigger>
                                                <SelectContent className="glass-panel border-white/10">
                                                    <SelectItem value="day">Day Mode</SelectItem>
                                                    <SelectItem value="night">Night Ops (Dark)</SelectItem>
                                                    <SelectItem value="mfd">MFD (Avionic Green)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Tactical Theme Sync</Label>
                                            <p className="text-xs text-muted-foreground">Automatically adjust theme based on Zulu time.</p>
                                        </div>
                                        <Switch
                                            checked={preferences.themeSync}
                                            onCheckedChange={(val) => savePreferences({ ...preferences, themeSync: val })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Haptic Feedback (Mobile)</Label>
                                            <p className="text-xs text-muted-foreground">Vibrate on critical tactical alerts.</p>
                                        </div>
                                        <Switch
                                            checked={preferences.haptic}
                                            onCheckedChange={(val) => savePreferences({ ...preferences, haptic: val })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Map Auto-Refresh</Label>
                                            <p className="text-xs text-muted-foreground">Instant positioning updates for active searches.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Switch
                                                checked={preferences.autoRefresh}
                                                onCheckedChange={(val) => savePreferences({ ...preferences, autoRefresh: val })}
                                            />
                                            <Badge variant="outline" className="text-[10px] font-mono">30 SECONDS</Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {userData?.role === 'ADMIN' && (
                        <TabsContent value="users">
                            <Card className="glass-card">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>User Management</CardTitle>
                                            <CardDescription>Authorize personnel and assign tactical roles.</CardDescription>
                                        </div>
                                        <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="gap-2">
                                                    <Users className="h-4 w-4" />
                                                    Add Personnel
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="glass-card border-white/10">
                                                <DialogHeader>
                                                    <DialogTitle>Onboard New Personnel</DialogTitle>
                                                    <DialogDescription>
                                                        Create a new user account. Temporary credentials should be shared securely.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <form onSubmit={handleCreateUser} className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="new-name">Full Name</Label>
                                                        <Input
                                                            id="new-name"
                                                            value={newUser.name}
                                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                                            placeholder="Officer Name"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="new-email">Email Address</Label>
                                                        <Input
                                                            id="new-email"
                                                            type="email"
                                                            value={newUser.email}
                                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                            placeholder="officer@agency.gov"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="new-username">Username</Label>
                                                        <Input
                                                            id="new-username"
                                                            value={newUser.username}
                                                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                                            placeholder="jdoe"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="new-password">Initial Password</Label>
                                                        <Input
                                                            id="new-password"
                                                            type="password"
                                                            value={newUser.password}
                                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                            placeholder="********"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="new-role">Assigned Role</Label>
                                                        <Select value={newUser.role} onValueChange={(val) => setNewUser({ ...newUser, role: val })}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="ADMIN">ADMIN</SelectItem>
                                                                <SelectItem value="COMMANDER">COMMANDER</SelectItem>
                                                                <SelectItem value="OFFICER">OFFICER</SelectItem>
                                                                <SelectItem value="VIEWER">VIEWER</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button type="submit" disabled={creatingUser}>
                                                            {creatingUser ? "Creating..." : "Create Account"}
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>

                                        {/* Case Management Dialog */}
                                        <Dialog open={!!manageCasesUser} onOpenChange={(open) => !open && setManageCasesUser(null)}>
                                            <DialogContent className="glass-card border-white/10 max-w-lg">
                                                <DialogHeader>
                                                    <DialogTitle>Manage Cases: {manageCasesUser?.name || manageCasesUser?.username}</DialogTitle>
                                                    <DialogDescription>
                                                        Transfer ownership of active case files to another officer.
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <div className="space-y-4 py-4">
                                                    {loadingCases ? (
                                                        <div className="text-center py-8 text-muted-foreground">Loading associated cases...</div>
                                                    ) : cases.length === 0 ? (
                                                        <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                                                            <Briefcase className="h-8 w-8 opacity-20" />
                                                            No cases assigned to this user.
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 border rounded-md p-2 bg-white/5">
                                                                {cases.map((c: any) => (
                                                                    <div key={c.id} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded">
                                                                        <Checkbox
                                                                            checked={selectedCases.includes(c.id)}
                                                                            onCheckedChange={(checked) => {
                                                                                if (checked) setSelectedCases([...selectedCases, c.id])
                                                                                else setSelectedCases(selectedCases.filter(id => id !== c.id))
                                                                            }}
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div className="font-mono text-xs font-bold">{c.caseNumber}</div>
                                                                            <div className="text-xs text-muted-foreground">{c.title}</div>
                                                                        </div>
                                                                        <Badge variant="outline" className="text-[10px]">{c.status}</Badge>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Transfer To</Label>
                                                                <Select value={targetUser} onValueChange={setTargetUser}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select Officer" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {users.filter(u => u.id !== manageCasesUser?.id).map(u => (
                                                                            <SelectItem key={u.id} value={u.id}>
                                                                                {u.name || u.username} ({u.role})
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setManageCasesUser(null)}>Cancel</Button>
                                                    <Button
                                                        onClick={handleTransferCases}
                                                        disabled={transferring || selectedCases.length === 0 || !targetUser}
                                                    >
                                                        {transferring ? "Transferring..." : `Transfer ${selectedCases.length} Cases`}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Joined</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loadingUsers ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading personnel records...</TableCell>
                                                </TableRow>
                                            ) : users.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{user.name || user.username}</span>
                                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select defaultValue={user.role} onValueChange={(val) => handleRoleChange(user.id, val)}>
                                                            <SelectTrigger className="w-[120px] h-8 text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="ADMIN">ADMIN</SelectItem>
                                                                <SelectItem value="COMMANDER">COMMANDER</SelectItem>
                                                                <SelectItem value="OFFICER">OFFICER</SelectItem>
                                                                <SelectItem value="VIEWER">VIEWER</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.isApproved ? (
                                                            <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Active</Badge>
                                                        ) : (
                                                            <Badge variant="destructive" className="bg-red-500/20 text-red-500 hover:bg-red-500/30">Pending</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => handleToggleStatus(user.id, user.isApproved)}
                                                                title={user.isApproved ? "Revoke Access" : "Approve Access"}
                                                            >
                                                                {user.isApproved ? <UserMinus className="h-4 w-4 text-red-400" /> : <Check className="h-4 w-4 text-green-400" />}
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                title="Delete User"
                                                            >
                                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => openManageCases(user)}
                                                                title="Manage Cases"
                                                            >
                                                                <Briefcase className="h-4 w-4 text-blue-400" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {!loadingUsers && users.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No other users found.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </motion.div>
        </div>
    )
}
