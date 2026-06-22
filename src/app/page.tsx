'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Printer,
  Cpu,
  Hand,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

type FilterType = 'today' | 'week' | 'month' | 'all';

interface DashboardData {
  totalPrints: number;
  autoModePrints: number;
  manualModePrints: number;
  printsDone: number;
  printsFailed: number;
  operatorStats: { name: string; count: number }[];
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
];

/* ------------------------------------------------------------------ */
/*  Skeleton helpers                                                   */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 h-4 w-24 rounded bg-gray-200" />
      <div className="h-8 w-20 rounded bg-gray-200" />
    </div>
  );
}

function SkeletonBar({ width }: { width: string }) {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 w-28 rounded bg-gray-200" />
      <div className="h-6 rounded bg-gray-200" style={{ width }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const [filter, setFilter] = useState<FilterType>('today');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /* ---- data fetching ---- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?filter=${filter}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: DashboardData = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  /* manual refresh with spin animation */
  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  /* ---- derived values ---- */
  const maxOperatorCount =
    data && data.operatorStats.length > 0
      ? Math.max(...data.operatorStats.map((o) => o.count))
      : 1;

  const totalModes = (data?.autoModePrints ?? 0) + (data?.manualModePrints ?? 0);
  const autoPct = totalModes > 0 ? (data!.autoModePrints / totalModes) * 100 : 0;
  const manualPct = totalModes > 0 ? (data!.manualModePrints / totalModes) * 100 : 0;

  /* ---- render ---- */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ---------- Header ---------- */}
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Activity className="h-6 w-6 text-blue-600" />
            Gluing Machine Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Real-time production monitoring &amp; analytics
          </p>
        </div>

        {/* ---------- Filter Bar ---------- */}
        <div className="mb-8 flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          {/* filter buttons */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  filter === f.key
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* last-updated + refresh */}
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {lastUpdated && (
              <span>
                Last updated:{' '}
                <span className="font-medium text-gray-700">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              </span>
            )}
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              title="Refresh now"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* ---------- Summary Cards ---------- */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {loading && !data ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              {/* Total Cycles */}
              <div className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Activity className="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-600" />
                  Total Cycles
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {data?.totalPrints.toLocaleString() ?? '—'}
                </p>
              </div>

              {/* Prints Done */}
              <div className="group rounded-xl border border-emerald-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 transition-colors group-hover:text-emerald-600" />
                  Prints Done
                </div>
                <p className="text-3xl font-bold text-emerald-700">
                  {data?.printsDone.toLocaleString() ?? '—'}
                </p>
              </div>

              {/* Prints Failed */}
              <div className="group rounded-xl border border-red-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-red-600">
                  <XCircle className="h-4 w-4 text-red-400 transition-colors group-hover:text-red-600" />
                  Prints Failed
                </div>
                <p className="text-3xl font-bold text-red-700">
                  {data?.printsFailed.toLocaleString() ?? '—'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* ---------- Bottom Grid: Operator Chart + Mode Distribution ---------- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Prints by Operator — spans 2 cols on large screens */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-6 flex items-center gap-2 text-base font-semibold text-gray-900">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Prints by Operator
            </h2>

            {loading && !data ? (
              <div className="space-y-5">
                <SkeletonBar width="90%" />
                <SkeletonBar width="65%" />
                <SkeletonBar width="40%" />
                <SkeletonBar width="75%" />
              </div>
            ) : data && data.operatorStats.length > 0 ? (
              <div className="space-y-4">
                {data.operatorStats.map((op) => {
                  const pct = (op.count / maxOperatorCount) * 100;
                  return (
                    <div key={op.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          {op.name}
                        </span>
                        <span className="tabular-nums text-gray-500">
                          {op.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700 ease-out"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">
                No operator data available for this period.
              </p>
            )}
          </div>

          {/* Mode Distribution */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-base font-semibold text-gray-900">
              <PieChart className="h-5 w-5 text-blue-500" />
              Mode Distribution
            </h2>

            {loading && !data ? (
              <div className="space-y-6">
                <SkeletonBar width="100%" />
                <SkeletonBar width="100%" />
              </div>
            ) : data ? (
              <div className="space-y-6">
                {/* Auto */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 font-medium text-blue-700">
                      <Cpu className="h-3.5 w-3.5" />
                      Auto
                    </span>
                    <span className="tabular-nums font-semibold text-blue-700">
                      {Math.round(autoPct)}%
                    </span>
                  </div>
                  <div className="h-5 w-full overflow-hidden rounded-full bg-blue-50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700 ease-out"
                      style={{ width: `${autoPct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {data.autoModePrints.toLocaleString()} prints
                  </p>
                </div>

                {/* Manual */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 font-medium text-amber-700">
                      <Hand className="h-3.5 w-3.5" />
                      Manual
                    </span>
                    <span className="tabular-nums font-semibold text-amber-700">
                      {Math.round(manualPct)}%
                    </span>
                  </div>
                  <div className="h-5 w-full overflow-hidden rounded-full bg-amber-50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-700 ease-out"
                      style={{ width: `${manualPct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {data.manualModePrints.toLocaleString()} prints
                  </p>
                </div>

                {/* Divider + total */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total</span>
                    <span className="font-semibold text-gray-900">
                      {totalModes.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">
                No mode data available.
              </p>
            )}
          </div>
        </div>

        {/* ---------- Footer ---------- */}
        <p className="mt-8 text-center text-xs text-gray-400">
          Auto-refreshes every 30 seconds &bull; Data sourced from PLC logs
        </p>
      </div>
    </div>
  );
}
