import Link from 'next/link';
import { prisma } from '@/lib/db';
import { BarChart2, List, FileSpreadsheet } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const totalPrints = await prisma.machine_print_log.count();
  const autoModePrints = await prisma.machine_print_log.count({ where: { mode_auto: true } });
  const manualModePrints = await prisma.machine_print_log.count({ where: { mode_manual: true } });

  // Group by Operator
  const operatorStats = await prisma.machine_print_log.groupBy({
    by: ['operator_name'],
    _count: { id: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gluing Machine Dashboard</h1>
            <p className="text-gray-500 mt-1">Real-time production and printing statistics</p>
          </div>
          <div className="flex space-x-4">
            <Link href="/logs" className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition">
              <List className="w-5 h-5 mr-2" />
              View Logs
            </Link>
            <a href="/api/export" download className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-sm">
              <FileSpreadsheet className="w-5 h-5 mr-2" />
              Export Excel
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <h3 className="text-gray-500 font-medium mb-2">Total Prints</h3>
            <p className="text-5xl font-bold text-gray-900">{totalPrints}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <h3 className="text-gray-500 font-medium mb-2">Auto Mode</h3>
            <p className="text-5xl font-bold text-blue-600">{autoModePrints}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <h3 className="text-gray-500 font-medium mb-2">Manual Mode</h3>
            <p className="text-5xl font-bold text-amber-500">{manualModePrints}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-gray-400" />
              Prints by Operator
            </h3>
            <div className="space-y-4">
              {operatorStats.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No data available</p>
              ) : (
                operatorStats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{stat.operator_name || 'Unknown'}</span>
                    <div className="flex-1 mx-4">
                      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${Math.max(5, (stat._count.id / totalPrints) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 w-12 text-right">{stat._count.id}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-gray-900 mb-6">Mode Distribution</h3>
             <div className="flex items-center justify-center h-48 space-x-8">
                {/* Simple pure CSS bar visualization for Auto vs Manual instead of complex Recharts to ensure robustness */}
                <div className="flex flex-col items-center justify-end h-full w-24">
                  <div className="w-full bg-blue-500 rounded-t-lg transition-all" style={{ height: `${totalPrints ? (autoModePrints/totalPrints)*100 : 0}%`, minHeight: '4px' }}></div>
                  <span className="mt-4 font-medium text-gray-700">Auto</span>
                  <span className="text-sm text-gray-500">{totalPrints ? Math.round((autoModePrints/totalPrints)*100) : 0}%</span>
                </div>
                <div className="flex flex-col items-center justify-end h-full w-24">
                  <div className="w-full bg-amber-500 rounded-t-lg transition-all" style={{ height: `${totalPrints ? (manualModePrints/totalPrints)*100 : 0}%`, minHeight: '4px' }}></div>
                  <span className="mt-4 font-medium text-gray-700">Manual</span>
                  <span className="text-sm text-gray-500">{totalPrints ? Math.round((manualModePrints/totalPrints)*100) : 0}%</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
