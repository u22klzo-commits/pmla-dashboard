'use client'

import { useState, useTransition, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    MapPin,
    Phone,
    User,
    FileText,
    Navigation,
    Camera,
    Shield,
    Loader2,
    Check,
    Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { QuickStatusButton } from './quick-status-button'
import { quickUpdateRecceFields } from '@/actions/premises'
import Link from 'next/link'
import { PremiseWithRelations } from '@/lib/services/premise-service'

interface RecceInlinePanelProps {
    premise: PremiseWithRelations
    premises: PremiseWithRelations[]
    currentIndex: number
    onNavigate: (index: number) => void
}

export function RecceInlinePanel({
    premise,
    premises,
    currentIndex,
    onNavigate,
}: RecceInlinePanelProps) {
    // Local field states for inline editing
    const [recceNotes, setRecceNotes] = useState(premise.recceNotes || '')
    const [photoUrl, setPhotoUrl] = useState(premise.photoUrl || '')
    const [liveLocationUrl1, setLiveLocationUrl1] = useState(premise.liveLocationUrl1 || '')
    const [liveLocationUrl2, setLiveLocationUrl2] = useState(premise.liveLocationUrl2 || '')
    const [gpsLat, setGpsLat] = useState<string>(premise.gpsLat?.toString() || '')
    const [gpsLong, setGpsLong] = useState<string>(premise.gpsLong?.toString() || '')
    const [distanceFromCrpfCamp, setDistanceFromCrpfCamp] = useState<string>(premise.distanceFromCrpfCamp?.toString() || '')

    const [isPending, startTransition] = useTransition()
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

    // Reset state when premise changes
    const resetFields = useCallback((p: PremiseWithRelations) => {
        setRecceNotes(p.recceNotes || '')
        setPhotoUrl(p.photoUrl || '')
        setLiveLocationUrl1(p.liveLocationUrl1 || '')
        setLiveLocationUrl2(p.liveLocationUrl2 || '')
        setGpsLat(p.gpsLat?.toString() || '')
        setGpsLong(p.gpsLong?.toString() || '')
        setDistanceFromCrpfCamp(p.distanceFromCrpfCamp?.toString() || '')
        setSaveStatus('idle')
    }, [])

    // Auto-save handler
    const handleSave = useCallback(() => {
        setSaveStatus('saving')
        startTransition(async () => {
            const result = await quickUpdateRecceFields(premise.id, {
                recceNotes: recceNotes || undefined,
                photoUrl: photoUrl || undefined,
                liveLocationUrl1: liveLocationUrl1 || undefined,
                liveLocationUrl2: liveLocationUrl2 || undefined,
                gpsLat: gpsLat ? parseFloat(gpsLat) : null,
                gpsLong: gpsLong ? parseFloat(gpsLong) : null,
                distanceFromCrpfCamp: distanceFromCrpfCamp ? parseFloat(distanceFromCrpfCamp) : null,
            })
            if (result.success) {
                setSaveStatus('saved')
                setTimeout(() => setSaveStatus('idle'), 2000)
            } else {
                setSaveStatus('idle')
            }
        })
    }, [premise.id, recceNotes, photoUrl, liveLocationUrl1, liveLocationUrl2, gpsLat, gpsLong, distanceFromCrpfCamp, startTransition])

    const handleGetLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setGpsLat(position.coords.latitude.toFixed(6))
                setGpsLong(position.coords.longitude.toFixed(6))
            })
        } else {
            alert("Geolocation is not supported by your browser.")
        }
    }

    const handleNavigate = (newIndex: number) => {
        // Save current before navigating
        if (saveStatus !== 'saved') {
            handleSave()
        }
        resetFields(premises[newIndex])
        onNavigate(newIndex)
    }

    const hasPrev = currentIndex > 0
    const hasNext = currentIndex < premises.length - 1

    // Resource summary
    const officersNum = premise.assignedResources?.filter(r => r.resource.type === 'OFFICIAL').length || 0
    const witnessNum = premise.assignedResources?.filter(r => r.resource.type === 'WITNESS').length || 0
    const crpfNum = premise.assignedResources?.filter(r => r.resource.type === 'CRPF').length || 0
    const driverNum = premise.assignedResources?.filter(r => r.resource.type === 'DRIVER').length || 0

    return (
        <div className="flex flex-col h-full">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    disabled={!hasPrev}
                    onClick={() => handleNavigate(currentIndex - 1)}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-xs">Prev</span>
                </Button>
                <span className="text-xs font-mono text-muted-foreground">
                    {currentIndex + 1} / {premises.length}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    disabled={!hasNext}
                    onClick={() => handleNavigate(currentIndex + 1)}
                >
                    <span className="text-xs">Next</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Premise Identity */}
            <div className="px-3 py-3 border-b space-y-1">
                <h3 className="text-sm font-bold truncate">{premise.name}</h3>
                <p className="text-[11px] text-muted-foreground truncate">{premise.address}</p>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                    {premise.occupantName && (
                        <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {premise.occupantName}
                        </span>
                    )}
                    {premise.mobileNumber && (
                        <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {premise.mobileNumber}
                        </span>
                    )}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
                {/* Quick Status */}
                <div>
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5 block">
                        Recce Status
                    </Label>
                    <QuickStatusButton
                        premiseId={premise.id}
                        stage="recce"
                        currentStatus={premise.recceStatus}
                    />
                </div>

                {/* Resource Summary */}
                <div>
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5 block">
                        Resources Deployed
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                        {officersNum > 0 && (
                            <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                                <User className="h-2.5 w-2.5" /> {officersNum} Officers
                            </Badge>
                        )}
                        {crpfNum > 0 && (
                            <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                                <Shield className="h-2.5 w-2.5" /> {crpfNum} CRPF
                            </Badge>
                        )}
                        {witnessNum > 0 && (
                            <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                                👁️ {witnessNum} Witness
                            </Badge>
                        )}
                        {driverNum > 0 && (
                            <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                                🚗 {driverNum} Driver
                            </Badge>
                        )}
                        {officersNum + crpfNum + witnessNum + driverNum === 0 && (
                            <span className="text-[11px] text-muted-foreground italic">No resources allocated</span>
                        )}
                    </div>
                </div>

                <Separator />

                {/* GPS & Location Links */}
                {/* GPS Location Link (if available) */}
                {(premise.gpsLat && premise.gpsLong) || premise.distanceFromCrpfCamp ? (
                    <div>
                        <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5 block">
                            Static Location Data
                        </Label>
                        <div className="space-y-1.5">
                            {premise.gpsLat && premise.gpsLong && (
                                <a
                                    href={`https://www.google.com/maps?q=${premise.gpsLat},${premise.gpsLong}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[11px] text-blue-600 hover:underline"
                                >
                                    <Navigation className="h-3 w-3" />
                                    {premise.gpsLat.toFixed(5)}, {premise.gpsLong.toFixed(5)}
                                </a>
                            )}
                            {premise.distanceFromCrpfCamp && (
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {premise.distanceFromCrpfCamp} km from CRPF camp
                                </span>
                            )}
                        </div>
                    </div>
                ) : null}

                <Separator />

                {/* Editable Recce Fields */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                            Field Notes
                        </Label>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] gap-1"
                            onClick={handleSave}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : saveStatus === 'saved' ? (
                                <Check className="h-3 w-3 text-green-500" />
                            ) : (
                                <Save className="h-3 w-3" />
                            )}
                            {saveStatus === 'saved' ? 'Saved' : 'Save'}
                        </Button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                            GPS & Distance Update
                        </Label>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-[10px] gap-1"
                            onClick={handleGetLocation}
                            type="button"
                        >
                            <MapPin className="h-3 w-3" />
                            Current Loc
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                            <Label className="text-[10px] text-muted-foreground mb-1 block">Latitude</Label>
                            <Input
                                value={gpsLat}
                                onChange={(e) => setGpsLat(e.target.value)}
                                onBlur={handleSave}
                                placeholder="e.g. 22.5"
                                className="text-xs h-8"
                            />
                        </div>
                        <div>
                            <Label className="text-[10px] text-muted-foreground mb-1 block">Longitude</Label>
                            <Input
                                value={gpsLong}
                                onChange={(e) => setGpsLong(e.target.value)}
                                onBlur={handleSave}
                                placeholder="e.g. 88.3"
                                className="text-xs h-8"
                            />
                        </div>
                        <div className="col-span-2 mt-1 mb-4">
                            <Label className="text-[10px] text-muted-foreground mb-1 block">Dist from CRPF (km)</Label>
                            <Input
                                value={distanceFromCrpfCamp}
                                onChange={(e) => setDistanceFromCrpfCamp(e.target.value)}
                                onBlur={handleSave}
                                placeholder="e.g. 5.5"
                                className="text-xs h-8"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-[10px] text-muted-foreground mb-1 block">
                            <FileText className="h-3 w-3 inline mr-1" />
                            Recce Notes
                        </Label>
                        <Textarea
                            value={recceNotes}
                            onChange={(e) => setRecceNotes(e.target.value)}
                            onBlur={handleSave}
                            placeholder="Enter field observations, access points, risk factors..."
                            className="text-xs min-h-[80px] resize-none"
                        />
                    </div>

                    <div>
                        <Label className="text-[10px] text-muted-foreground mb-1 block">
                            <Camera className="h-3 w-3 inline mr-1" />
                            Photo URL
                        </Label>
                        <Input
                            value={photoUrl}
                            onChange={(e) => setPhotoUrl(e.target.value)}
                            onBlur={handleSave}
                            placeholder="https://..."
                            className="text-xs h-8"
                        />
                    </div>

                    <div>
                        <Label className="text-[10px] text-muted-foreground mb-1 block">
                            <Navigation className="h-3 w-3 inline mr-1" />
                            Live Location URL 1
                        </Label>
                        <Input
                            value={liveLocationUrl1}
                            onChange={(e) => setLiveLocationUrl1(e.target.value)}
                            onBlur={handleSave}
                            placeholder="Google Maps link..."
                            className="text-xs h-8"
                        />
                    </div>

                    <div>
                        <Label className="text-[10px] text-muted-foreground mb-1 block">
                            <Navigation className="h-3 w-3 inline mr-1" />
                            Live Location URL 2
                        </Label>
                        <Input
                            value={liveLocationUrl2}
                            onChange={(e) => setLiveLocationUrl2(e.target.value)}
                            onBlur={handleSave}
                            placeholder="Google Maps link..."
                            className="text-xs h-8"
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t bg-muted/30 flex items-center justify-between">
                <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                    <Link href={`/dashboard/operations/premises/${premise.id}/edit`}>
                        Full Edit
                    </Link>
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                    <Link href={`/dashboard/operations/premises/${premise.id}`}>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Detail View
                    </Link>
                </Button>
            </div>
        </div>
    )
}
