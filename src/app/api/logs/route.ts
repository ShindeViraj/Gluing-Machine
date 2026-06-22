import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');

  let dateFilter: any = {};
  if (startDate && endDate) {
    dateFilter = {
      plc_datetime: {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59'),
      },
    };
  }

  const [logs, total] = await Promise.all([
    prisma.machine_print_log.findMany({
      where: dateFilter,
      orderBy: { plc_datetime: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.machine_print_log.count({ where: dateFilter }),
  ]);

  return NextResponse.json({
    logs: logs.map((log, index) => {
      const d = log.plc_datetime;
      const pad = (n: number) => n.toString().padStart(2, '0');
      return {
        srNo: (page - 1) * limit + index + 1,
        id: log.id.toString(),
        date: `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`,
        time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`,
        operatorName: log.operator_name || 'Unknown',
        modeAuto: log.mode_auto,
        modeManual: log.mode_manual,
        printDone: log.print_done,
      };
    }),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
