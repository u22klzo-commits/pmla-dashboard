'use client'

/**
 * PDF Export utilities for report pages.
 *
 * Uses jspdf + jspdf-autotable for generating presentable PDF reports
 * suitable for senior government officials.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PDFReportConfig {
    title: string;
    subtitle?: string;
    headers: string[];
    rows: (string | number | null | undefined)[][];
    filename: string;
    orientation?: 'portrait' | 'landscape';
    headerInfo?: Record<string, string>; // e.g., { "Case": "EC-2024-001", "Search": "Operation ABC" }
    footerText?: string;
}

export function generatePDFReport(config: PDFReportConfig): void {
    const {
        title,
        subtitle,
        headers,
        rows,
        filename,
        orientation = 'landscape',
        headerInfo,
        footerText
    } = config;

    const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 15;

    // Header: Case name or default ED branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 51, 102);
    const headerLine = headerInfo?.['Case'] || 'ENFORCEMENT DIRECTORATE — PMLA OPERATIONS';
    doc.text(headerLine.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;

    // Subheader: Search name or default unit info
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const subHeaderLine = headerInfo?.['Search'] || 'UNIT 2-1 | KOLKATA ZONAL OFFICE';
    doc.text(subHeaderLine, pageWidth / 2, yPos, { align: 'center' });
    yPos += 3;

    // Divider
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 6;

    // Report Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(title.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;

    if (subtitle) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text(subtitle, pageWidth / 2, yPos, { align: 'center' });
        yPos += 4;
    }

    // Additional header info (excluding Case/Search which are already shown)
    if (headerInfo) {
        const extraEntries = Object.entries(headerInfo).filter(([key]) => key !== 'Case' && key !== 'Search');
        if (extraEntries.length > 0) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            const infoLine = extraEntries.map(([key, val]) => `${key}: ${val}`).join('   |   ');
            doc.text(infoLine, pageWidth / 2, yPos, { align: 'center' });
            yPos += 4;
        }
    }

    // Date Generated
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;

    // Table
    const cleanRows = rows.map(row =>
        row.map(cell => (cell === null || cell === undefined ? '—' : String(cell)))
    );

    autoTable(doc, {
        head: [headers],
        body: cleanRows,
        startY: yPos,
        margin: { left: 10, right: 10 },
        styles: {
            fontSize: 7,
            cellPadding: 2,
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            textColor: [30, 30, 30],
            overflow: 'linebreak',
        },
        headStyles: {
            fillColor: [0, 51, 102],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 7.5,
            halign: 'center',
        },
        alternateRowStyles: {
            fillColor: [245, 248, 252],
        },
        columnStyles: {
            0: { fontStyle: 'bold' },
        },
        didDrawPage: (data) => {
            // Footer
            doc.setFontSize(6);
            doc.setTextColor(150, 150, 150);
            const pageNo = `Page ${doc.getCurrentPageInfo().pageNumber}`;
            doc.text(pageNo, pageWidth - 15, pageHeight - 7, { align: 'right' });

            const footer = footerText || 'CONFIDENTIAL — For Official Use Only';
            doc.text(footer, 15, pageHeight - 7);
        }
    });

    doc.save(filename);
}

/**
 * Generate CSV from headers + rows and trigger a download.
 */
export function downloadCSV(
    headers: string[],
    rows: (string | number | null | undefined)[][],
    filename: string
): void {
    const csvContent = [
        headers.join(','),
        ...rows.map(row =>
            row.map(cell => {
                const str = cell === null || cell === undefined ? '' : String(cell);
                // Escape commas and quotes
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
