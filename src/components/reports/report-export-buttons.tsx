'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { generatePDFReport, downloadCSV, PDFReportConfig } from '@/lib/pdf-utils'
import { useToast } from '@/components/ui/use-toast'

interface ReportExportButtonsProps {
    /** Report title for the PDF header */
    title: string
    /** Optional subtitle */
    subtitle?: string
    /** Column headers */
    headers: string[]
    /** Row data - each row is an array of cell values */
    rows: (string | number | null | undefined)[][]
    /** Base filename (without extension) */
    filename: string
    /** PDF orientation */
    orientation?: 'portrait' | 'landscape'
    /** Additional header info like case number */
    headerInfo?: Record<string, string>
}

export function ReportExportButtons({
    title,
    subtitle,
    headers,
    rows,
    filename,
    orientation = 'landscape',
    headerInfo,
}: ReportExportButtonsProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handlePDFExport = () => {
        setLoading(true)
        try {
            generatePDFReport({
                title,
                subtitle,
                headers,
                rows,
                filename: `${filename}.pdf`,
                orientation,
                headerInfo,
            })
            toast({
                title: 'PDF Generated',
                description: `${filename}.pdf has been downloaded.`,
            })
        } catch (error) {
            console.error('PDF export error:', error)
            toast({
                title: 'Export Failed',
                description: 'Could not generate PDF report.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCSVExport = () => {
        setLoading(true)
        try {
            downloadCSV(headers, rows, `${filename}.csv`)
            toast({
                title: 'CSV Generated',
                description: `${filename}.csv has been downloaded.`,
            })
        } catch (error) {
            console.error('CSV export error:', error)
            toast({
                title: 'Export Failed',
                description: 'Could not generate CSV report.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={loading}>
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? 'Generating...' : 'Export Report'}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handlePDFExport} className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4 text-red-500" />
                    Download PDF
                    <span className="ml-auto text-[10px] text-muted-foreground">Official</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCSVExport} className="cursor-pointer">
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-green-500" />
                    Download CSV
                    <span className="ml-auto text-[10px] text-muted-foreground">Data</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
