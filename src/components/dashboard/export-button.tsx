'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
    exportGlobalReport,
    exportSearchReport,
    exportAuditLogs,
    exportRequisitionReport,
    exportResourceReport,
    exportPremisesReport
} from '@/actions/export';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface ExportButtonProps {
    type?: 'global' | 'search' | 'audit' | 'auto' | 'premises';
    searchId?: string;
    variant?: 'outline' | 'ghost' | 'default';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    showLabel?: boolean;
}

export function ExportButton({
    type = 'auto',
    searchId,
    variant = 'outline',
    size = 'sm',
    className,
    showLabel = true
}: ExportButtonProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const pathname = usePathname();

    const handleExport = async () => {
        setLoading(true);
        try {
            let result;
            let exportType = type;

            // Auto-detect type based on pathname if set to 'auto'
            // We prioritized exact matches for reports
            if (exportType === 'auto') {
                if (pathname.includes('/operations/requisition')) {
                    if (searchId) {
                        result = await exportRequisitionReport(searchId);
                    } else {
                        toast({
                            title: "Search Required",
                            description: "Please select a search to export requisitions.",
                            variant: "destructive"
                        });
                        setLoading(false);
                        return;
                    }
                } else if (pathname.includes('/resources/officers') || pathname.includes('/reports/officer-list')) {
                    result = await exportResourceReport('OFFICIAL', searchId);
                } else if (pathname.includes('/resources/witnesses')) {
                    result = await exportResourceReport('WITNESS', searchId);
                } else if (pathname.includes('/resources/crpf')) {
                    result = await exportResourceReport('CRPF', searchId);
                } else if (pathname.includes('/resources/drivers')) {
                    result = await exportResourceReport('DRIVER', searchId);
                } else if (pathname.includes('/operations/premises') || pathname.includes('/reports/console') || pathname.includes('/reports/team-sheets')) {
                    // console and team-sheets are premise-centric
                    result = await exportPremisesReport(searchId);
                } else if (pathname.includes('/reports/senior')) {
                    if (searchId) {
                        result = await exportSearchReport(searchId);
                    } else {
                        // Fallback for global view on senior report if needed, or just premises
                        result = await exportPremisesReport(searchId);
                    }
                } else if (pathname === '/dashboard' || pathname === '/dashboard/') {
                    if (searchId) {
                        result = await exportSearchReport(searchId);
                    } else {
                        result = await exportGlobalReport();
                    }
                } else {
                    result = await exportGlobalReport();
                }
            } else {
                // Manual type selection
                if (exportType === 'global') {
                    result = await exportGlobalReport();
                } else if (exportType === 'search' && searchId) {
                    result = await exportSearchReport(searchId);
                } else if (exportType === 'audit') {
                    result = await exportAuditLogs();
                } else if (exportType === 'premises') {
                    result = await exportPremisesReport(searchId);
                } else {
                    // Fallback for manual types not explicitly handled above if any
                    if (exportType === 'search' && !searchId) {
                        toast({
                            title: "Error",
                            description: "Search ID is missing for this export.",
                            variant: "destructive"
                        });
                        setLoading(false);
                        return;
                    }
                    throw new Error('Invalid export configuration');
                }
            }

            if (result && result.success && result.data) {
                const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', result.filename || 'report.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast({
                    title: "Export Success",
                    description: `${result.filename} has been generated.`,
                });
            } else if (result) {
                toast({
                    title: "Export Failed",
                    description: result.error || "Could not generate report.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Export component error:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred during export.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleExport}
            disabled={loading}
            className={cn(className)}
            title={showLabel ? undefined : "Export Data"}
        >
            <Download className={cn("h-4 w-4", showLabel && "mr-2")} />
            {showLabel && (loading ? "Generating..." : "Download Report")}
        </Button>
    );
}
