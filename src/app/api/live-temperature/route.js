import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import fs from 'fs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const filePath = 'C:\\Users\\COE_AT Admin\\Desktop\\software\\SRM PROJECT SUPPORT\\NEW_CHANGE_24_10_25\\Report_20251024H10.xls';

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Excel file not found', isLive: false }, { status: 404 });
        }

        // Read file directly
        const fileBuffer = fs.readFileSync(filePath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });

        if (!rawData || rawData.length === 0) {
            return NextResponse.json({ error: 'No data in Excel file', isLive: false }, { status: 400 });
        }

        // Find last row with valid temperature data
        let lastValidRow = null;
        let readings = [];

        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            const temp = row[1]; // Column C (Temperature) - index 1 after xlsx parses

            if (temp !== undefined && temp !== null && typeof temp === 'number') {
                let timeStr = 'N/A';
                const rawTime = row[0]; // Column B (DateTime)

                if (rawTime instanceof Date) {
                    timeStr = rawTime.toLocaleTimeString('en-US', { hour12: false });
                } else if (typeof rawTime === 'number') {
                    const excelEpoch = new Date(1899, 11, 30);
                    const days = Math.floor(rawTime);
                    const fractionalDay = rawTime - days;
                    const ms = Math.round(fractionalDay * 24 * 60 * 60 * 1000);
                    const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000 + ms);
                    timeStr = date.toLocaleTimeString('en-US', { hour12: false });
                }

                const reading = { temperature: temp, timestamp: timeStr };
                readings.push(reading);
                lastValidRow = reading;
            }
        }

        if (!lastValidRow) {
            return NextResponse.json({ error: 'No valid temperature data', isLive: false }, { status: 400 });
        }

        const recentReadings = readings.slice(-10).reverse();
        const stats = fs.statSync(filePath);

        return NextResponse.json({
            temperature: lastValidRow.temperature,
            timestamp: lastValidRow.timestamp,
            totalRows: readings.length,
            lastUpdated: new Date().toISOString(),
            fileModified: stats.mtime.toISOString(),
            isLive: true,
            readings: recentReadings
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: error.message, isLive: false }, { status: 500 });
    }
}
