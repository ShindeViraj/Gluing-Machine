import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const logs = await prisma.machine_print_log.findMany({
      orderBy: { plc_datetime: 'desc' }
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Machine_Log');

    // Add empty row
    sheet.addRow([]);

    // Add Title Row (starts at column 5 / index 4 after 4 nulls)
    const titleRow = sheet.addRow([null, null, null, null, 'GLUING MACHINE']);
    titleRow.font = { bold: true, size: 14 };

    // Add empty row
    sheet.addRow([]);

    // Add Headers
    const headerRow = sheet.addRow([
      null, null, null, null,
      'Date', 
      'Time', 
      'Operator Name', 
      'Mode of Operation (A/M)', 
      'Sticker Printing (Done / Not Done)'
    ]);
    headerRow.font = { bold: true };

    // Add Data
    for (const log of logs) {
      // Create local date string from Date object
      const pad = (num: number) => num.toString().padStart(2, '0');
      const d = log.plc_datetime;
      const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
      const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      const modeStr = log.mode_auto ? 'A' : (log.mode_manual ? 'M' : 'Unknown');
      const printStr = log.print_done ? 'Done' : 'Not Done';

      sheet.addRow([
        null, null, null, null,
        dateStr,
        timeStr,
        log.operator_name,
        modeStr,
        printStr
      ]);
    }

    // Adjust column widths
    sheet.getColumn(5).width = 15; // Date
    sheet.getColumn(6).width = 15; // Time
    sheet.getColumn(7).width = 25; // Operator Name
    sheet.getColumn(8).width = 25; // Mode
    sheet.getColumn(9).width = 35; // Sticker Printing

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Machine_Log_Export.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating export:', error);
    return new NextResponse('Error generating export', { status: 500 });
  }
}
