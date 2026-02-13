'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getPremiseById } from '@/actions/premises'
import { PremiseForm, ExistingPremise } from '@/components/premises/premise-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EditPremisePage() {
    const params = useParams()
    const router = useRouter()
    const [premise, setPremise] = useState<ExistingPremise | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchPremise() {
            if (typeof params.id !== 'string') {
                setError('Invalid premise ID')
                setLoading(false)
                return
            }

            try {
                const data = await getPremiseById(params.id)
                if (data) {
                    setPremise({
                        id: data.id,
                        searchId: data.searchId,
                        name: data.name,
                        address: data.address,
                        locationType: data.locationType,
                        nature: data.nature,
                        occupantName: data.occupantName,
                        mobileNumber: data.mobileNumber,
                        sourceOfInfo: data.sourceOfInfo,
                        gpsLat: data.gpsLat,
                        gpsLong: data.gpsLong,
                        distanceFromCrpfCamp: data.distanceFromCrpfCamp,
                        liveLocationUrl1: data.liveLocationUrl1,
                        liveLocationUrl2: data.liveLocationUrl2,
                        recceNotes: data.recceNotes,
                    })
                } else {
                    setError('Premise not found')
                }
            } catch (err) {
                console.error('Failed to fetch premise:', err)
                setError('Failed to load premise data')
            } finally {
                setLoading(false)
            }
        }

        fetchPremise()
    }, [params.id])

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error || !premise) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard/operations/premises">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Premises
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardContent className="py-8">
                        <p className="text-center text-muted-foreground">
                            {error || 'Premise not found'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/operations/premises">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Premises
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Premise</CardTitle>
                    <CardDescription>
                        Update details for {premise.name}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PremiseForm
                        searchId={premise.searchId}
                        premise={premise}
                        onSuccess={() => {
                            router.push('/dashboard/operations/premises')
                            router.refresh()
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
