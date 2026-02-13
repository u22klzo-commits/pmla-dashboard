import { Separator } from "@/components/ui/separator"

interface PageHeaderProps {
    heading: string
    subheading?: string
    actions?: React.ReactNode
}

export function PageHeader({ heading, subheading, actions }: PageHeaderProps) {
    return (
        <div className="space-y-4 pb-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                        {heading}
                    </h2>
                    {subheading && (
                        <p className="text-muted-foreground text-sm">
                            {subheading}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center space-x-2">
                        {actions}
                    </div>
                )}
            </div>
            <Separator className="bg-slate-200 dark:bg-slate-800" />
        </div>
    )
}
