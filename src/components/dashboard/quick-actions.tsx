import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, MapPin, Shield, ClipboardList } from "lucide-react"
import { CreateCaseDialog } from "@/components/cases/create-case-dialog"
import { RegisterSearchDialog } from "@/components/searches/register-search-dialog"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function QuickActions({ className }: { className?: string }) {
    return (
        <Card className={cn("glass-card border-none", className)}>
            <CardHeader className="py-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 grid-cols-2 lg:grid-cols-4 pt-0 pb-3">
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all cursor-pointer group">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <Plus className="h-4 w-4" />
                            </div>
                            <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Case</h3>
                        </div>
                        <div className="mt-1">
                            <CreateCaseDialog trigger={<Button size="sm" className="w-full h-7 text-[10px] uppercase font-bold" variant="secondary">Start</Button>} />
                        </div>
                    </div>
                </div>

                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all cursor-pointer group">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                <MapPin className="h-4 w-4" />
                            </div>
                            <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Plan</h3>
                        </div>
                        <div className="mt-1">
                            <RegisterSearchDialog trigger={<Button size="sm" className="w-full h-7 text-[10px] uppercase font-bold" variant="secondary">Add</Button>} />
                        </div>
                    </div>
                </div>

                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all cursor-pointer group">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                <ClipboardList className="h-4 w-4" />
                            </div>
                            <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Requisition</h3>
                        </div>
                        <div className="mt-1">
                            <Button size="sm" className="w-full h-7 text-[10px] uppercase font-bold" variant="secondary" asChild>
                                <Link href="/dashboard/operations/requisition">Form</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all cursor-pointer group">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                <Shield className="h-4 w-4" />
                            </div>
                            <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Resources</h3>
                        </div>
                        <div className="mt-1">
                            <Button size="sm" className="w-full h-7 text-[10px] uppercase font-bold" variant="secondary" asChild>
                                <Link href="/dashboard/resources/officers">View</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
