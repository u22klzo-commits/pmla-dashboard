
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PremiseNature, LocationType, RecceStatus, DecisionStatus, AllocationStatus } from "@prisma/client"
import { MapPin, Home, Building2, Factory, MoreHorizontal, Pencil, Trash2, Eye, UserPlus, Phone, ExternalLink, Navigation } from "lucide-react"
import Link from "next/link"
import { QuickStatusButton } from "./quick-status-button"
import { ResourceAllocationDialog } from "@/components/resources/resource-allocation-dialog"

export type PremiseColumn = {
    id: string
    searchId: string
    name: string
    address: string
    searchName: string
    locationType: LocationType
    nature: PremiseNature
    recceStatus: RecceStatus
    decisionStatus: DecisionStatus
    allocationStatus: AllocationStatus
    // New fields from spec
    occupantName?: string | null
    mobileNumber?: string | null
    sourceOfInfo?: string | null
    gpsLat?: number | null
    gpsLong?: number | null
    liveLocationUrl1?: string | null
    liveLocationUrl2?: string | null
    photoUrl?: string | null
}

const natureIcons: Record<string, React.ElementType> = {
    RESIDENTIAL: Home,
    COMMERCIAL: Building2,
    OFFICE: Building2,
    INDUSTRIAL: Factory,
    OTHERS: MapPin,
}

const sourceColors: Record<string, string> = {
    INFORMER: "bg-purple-100 text-purple-800",
    COMPLAINT: "bg-orange-100 text-orange-800",
    INTELLIGENCE: "bg-blue-100 text-blue-800",
    OTHER: "bg-gray-100 text-gray-800",
}

export const premiseColumns: ColumnDef<PremiseColumn>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Premise Name",
        cell: ({ row }) => {
            const nature = row.original.nature
            const Icon = natureIcons[nature] || MapPin
            return (
                <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{row.getValue("name")}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "occupantName",
        header: "Occupant",
        cell: ({ row }) => (
            <span className="text-sm">{row.getValue("occupantName") || "-"}</span>
        )
    },
    {
        accessorKey: "mobileNumber",
        header: "Mobile",
        cell: ({ row }) => {
            const mobile = row.getValue("mobileNumber") as string | null
            if (!mobile) return <span className="text-muted-foreground">-</span>
            return (
                <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{mobile}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "sourceOfInfo",
        header: "Source",
        cell: ({ row }) => {
            const source = row.getValue("sourceOfInfo") as string | null
            if (!source) return <span className="text-muted-foreground">-</span>
            return (
                <div className="flex flex-col gap-1">
                    <Badge variant="outline" className={sourceColors[source] || ""}>
                        {source.charAt(0) + source.slice(1).toLowerCase()}
                    </Badge>
                </div>
            )
        }
    },
    {
        id: "gps",
        header: "GPS",
        cell: ({ row }) => {
            const lat = row.original.gpsLat
            const lng = row.original.gpsLong
            if (!lat || !lng) return <span className="text-muted-foreground">-</span>
            const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`
            return (
                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline text-xs"
                >
                    <Navigation className="h-3 w-3" />
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                </a>
            )
        }
    },
    {
        id: "liveLocation",
        header: "Links",
        cell: ({ row }) => {
            const url1 = row.original.liveLocationUrl1
            const url2 = row.original.liveLocationUrl2
            const photoUrl = row.original.photoUrl
            if (!url1 && !url2 && !photoUrl) return <span className="text-muted-foreground">-</span>
            return (
                <div className="flex gap-1">
                    {url1 && (
                        <a href={url1} target="_blank" rel="noopener noreferrer" title="Live Location 1">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <ExternalLink className="h-3 w-3 text-blue-600" />
                            </Button>
                        </a>
                    )}
                    {url2 && (
                        <a href={url2} target="_blank" rel="noopener noreferrer" title="Live Location 2">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <ExternalLink className="h-3 w-3 text-green-600" />
                            </Button>
                        </a>
                    )}
                    {photoUrl && (
                        <a href={photoUrl} target="_blank" rel="noopener noreferrer" title="View Photo">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Eye className="h-3 w-3 text-purple-600" />
                            </Button>
                        </a>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: "searchName",
        header: "Search",
    },
    {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => (
            <div className="max-w-[200px] truncate" title={row.getValue("address")}>
                {row.getValue("address")}
            </div>
        )
    },
    {
        accessorKey: "recceStatus",
        header: "Recce",
        cell: ({ row }) => (
            <QuickStatusButton
                premiseId={row.original.id}
                stage="recce"
                currentStatus={row.getValue("recceStatus")}
            />
        )
    },
    {
        accessorKey: "decisionStatus",
        header: "Decision",
        cell: ({ row }) => (
            <QuickStatusButton
                premiseId={row.original.id}
                stage="decision"
                currentStatus={row.getValue("decisionStatus")}
            />
        )
    },
    {
        accessorKey: "allocationStatus",
        header: "Allocation",
        cell: ({ row }) => (
            <QuickStatusButton
                premiseId={row.original.id}
                stage="allocation"
                currentStatus={row.getValue("allocationStatus")}
            />
        )
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const premiseId = row.original.id
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/operations/premises/${premiseId}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/operations/premises/${premiseId}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Premise
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <ResourceAllocationDialog
                            premiseId={premiseId}
                            searchId={row.original.searchId}
                            trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Allocate Resources
                                </DropdownMenuItem>
                            }
                        />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    },
]
