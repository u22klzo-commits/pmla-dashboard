'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireRole, requireCaseAccess } from '@/lib/rbac';

export async function exportGlobalReport() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: 'Unauthorized' };

        const roleCheck = await requireRole(['ADMIN', 'OFFICER']);
        if (!roleCheck.success) return { success: false, error: roleCheck.error };

        const searches = await prisma.search.findMany({
            include: {
                case: true,
                _count: {
                    select: { premises: true, resources: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const headers = ['Search Name', 'Case Number', 'Status', 'Date', 'Premise Count', 'Resource Count'];
        const csvRows = [headers.join(',')];

        searches.forEach((s: any) => {
            const row = [
                formatCsvField(s.name),
                formatCsvField(s.case.caseNumber),
                formatCsvField(s.status),
                s.date ? s.date.toLocaleDateString() : '',
                s._count.premises,
                s._count.resources
            ];
            csvRows.push(row.join(','));
        });

        return { success: true, data: csvRows.join('\n'), filename: 'global-operations-report.csv' };
    } catch (error) {
        console.error('Export error:', error);
        return { success: false, error: 'Failed to generate report' };
    }
}

export async function exportSearchReport(searchId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: 'Unauthorized' };

        const search = await prisma.search.findUnique({
            where: { id: searchId },
            include: {
                case: true,
                premises: {
                    include: {
                        assignedResources: true
                    }
                },
                resources: true
            }
        }) as any;

        if (!search) return { success: false, error: 'Search not found' };

        const access = await requireCaseAccess(search.caseId, 'READ');
        if (!access.success) return { success: false, error: access.error };



        const sections = [];

        // Header info
        sections.push(`Search Report: ${search.name}`); // Intentionally kept simple text, not CSV row
        sections.push(`Case: ${search.case.caseNumber} - ${search.case.title}`);
        sections.push(`Date: ${search.date.toLocaleDateString()}`);
        sections.push(`Status: ${search.status}`);
        sections.push('');

        // Premises
        sections.push('PREMISES');
        sections.push('Name,Address,Nature,Recce Status,Latitude,Longitude,Resources Assigned');
        search.premises.forEach((p: any) => {
            sections.push(`${formatCsvField(p.name)},${formatCsvField(p.address)},${formatCsvField(p.nature)},${formatCsvField(p.recceStatus)},${p.gpsLat || ''},${p.gpsLong || ''},${p._count.assignedResources}`);
        });
        sections.push('');

        // Resources
        sections.push('RESOURCES');
        sections.push('Type,Name,Rank/Designation,Contact');
        search.resources.forEach((r: any) => {
            sections.push(`${formatCsvField(r.type)},${formatCsvField(r.name)},${formatCsvField(r.rank || r.designation || 'N/A')},${formatCsvField(r.contactNumber || 'N/A')}`);
        });

        return { success: true, data: sections.join('\n'), filename: `report-${search.name.toLowerCase().replace(/ /g, '-')}.csv` };
    } catch (error) {
        console.error('Search export error:', error);
        return { success: false, error: 'Failed to generate search report' };
    }
}

export async function exportAuditLogs() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: 'Unauthorized' };

        const roleCheck = await requireRole(['ADMIN', 'OFFICER']);
        if (!roleCheck.success) return { success: false, error: roleCheck.error };

        // Since we don't have an AuditLog table, we'll export a summary of recent data additions
        // as a surrogate for mission logs.
        const [cases, searches, premises] = await Promise.all([
            prisma.case.findMany({ take: 10, orderBy: { createdAt: 'desc' } }),
            prisma.search.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { case: true } }),
            prisma.premise.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { search: true } })
        ]);

        const logs = [];
        logs.push('Action,Entity Type,Entity Name,Timestamp');

        cases.forEach(c => logs.push(`"CASE_INITIATED","CASE",${formatCsvField(c.caseNumber)},"${c.createdAt.toISOString()}"`));
        searches.forEach(s => logs.push(`"SEARCH_PLANNED","SEARCH",${formatCsvField(`${s.name} (${s.case.caseNumber})`)},"${s.createdAt.toISOString()}"`));
        premises.forEach(p => logs.push(`"PREMISE_IDENTIFIED","PREMISE",${formatCsvField(p.name)},"${p.createdAt.toISOString()}"`));

        // Sort by timestamp
        const sortedLogs = logs.slice(1).sort((a, b) => {
            const timeA = new Date(a.split(',').pop()!.replace(/"/g, '')).getTime();
            const timeB = new Date(b.split(',').pop()!.replace(/"/g, '')).getTime();
            return timeB - timeA;
        });

        return { success: true, data: [logs[0], ...sortedLogs].join('\n'), filename: `audit-logs-${session.user.name || 'user'}.csv` };
    } catch (error) {
        console.error('Audit export error:', error);
        return { success: false, error: 'Failed to generate audit logs' };
    }
}

export async function exportRequisitionReport(searchId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: 'Unauthorized' };

        // Check access to the search's case
        const search = await prisma.search.findUnique({ where: { id: searchId } });
        if (!search) return { success: false, error: 'Search not found' };

        const access = await requireCaseAccess(search.caseId, 'READ');
        if (!access.success) return { success: false, error: access.error };

        const premises = await prisma.premise.findMany({
            where: { searchId },
            include: {
                search: true
            }
        });

        if (premises.length === 0) return { success: false, error: 'No premises found for this search' };

        const headers = ['Premise Name', 'Address', 'Nature', 'Male Witnesses Req.', 'Female Witnesses Req.', 'CRPF Team Size', 'CRPF Male', 'CRPF Female', 'Vehicles'];
        const csvRows = [headers.join(',')];

        premises.forEach((p: any) => {
            const reqs = (p.requirements as any) || {};
            const row = [
                formatCsvField(p.name),
                formatCsvField(p.address),
                formatCsvField(p.nature),
                reqs.maleWitness || 0,
                reqs.femaleWitness || 0,
                reqs.crpfTeamSize || 0,
                reqs.crpfMaleCount || 0,
                reqs.crpfFemaleCount || 0,
                reqs.vehicles || 0
            ];
            csvRows.push(row.join(','));
        });

        return {
            success: true,
            data: csvRows.join('\n'),
            filename: `requisition-report-${premises[0].search.name.toLowerCase().replace(/ /g, '-')}.csv`
        };
    } catch (error) {
        console.error('Requisition export error:', error);
        return { success: false, error: 'Failed to generate requisition report' };
    }
}

export async function exportResourceReport(type: 'OFFICIAL' | 'WITNESS' | 'CRPF' | 'DRIVER', searchId?: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: 'Unauthorized' };

        if (searchId) {
            const search = await prisma.search.findUnique({ where: { id: searchId } });
            if (!search) return { success: false, error: 'Search not found' };
            const access = await requireCaseAccess(search.caseId, 'READ');
            if (!access.success) return { success: false, error: access.error };
        } else {
            const roleCheck = await requireRole(['ADMIN', 'OFFICER']);
            if (!roleCheck.success) return { success: false, error: roleCheck.error };
        }

        const where: any = { type };
        if (searchId) where.searchId = searchId;

        const resources = await prisma.resource.findMany({
            where,
            include: {
                search: true
            }
        });

        let headers: string[] = [];
        const csvRows: string[] = [];

        if (type === 'OFFICIAL') {
            headers = ['Name', 'Rank', 'Designation', 'Unit', 'Contact', 'Status', 'Search'];
        } else if (type === 'WITNESS') {
            headers = ['Name', 'Gender', 'Address', 'Area', 'ID Type', 'ID Number', 'Contact', 'Status'];
        } else if (type === 'CRPF') {
            headers = ['Team Name', 'Male Count', 'Female Count', 'Contact', 'Status', 'Search'];
        } else if (type === 'DRIVER') {
            headers = ['Name', 'License Number', 'Vehicle Type', 'Reg No', 'Contact', 'Status'];
        }

        csvRows.push(headers.join(','));

        resources.forEach((r: any) => {
            let row: any[] = [];
            if (type === 'OFFICIAL') {
                row = [formatCsvField(r.name), formatCsvField(r.rank || ''), formatCsvField(r.designation || ''), formatCsvField(r.unit || ''), formatCsvField(r.contactNumber || ''), formatCsvField(r.status), formatCsvField(r.search?.name || 'N/A')];
            } else if (type === 'WITNESS') {
                row = [formatCsvField(r.name), formatCsvField(r.gender), formatCsvField(r.address || ''), formatCsvField(r.area || ''), formatCsvField(r.idType || ''), formatCsvField(r.idNumber || ''), formatCsvField(r.contactNumber || ''), formatCsvField(r.status)];
            } else if (type === 'CRPF') {
                row = [formatCsvField(r.name), r.crpfMaleCount || 0, r.crpfFemaleCount || 0, formatCsvField(r.contactNumber || ''), formatCsvField(r.status), formatCsvField(r.search?.name || 'N/A')];
            } else if (type === 'DRIVER') {
                row = [formatCsvField(r.name), formatCsvField(r.licenseNumber || ''), formatCsvField(r.vehicleType || ''), formatCsvField(r.vehicleRegNo || ''), formatCsvField(r.contactNumber || ''), formatCsvField(r.status)];
            }
            csvRows.push(row.join(','));
        });

        return {
            success: true,
            data: csvRows.join('\n'),
            filename: `${type.toLowerCase()}-report.csv`
        };
    } catch (error) {
        console.error('Resource export error:', error);
        return { success: false, error: `Failed to generate ${type.toLowerCase()} report` };
    }
}

export async function exportPremisesReport(searchId?: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: 'Unauthorized' };

        if (searchId) {
            const search = await prisma.search.findUnique({ where: { id: searchId } });
            if (!search) return { success: false, error: 'Search not found' };
            const access = await requireCaseAccess(search.caseId, 'READ');
            if (!access.success) return { success: false, error: access.error };
        } else {
            const roleCheck = await requireRole(['ADMIN', 'OFFICER']);
            if (!roleCheck.success) return { success: false, error: roleCheck.error };
        }

        const where: any = {};
        if (searchId) where.searchId = searchId;

        const premises = await prisma.premise.findMany({
            where,
            include: {
                search: true
            }
        });

        // Columns from the UI View:
        // Name, Address, Nature, Status, Lat, Lng
        const headers = ['Premise Name', 'Address', 'Search Operation', 'Nature', 'Status', 'Latitude', 'Longitude'];
        const csvRows = [headers.join(',')];

        premises.forEach((p: any) => {
            const row = [
                formatCsvField(p.name),
                formatCsvField(p.address || ''),
                formatCsvField(p.search?.name || 'N/A'),
                formatCsvField(p.nature || ''),
                formatCsvField(p.recceStatus),
                p.gpsLat || '',
                p.gpsLong || ''
            ];
            csvRows.push(row.join(','));
        });

        const filename = searchId
            ? `premises-report-${searchId}.csv`
            : 'global-premises-report.csv';

        return { success: true, data: csvRows.join('\n'), filename };

    } catch (error) {
        console.error('Premises export error:', error);
        return { success: false, error: 'Failed to generate premises report' };
    }
}

export async function getAuditLogs() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: 'Unauthorized' };

        const roleCheck = await requireRole(['ADMIN', 'OFFICER']);
        if (!roleCheck.success) return { success: false, error: roleCheck.error };

        // Surrogate audit logs based on recent database events
        const [cases, searches, premises] = await Promise.all([
            prisma.case.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { caseNumber: true, createdAt: true }
            }),
            prisma.search.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { case: { select: { caseNumber: true } } }
            }),
            prisma.premise.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { search: { select: { name: true } } }
            })
        ]);

        const logs = [
            ...cases.map(c => ({
                user: "System",
                action: `Case Initiated: ${c.caseNumber}`,
                time: formatDate(c.createdAt),
                type: 'system' as const
            })),
            ...searches.map(s => ({
                user: "Admin",
                action: `Search Planned: ${s.name}`,
                time: formatDate(s.createdAt),
                type: 'tactical' as const
            })),
            ...premises.map(p => ({
                user: "Field Ops",
                action: `Premise Identified: ${p.name}`,
                time: formatDate(p.createdAt),
                type: 'info' as const
            }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

        return { success: true, data: logs };
    } catch (error) {
        console.error('Fetch audit logs error:', error);
        return { success: false, error: 'Failed to fetch audit logs' };
    }
}

function formatDate(date: Date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)} mins ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString();
}

function formatCsvField(value: any): string {
    if (value === null || value === undefined) return '';
    let stringValue = String(value);

    // Mitigate CSV Injection
    if (/^[=+\-@]/.test(stringValue)) {
        stringValue = `'${stringValue}`;
    }

    // Escape double quotes
    stringValue = stringValue.replace(/"/g, '""');

    return `"${stringValue}"`;
}
