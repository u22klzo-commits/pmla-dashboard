import { SearchNav } from "@/components/layout/search-nav"
import { SearchContextSync } from "@/components/searches/search-context-sync"


interface SearchLayoutProps {
    children: React.ReactNode
    params: Promise<{
        id: string
    }>
}

export default async function SearchLayout({
    children,
    params,
}: SearchLayoutProps) {
    const { id } = await params

    return (
        <div className="flex flex-col min-h-screen">
            <SearchContextSync searchId={id} />
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-8 pt-4">
                    <SearchNav searchId={id} className="mb-0 border-0 pb-2" />
                </div>
            </div>
            <div className="flex-1">
                {children}
            </div>
        </div>
    )
}
