import Link from 'next/link';
import { prisma } from '@/lib/db';
import { ChevronLeft, FileSpreadsheet } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LogsPage() {
  const logs = await prisma.machine_print_log.findMany({
    orderBy: { plc_datetime: 'desc' },
    take: 100, // Limit to recent 100 for performance
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Machine Logs</h1>
              <p className="text-gray-500 mt-1">Recent printing activities</p>
            </div>
          </div>
          <a href="/api/export" download className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-sm">
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Export to Excel
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Date & Time</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Operator</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Mode</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">No logs found</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id.toString()} className="hover:bg-gray-50 transition">
                      <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                        {log.plc_datetime.toLocaleString('en-GB')}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {log.operator_name || '-'}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {log.mode_auto ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Auto
                          </span>
                        ) : log.mode_manual ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Manual
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Unknown
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {log.print_done ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Printed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Not Printed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
