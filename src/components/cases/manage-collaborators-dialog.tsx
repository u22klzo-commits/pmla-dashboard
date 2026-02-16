'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, UserPlus, X, Search, Loader2, Trash2 } from "lucide-react"
import { User, Role } from "@prisma/client"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { searchUsers } from "@/actions/user"
import { addCaseCollaborator, removeCaseCollaborator } from "@/actions/cases"

interface Collaborator {
    id: string
    name: string | null
    email: string | null
    username: string | null
    role: Role
}

interface ManageCollaboratorsDialogProps {
    caseId: string
    collaborators: Collaborator[]
    trigger?: React.ReactNode
}

export function ManageCollaboratorsDialog({ caseId, collaborators, trigger }: ManageCollaboratorsDialogProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<Collaborator[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()
    const debouncedQuery = useDebounce(query, 500)

    useEffect(() => {
        const search = async () => {
            if (debouncedQuery.length < 2) {
                setResults([])
                return
            }

            setIsSearching(true)
            try {
                const res = await searchUsers(debouncedQuery)
                if (res.success && res.data) {
                    // Filter out existing collaborators and non-approved users are already filtered by backend
                    const filtered = res.data.filter((u: any) => !collaborators.some(c => c.id === u.id))
                    setResults(filtered)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setIsSearching(false)
            }
        }
        search()
    }, [debouncedQuery, collaborators])

    const handleAddCollaborator = async (userId: string) => {
        setIsLoading(true)
        try {
            const res = await addCaseCollaborator(caseId, userId)
            if (res.success) {
                toast({
                    title: "Collaborator added",
                    description: "The user has been added to the case.",
                })
                setQuery("")
                setResults([])
                router.refresh()
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: res.error || "Failed to add collaborator",
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemoveCollaborator = async (userId: string) => {
        setIsLoading(true)
        try {
            const res = await removeCaseCollaborator(caseId, userId)
            if (res.success) {
                toast({
                    title: "Collaborator removed",
                    description: "The user has been removed from the case.",
                })
                router.refresh()
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: res.error || "Failed to remove collaborator",
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Users className="mr-2 h-4 w-4" />
                        Collaborators
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Manage Collaborators</DialogTitle>
                    <DialogDescription>
                        Add or remove collaborators who can view and edit this case.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium leading-none">Add People</h4>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or username..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        {isSearching && (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {!isSearching && results.length > 0 && (
                            <ScrollArea className="h-[200px] border rounded-md p-2">
                                <div className="space-y-2">
                                    {results.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{user.name?.[0] || user.username?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">{user.name || user.username}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleAddCollaborator(user.id)}
                                                disabled={isLoading}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-medium leading-none">Current Collaborators ({collaborators.length})</h4>
                        <ScrollArea className="h-[200px] border rounded-md p-2">
                            {collaborators.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                    No collaborators yet.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {collaborators.map((collaborator) => (
                                        <div key={collaborator.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{collaborator.name?.[0] || collaborator.username?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">{collaborator.name || collaborator.username}</p>
                                                    <p className="text-xs text-muted-foreground">{collaborator.email}</p>
                                                </div>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleRemoveCollaborator(collaborator.id)}
                                                disabled={isLoading}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
