/**
 * Export Utilities
 * 
 * Functions to generate and trigger browser downloads of RANGER data.
 * Used for simulated exports in Phase 1.5.
 */

interface ExportOptions {
    filename: string;
    data: any;
    format: 'csv' | 'json';
}

/**
 * Trigger a browser download of a file
 */
export const downloadFile = ({ filename, data, format }: ExportOptions) => {
    let content = '';
    let mimeType = '';

    if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
    } else if (format === 'csv') {
        // Basic CSV conversion for an array of objects
        if (Array.isArray(data) && data.length > 0) {
            const headers = Object.keys(data[0]);
            const rows = data.map((obj: any) =>
                headers.map((header) => {
                    const val = obj[header];
                    return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
                }).join(',')
            );
            content = [headers.join(','), ...rows].join('\n');
        } else {
            content = String(data);
        }
        mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const timestamp = new Date().toISOString().split('T')[0];
    const finalFilename = `${filename}-${timestamp}.${format}`;

    link.href = url;
    link.setAttribute('download', finalFilename);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Example export for TRACS Work Orders
 */
export const exportTracsWorkOrders = () => {
    const mockData = [
        { id: 'TR-001', trail: 'Waldo Lake Trail', damage: 'Severe', estimate: 45000, priority: 'High' },
        { id: 'TR-002', trail: 'Hills Creek Crossing', damage: 'Bridge Out', estimate: 125000, priority: 'CRITICAL' },
        { id: 'TR-003', trail: 'North Fork Access', damage: 'Washout', estimate: 15000, priority: 'Medium' }
    ];

    // Export both formats as requested by tech lead for inspection
    downloadFile({ filename: 'TRACS-work-orders', data: mockData, format: 'csv' });
    downloadFile({ filename: 'TRACS-work-orders-debug', data: mockData, format: 'json' });
};

/**
 * Example export for FSVeg Timber Data
 */
export const exportFsVegData = () => {
    const mockData = [
        { plot: '23-CHARLIE', species: 'Douglas-fir', mbf: 45.2, health: 'Burned', value: 12500 },
        { plot: '47-ALPHA', species: 'Lodgepole Pine', mbf: 12.8, health: 'Blue Stain', value: 4200 },
        { plot: '52-FOXTROT', species: 'Western Hemlock', mbf: 33.1, health: 'Moderate', value: 8900 }
    ];

    downloadFile({ filename: 'FSVeg-timber-cruise', data: mockData, format: 'csv' });
};
