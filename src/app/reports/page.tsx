'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  ClipboardList,
} from 'lucide-react';

interface LogEntry {
  srNo: number;
  id: string;
  date: string;
  time: string;
  operatorName: string;
  modeAuto: boolean;
  modeManual: boolean;
  printDone: boolean;
}

interface LogsResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  totalPages: number;
}

/* ── helpers ── */

function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function monthLabel(m: number): string {
  return [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ][m];
}

/** Returns [startDate, endDate] in YYYY-MM-DD format for a given month/year */
function monthRange(month: number, year: number): [string, string] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  return [formatDateInput(first), formatDateInput(last)];
}

/** Check if date range exceeds 6 months */
function exceedsSixMonths(start: string, end: string): boolean {
  const s = new Date(start);
  const e = new Date(end);
  const diffMs = e.getTime() - s.getTime();
  const sixMonthsMs = 6 * 30 * 24 * 60 * 60 * 1000; // ~180 days
  return diffMs > sixMonthsMs;
}

/* ── types ── */
type ReportMode = 'custom' | 'monthly';

/* ── component ── */
export default function ReportsPage() {
  const today = new Date();

  // Mode
  const [mode, setMode] = useState<ReportMode>('custom');

  // Custom mode
  const [startDate, setStartDate] = useState(formatDateInput(today));
  const [endDate, setEndDate] = useState(formatDateInput(today));
  const [rangeError, setRangeError] = useState('');

  // Monthly mode
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Applied filter (what is actually queried)
  const [appliedStart, setAppliedStart] = useState(formatDateInput(today));
  const [appliedEnd, setAppliedEnd] = useState(formatDateInput(today));

  // Data
  const [page, setPage] = useState(1);
  const [data, setData] = useState<LogsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const limit = 50;

  /* ── fetch ── */
  const fetchLogs = useCallback(
    async (start: string, end: string, p: number) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/logs?start=${start}&end=${end}&page=${p}&limit=${limit}`
        );
        const json: LogsResponse = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchLogs(appliedStart, appliedEnd, page);
  }, [appliedStart, appliedEnd, page, fetchLogs]);

  /* ── actions ── */
  const applyCustom = () => {
    if (exceedsSixMonths(startDate, endDate)) {
      setRangeError('Date range cannot exceed 6 months.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setRangeError('Start date must be before end date.');
      return;
    }
    setRangeError('');
    setAppliedStart(startDate);
    setAppliedEnd(endDate);
    setPage(1);
  };

  const applyMonthly = () => {
    const [s, e] = monthRange(selectedMonth, selectedYear);
    setAppliedStart(s);
    setAppliedEnd(e);
    setPage(1);
  };

  // Auto-apply when switching modes
  useEffect(() => {
    if (mode === 'monthly') {
      applyMonthly();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedMonth, selectedYear]);

  const exportUrl = `/api/export?start=${appliedStart}&end=${appliedEnd}`;

  // Build year options (current year back to 2020)
  const yearOptions: number[] = [];
  for (let y = today.getFullYear(); y >= 2020; y--) {
    yearOptions.push(y);
  }

  /* ── render ── */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ClipboardList className="h-6 w-6 text-blue-600" />
            Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and export machine print logs
          </p>
        </div>

        {/* Export Button */}
        <a
          href={exportUrl}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          <FileSpreadsheet className="h-5 w-5" />
          Export to Excel
        </a>
      </div>

      {/* Report Mode Selector */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Mode Tabs */}
        <div className="mb-5 flex gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setMode('custom')}
            className={`flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${
              mode === 'custom'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="mr-2 inline h-4 w-4" />
            Custom Report
          </button>
          <button
            onClick={() => setMode('monthly')}
            className={`flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${
              mode === 'monthly'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="mr-2 inline h-4 w-4" />
            Monthly Report
          </button>
        </div>

        {/* Custom Mode */}
        {mode === 'custom' && (
          <div>
            <p className="mb-4 text-sm text-gray-500">
              Select a start and end date to generate a custom report.
              Maximum range: <strong>6 months</strong>.
            </p>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setRangeError('');
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setRangeError('');
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={applyCustom}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Generate Report
              </button>
            </div>
            {rangeError && (
              <p className="mt-3 text-sm font-medium text-red-600">
                ⚠ {rangeError}
              </p>
            )}
          </div>
        )}

        {/* Monthly Mode */}
        {mode === 'monthly' && (
          <div>
            <p className="mb-4 text-sm text-gray-500">
              Select a month and year to view the full month&apos;s report.
            </p>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {monthLabel(i)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Table Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="text-sm text-gray-600">
            {data ? (
              <>
                Showing{' '}
                <span className="font-semibold text-gray-900">
                  {data.total > 0 ? (data.page - 1) * limit + 1 : 0}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-gray-900">
                  {Math.min(data.page * limit, data.total)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-gray-900">
                  {data.total.toLocaleString()}
                </span>{' '}
                records
              </>
            ) : (
              'Loading...'
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-gray-600">
                  Sr. No.
                </th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-gray-600">
                  Date
                </th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-gray-600">
                  Time
                </th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-gray-600">
                  Operator Name
                </th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-gray-600">
                  Mode
                </th>
                <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-gray-600">
                  Print Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                      <span className="text-sm">Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : data && data.logs.length > 0 ? (
                data.logs.map((log, idx) => (
                  <tr
                    key={log.id}
                    className={`border-b border-gray-100 transition-colors hover:bg-blue-50/40 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-500">
                      {log.srNo}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-gray-700">
                      {log.date}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-gray-700">
                      {log.time}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-900">
                      {log.operatorName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      {log.modeAuto ? (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                          Auto
                        </span>
                      ) : log.modeManual ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                          Manual
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      {log.printDone ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          Done
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                          Not Done
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center text-sm text-gray-400"
                  >
                    No records found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
            <span className="text-sm text-gray-600">
              Page{' '}
              <span className="font-semibold text-gray-900">{data.page}</span>{' '}
              of{' '}
              <span className="font-semibold text-gray-900">
                {data.totalPages}
              </span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(data.totalPages, p + 1))
                }
                disabled={page >= data.totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
