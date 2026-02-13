'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { autoAllocateResources } from '@/actions/allocation'
import { useRouter } from 'next/navigation'

interface AutoAllocateButtonProps {
    searchId: string
    disabled?: boolean
}

export function AutoAllocateButton({ searchId, disabled }: AutoAllocateButtonProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const handleAutoAllocate = async () => {
        setLoading(true)
        try {
            const result = await autoAllocateResources(searchId)
            if (result.success) {
                toast({
                    title: "Allocation Complete",
                    description: result.message,
                })
                router.refresh()
            } else {
                toast({
                    title: "Allocation Failed",
                    description: result.error,
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong during allocation.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleAutoAllocate}
            disabled={loading || disabled}
            variant="default" // Primary action
        >
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="mr-2 h-4 w-4" />
            )}
            Auto Allocate
        </Button>
    )
}
