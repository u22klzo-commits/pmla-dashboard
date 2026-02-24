export function generateCSV(headers: string[]): string {
    return headers.join(',');
}

export function parseCSV(content: string): Record<string, string>[] {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        // Skip comment/instruction rows (lines starting with '#' or whose first value starts with '#')
        if (line.startsWith('#') || line.split(',')[0]?.trim().startsWith('#')) continue;
        // Skip empty lines
        if (line === '') continue;

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

export const PREMISE_CSV_HEADERS = [
    'name', 'address', 'locationType', 'nature', 'occupantName',
    'mobileNumber', 'sourceOfInfo', 'gpsLat', 'gpsLong',
    'liveLocationUrl1', 'liveLocationUrl2'
];

// Enum instructions for CSV template — shown as comment rows
export const PREMISE_ENUM_INSTRUCTIONS: Record<string, string> = {
    locationType: 'KOLKATA | OUTSIDE',
    nature: 'RESIDENTIAL | COMMERCIAL | OFFICE | INDUSTRIAL | OTHERS',
    sourceOfInfo: 'INFORMER | COMPLAINT | INTELLIGENCE | OTHER',
};

export const RESOURCE_ENUM_INSTRUCTIONS: Record<string, Record<string, string>> = {
    OFFICIAL: {
        rank: 'AEO | EO | AD | DSP | INSPECTOR | SI | ASI | HC | CONSTABLE | OTHER',
        gender: 'MALE | FEMALE | OTHER',
    },
    WITNESS: {
        idType: 'AADHAAR | VOTER_ID | PAN | OTHER',
        gender: 'MALE | FEMALE | OTHER',
    },
    DRIVER: {
        gender: 'MALE | FEMALE | OTHER',
    },
    CRPF: {},
};

/**
 * Generate CSV content with an instruction row for enum/dropdown fields.
 * The instruction row starts with '#' so parseCSV can skip it.
 */
export function generateCSVWithInstructions(
    headers: string[],
    enumInstructions: Record<string, string>
): string {
    const headerRow = headers.join(',');
    // Build instruction row: for each header, show allowed values if it's an enum field
    const instructionValues = headers.map(h => {
        if (enumInstructions[h]) {
            return `# ${enumInstructions[h]}`;
        }
        return '';
    });
    const instructionRow = instructionValues.join(',');
    return `${headerRow}\n${instructionRow}`;
}
