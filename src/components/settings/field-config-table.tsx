"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Edit } from "lucide-react"

// Mock data type
type FieldConfig = {
    id: string
    entity: "CASE" | "SEARCH" | "PREMISE"
    fieldName: string
    fieldType: "TEXT" | "DATE" | "NUMBER" | "BOOLEAN" | "SELECT"
    isRequired: boolean
    isVisible: boolean
}

const mockFields: FieldConfig[] = [
    {
        id: "1",
        entity: "CASE",
        fieldName: "ECIR Number",
        fieldType: "TEXT",
        isRequired: true,
        isVisible: true,
    },
    {
        id: "2",
        entity: "SEARCH",
        fieldName: "Authorization Date",
        fieldType: "DATE",
        isRequired: true,
        isVisible: true,
    },
    {
        id: "3",
        entity: "PREMISE",
        fieldName: "Owner Name",
        fieldType: "TEXT",
        isRequired: true,
        isVisible: true,
    },
]

export function FieldConfigTable() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Custom Fields</h3>
                <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Field</Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Entity</TableHead>
                            <TableHead>Field Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Required</TableHead>
                            <TableHead>Visible</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockFields.map((field) => (
                            <TableRow key={field.id}>
                                <TableCell>{field.entity}</TableCell>
                                <TableCell className="font-medium">{field.fieldName}</TableCell>
                                <TableCell>{field.fieldType}</TableCell>
                                <TableCell>{field.isRequired ? "Yes" : "No"}</TableCell>
                                <TableCell>{field.isVisible ? "Yes" : "No"}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
