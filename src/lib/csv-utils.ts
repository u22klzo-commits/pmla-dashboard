export function generateCSV(headers: string[]): string {
    return headers.join(',');
}

export function parseCSV(content: string): Record<string, string>[] {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) continue;

        const row: Record<string, string> = {};
        for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = values[j];
        }
        data.push(row);
    }
    return data;
}

export const RESOURCE_CSV_HEADERS = {
    OFFICIAL: ['name', 'rank', 'designation', 'unit', 'contactNumber', 'gender'],
    WITNESS: ['name', 'address', 'contactNumber', 'idType', 'idNumber', 'gender'],
    DRIVER: ['name', 'licenseNumber', 'vehicleType', 'vehicleRegNo', 'contactNumber', 'gender'],
    CRPF: ['Team Leader Name', 'Male Count', 'Female Count', 'Contact Number']
};
