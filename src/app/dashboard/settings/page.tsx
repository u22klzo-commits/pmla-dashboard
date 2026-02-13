"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FieldConfigTable } from "@/components/settings/field-config-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTacticalTheme } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils"
import { Sun, Moon, Zap, RefreshCw, Layers, ShieldCheck, Globe, Bell, History, ArrowRight, Activity, Save } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getAuditLogs } from "@/actions/export"

export default function SettingsPage() {
    const { theme, setTheme } = useTacticalTheme()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)

    // State for various settings
    const [hqConfig, setHqConfig] = useState({
        agencyName: "Enforcement Directorate",
        region: "Kolkata Zonal Office"
    })

    const [mapSettings, setMapSettings] = useState({
        refreshInterval: '30s',
        highDensity: true
    })

    const [alertThresholds, setAlertThresholds] = useState({
        criticalCases: 5,
        resourceUtilization: 85
    })

    const [auditLogsOpen, setAuditLogsOpen] = useState(false)
    const [auditLogs, setAuditLogs] = useState<any[]>([])
    const [auditLogsLoading, setAuditLogsLoading] = useState(false)

    // Initial load from localStorage
    useEffect(() => {
        const savedHq = localStorage.getItem('hq-config')
        const savedMap = localStorage.getItem('map-settings')
        const savedAlerts = localStorage.getItem('alert-thresholds')

        if (savedHq) setHqConfig(JSON.parse(savedHq))
        if (savedMap) setMapSettings(JSON.parse(savedMap))
        if (savedAlerts) setAlertThresholds(JSON.parse(savedAlerts))

        setLoading(false)
    }, [])

    const handleSaveHQConfig = () => {
        localStorage.setItem('hq-config', JSON.stringify(hqConfig))
        toast({
            title: "HQ Config Saved",
            description: "Agency protocols have been updated across the network.",
        })
    }

    const handleSaveMapSettings = (newSettings: any) => {
        const updated = { ...mapSettings, ...newSettings }
        setMapSettings(updated)
        localStorage.setItem('map-settings', JSON.stringify(updated))
        toast({
            title: "Map Intelligence Updated",
            description: `Auto-refresh set to ${updated.refreshInterval}.`,
        })
    }

    const handleSaveAlerts = () => {
        localStorage.setItem('alert-thresholds', JSON.stringify(alertThresholds))
        toast({
            title: "Alert Routing Updated",
            description: "Thresholds committed to Central Command Server.",
        })
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    }

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
                    <p className="text-muted-foreground">Manage tactical environment and dashboard configurations.</p>
                </div>

                <Dialog open={auditLogsOpen} onOpenChange={(open) => {
                    setAuditLogsOpen(open)
                    if (open) {
                        setAuditLogsLoading(true)
                        getAuditLogs().then(res => {
                            if (res.success) setAuditLogs(res.data || [])
                            setAuditLogsLoading(false)
                        })
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="glass-panel border-white/10 flex items-center gap-2">
                            <History className="h-4 w-4" /> Audit Logs
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-white/10 max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" /> System Audit Trail
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground/70">
                                Detailed chronological log of all administrative and tactical actions.
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[400px] pr-4 mt-4">
                            {auditLogsLoading ? (
                                <div className="flex justify-center py-10">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {auditLogs.map((log, i) => (
                                        <div key={i} className="flex gap-4 p-3 rounded-lg bg-white/5 border border-white/5 items-start">
                                            <div className={cn(
                                                "mt-1 h-2 w-2 rounded-full shrink-0",
                                                log.type === 'system' ? 'bg-blue-400' :
                                                    log.type === 'tactical' ? 'bg-green-400' :
                                                        log.type === 'warning' ? 'bg-red-500' : 'bg-primary/40'
                                            )} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-bold font-mono text-primary">{log.user}</span>
                                                    <span className="text-[10px] text-muted-foreground">{log.time}</span>
                                                </div>
                                                <p className="text-sm text-foreground/90">{log.action}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {auditLogs.length === 0 && (
                                        <p className="text-center py-10 text-muted-foreground">No recent audit logs found.</p>
                                    )}
                                </div>
                            )}
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="tactical" className="space-y-6">
                <TabsList className="glass-panel bg-white/5 border-white/10 p-1">
                    <TabsTrigger value="tactical" className="flex items-center gap-2 px-6">
                        <Zap className="h-4 w-4" /> Tactical
                    </TabsTrigger>
                    <TabsTrigger value="general" className="flex items-center gap-2 px-6">
                        <Globe className="h-4 w-4" /> Agency
                    </TabsTrigger>
                    <TabsTrigger value="fields" className="flex items-center gap-2 px-6">
                        <Layers className="h-4 w-4" /> Field Config
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2 px-6">
                        <Bell className="h-4 w-4" /> Alerts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tactical" className="space-y-6">
                    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="glass-card border-primary/20 bg-primary/[0.02]">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-yellow-500" /> Tactical Visual Mode
                                    </CardTitle>
                                    <CardDescription>Select high-performance visual themes for different operational conditions.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'day', label: 'Day', icon: Sun, color: 'text-orange-400' },
                                        { id: 'night', label: 'Night Ops', icon: Moon, color: 'text-blue-400' },
                                        { id: 'mfd', label: 'MFD (Avionic)', icon: Zap, color: 'text-green-500' },
                                    ].map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => setTheme(mode.id as any)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-4 rounded-xl border transition-all hover:bg-white/5",
                                                theme === mode.id
                                                    ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                                                    : "bg-white/5 border-white/10"
                                            )}
                                        >
                                            <mode.icon className={cn("h-6 w-6 mb-2", mode.color)} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{mode.label}</span>
                                        </button>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <RefreshCw className="h-5 w-5 text-primary" /> Map Intelligence
                                    </CardTitle>
                                    <CardDescription>Configure real-time data synchronization for the Tactical Map.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase tracking-widest opacity-70">Auto-Refresh Interval</Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {['Off', '15s', '30s', '60s'].map((time) => (
                                                <Button
                                                    key={time}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleSaveMapSettings({ refreshInterval: time })}
                                                    className={cn(
                                                        "text-[10px] font-mono",
                                                        mapSettings.refreshInterval === time && "border-primary bg-primary/20 shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                                                    )}
                                                >
                                                    {time}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm">High-Density Markers</Label>
                                            <p className="text-[10px] text-muted-foreground italic">Optimize rendering for 100+ units.</p>
                                        </div>
                                        <Switch
                                            checked={mapSettings.highDensity}
                                            onCheckedChange={(val) => handleSaveMapSettings({ highDensity: val })}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                </TabsContent>

                <TabsContent value="general" className="space-y-4">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-bold">
                                <ShieldCheck className="h-5 w-5 text-primary" /> Agency Protocols
                            </CardTitle>
                            <CardDescription>
                                Global configuration for agency-wide dashboard deployment.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 max-w-xl">
                            <div className="space-y-2">
                                <Label htmlFor="agency-name">Command Agency Name</Label>
                                <Input
                                    id="agency-name"
                                    value={hqConfig.agencyName}
                                    onChange={(e) => setHqConfig({ ...hqConfig, agencyName: e.target.value })}
                                    className="glass-panel"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="region">Operational HQ Region</Label>
                                <Input
                                    id="region"
                                    value={hqConfig.region}
                                    onChange={(e) => setHqConfig({ ...hqConfig, region: e.target.value })}
                                    className="glass-panel"
                                />
                            </div>
                            <div className="pt-4">
                                <Button
                                    onClick={handleSaveHQConfig}
                                    className="shadow-[0_0_10px_rgba(var(--primary),0.3)] flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" /> Save HQ Config
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="fields" className="space-y-4">
                    <Card className="glass-card overflow-hidden">
                        <CardHeader className="bg-white/[0.02] border-b border-white/5">
                            <CardTitle className="text-lg">Intelligent Field Configuration</CardTitle>
                            <CardDescription>
                                Define and validate metadata fields for case management workflow.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <FieldConfigTable />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card className="glass-card border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-primary flex items-center gap-2">
                                <Bell className="h-5 w-5" /> Tactical Alert Routing
                            </CardTitle>
                            <CardDescription>
                                Set critical thresholds for automated mission alerts and escalation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Critical Case Threshold</Label>
                                        <Badge variant="outline" className="font-mono text-primary">{alertThresholds.criticalCases} UNITS</Badge>
                                    </div>
                                    <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-primary transition-all"
                                            style={{ width: `${(alertThresholds.criticalCases / 10) * 100}%` }}
                                        />
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={alertThresholds.criticalCases}
                                            onChange={(e) => setAlertThresholds({ ...alertThresholds, criticalCases: parseInt(e.target.value) })}
                                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                                        <Activity className="h-3 w-3" /> Trigger escalation when active cases exceed this limit.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Resource Utilization</Label>
                                        <Badge variant="outline" className="font-mono text-yellow-500">{alertThresholds.resourceUtilization}%</Badge>
                                    </div>
                                    <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-yellow-500/50 transition-all"
                                            style={{ width: `${alertThresholds.resourceUtilization}%` }}
                                        />
                                        <input
                                            type="range"
                                            min="50"
                                            max="95"
                                            value={alertThresholds.resourceUtilization}
                                            onChange={(e) => setAlertThresholds({ ...alertThresholds, resourceUtilization: parseInt(e.target.value) })}
                                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3" /> Warning issued when unit deployment exceeds threshold.
                                    </p>
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
                                <div className="flex gap-4 items-center">
                                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Fast-Escalation Protocol</p>
                                        <p className="text-xs text-muted-foreground">Direct notification to Special Director for Category-A alerts.</p>
                                    </div>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                        <CardFooter className="bg-white/[0.02] border-t border-white/5 justify-end py-4">
                            <Button size="sm" onClick={handleSaveAlerts} className="flex items-center gap-2 shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                                <ArrowRight className="h-4 w-4" /> Commit Routing Protocols
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
