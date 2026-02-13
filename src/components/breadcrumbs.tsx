import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
    title: string
    link: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <div className="flex items-center text-sm text-muted-foreground mb-4">
            <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
                <Home className="h-4 w-4" />
            </Link>
            {items.map((item, index) => (
                <div key={item.link} className="flex items-center">
                    <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
                    <Link
                        href={item.link}
                        className={`hover:text-primary transition-colors ${index === items.length - 1 ? "text-foreground font-medium" : ""
                            }`}
                    >
                        {item.title}
                    </Link>
                </div>
            ))}
        </div>
    )
}
