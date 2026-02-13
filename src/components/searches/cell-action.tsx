"use client"

import { useState } from "react"
import { Copy, Edit, MoreHorizontal, Trash, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertModal } from "@/components/ui/alert-modal"
import { Search } from "./columns"
import { deleteSearch } from "@/actions/searches"

import { useToast } from "@/components/ui/use-toast"
import { useQueryClient } from "@tanstack/react-query"

interface CellActionProps {
    data: Search
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const onConfirm = async () => {
        try {
            setLoading(true)
            const result = await deleteSearch(data.id)
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Search operation deleted.",
                })
                queryClient.invalidateQueries({ queryKey: ['searches'] })
                router.refresh()
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to delete search",
                    variant: "destructive",
                })
            }
            setOpen(false)
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "An error occurred",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onConfirm}
                loading={loading}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(data.id)}
                    >
                        <Copy className="mr-2 h-4 w-4" /> Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/searches/${data.id}`)}
                    >
                        <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/searches/${data.id}/edit`)}
                    >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setOpen(true)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
