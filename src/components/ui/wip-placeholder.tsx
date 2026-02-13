import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Construction, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface WIPPlaceholderProps {
    title: string
    backLink?: string
    entityId?: string
    description?: string
}

export function WIPPlaceholder({ title, backLink = "/dashboard", entityId, description }: WIPPlaceholderProps) {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center space-x-2">
                <Link href={backLink} className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            </div>
            <div className="flex h-[400px] items-center justify-center">
                <Card className="w-[450px]">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <Construction className="h-12 w-12 text-blue-600 animate-pulse" />
                        </div>
                        <CardTitle>Work in Progress</CardTitle>
                        <CardDescription>
                            This module is currently under development.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {description || "We are building a sophisticated experience for managing this entity. Check back soon for updates."}
                        </p>
                        {entityId && (
                            <div className="p-2 bg-muted rounded text-xs font-mono">
                                ID: {entityId}
                            </div>
                        )}
                        <Button asChild className="w-full">
                            <Link href={backLink}>Return to List</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
