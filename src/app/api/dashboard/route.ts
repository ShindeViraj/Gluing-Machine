import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'today';
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    let dateFilter: Record<string, unknown> = {};
    const now = new Date();

    if (startDate && endDate) {
      dateFilter = {
        plc_datetime: {
          gte: new Date(startDate),
          lte: new Date(endDate + 'T23:59:59'),
        },
      };
    } else {
      switch (filter) {
        case 'today': {
          const todayStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          dateFilter = { plc_datetime: { gte: todayStart } };
          break;
        }
        case 'week': {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          dateFilter = { plc_datetime: { gte: weekStart } };
          break;
        }
        case 'month': {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          dateFilter = { plc_datetime: { gte: monthStart } };
          break;
        }
        case 'all':
        default:
          dateFilter = {};
          break;
      }
    }

    const [totalPrints, autoModePrints, manualModePrints, operatorStats] =
      await Promise.all([
        prisma.machine_print_log.count({ where: dateFilter }),
        prisma.machine_print_log.count({
          where: { ...dateFilter, mode_auto: true },
        }),
        prisma.machine_print_log.count({
          where: { ...dateFilter, mode_manual: true },
        }),
        prisma.machine_print_log.groupBy({
          by: ['operator_name'],
          where: dateFilter,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),
      ]);

    return NextResponse.json({
      totalPrints,
      autoModePrints,
      manualModePrints,
      operatorStats: operatorStats.map((s) => ({
        name: s.operator_name || 'Unknown',
        count: s._count.id,
      })),
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
