'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, MoreHorizontal, FileSpreadsheet } from 'lucide-react';
import { generateCSVWithInstructions, parseCSV, PREMISE_CSV_HEADERS, PREMISE_ENUM_INSTRUCTIONS } from '@/lib/csv-utils';
import { bulkImportPremises } from '@/actions/bulk-premises';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BulkPremiseActionsProps {
    searchId: string;
}

export function BulkPremiseActions({ searchId }: BulkPremiseActionsProps) {
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const router = useRouter();

    const handleDownload = () => {
        const csvContent = generateCSVWithInstructions(
            PREMISE_CSV_HEADERS,
            PREMISE_ENUM_INSTRUCTIONS
        );
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `premises_template.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            const content = e.target?.result as string;
            const data = parseCSV(content);

            // Validate headers
            if (data.length > 0) {
                const keys = Object.keys(data[0]);
                const requiredHeaders = ['name', 'address', 'locationType', 'nature'];
                const missingHeaders = requiredHeaders.filter(h => !keys.includes(h));

                if (missingHeaders.length > 0) {
                    toast({
                        title: 'Validation Error',
                        description: `Missing required columns: ${missingHeaders.join(', ')}`,
                        variant: 'destructive',
                    });
                    setLoading(false);
                    return;
                }
            }

            try {
                const result = await bulkImportPremises(searchId, data);

                if (result.success) {
                    toast({
                        title: 'Success',
                        description: `Successfully imported ${result.count} premises.${result.errors ? ` (${result.errors.length} rows skipped)` : ''}`,
                    });
                    router.refresh();
                } else {
                    toast({
                        title: 'Import Failed',
                        description: result.error || "Unknown error",
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                toast({
                    title: 'Import Failed',
                    description: "An unexpected error occurred during import.",
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.onerror = () => {
            toast({
                title: 'Error',
                description: 'Failed to read file.',
                variant: 'destructive',
            });
            setLoading(false);
        };

        reader.readAsText(file);
    };

    return (
        <div className="flex items-center">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 border-dashed" disabled={loading}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Bulk Import
                        <MoreHorizontal className="ml-2 h-4 w-4 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>CSV Operations</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
                        <Download className="mr-2 h-4 w-4" />
                        Download Template
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleUploadClick} className="cursor-pointer" disabled={loading}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import CSV
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
