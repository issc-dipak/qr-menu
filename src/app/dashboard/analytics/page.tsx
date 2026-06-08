'use client';
import { KpiCard } from '@/components/ui/index';
import { Button } from '@/components/ui/Button';
import { useAnalyticsStore, useAuthStore } from '@/store';
import { cn } from '@/utils';
import dynamic from 'next/dynamic';

const AnalyticsChart = dynamic(() => import('@/components/features/analytics/AnalyticsChart'), {
  ssr: false,
  loading: () => <div className="h-[180px] w-full bg-surface-2/40 animate-pulse rounded-xl" />
});

export default function AnalyticsPage() {
  const { owner } = useAuthStore();
  const { data, dateRange, setDateRange } = useAnalyticsStore();

  if (owner?.plan === 'free') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-surface border border-border rounded-2xl max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-3xl mb-6 animate-bounce">
          📈
        </div>
        <h2 className="font-display font-black text-2xl mb-3 text-[#f0f0f5]">Unlock Analytics</h2>
        <p className="text-muted text-sm max-w-md mb-8 leading-relaxed">
          Get detailed insights on how many customers scan your QR menu, daily trends, peak hours, and your most popular items!
        </p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
          <div className="p-4 bg-surface-2 border border-border rounded-xl">
            <span className="text-xl">📊</span>
            <p className="text-xs font-bold mt-1 text-[#f0f0f5]">Scan Tracking</p>
            <p className="text-[10px] text-muted">Daily & hourly counts</p>
          </div>
          <div className="p-4 bg-surface-2 border border-border rounded-xl">
            <span className="text-xl">🔥</span>
            <p className="text-xs font-bold mt-1 text-[#f0f0f5]">Peak Hours</p>
            <p className="text-[10px] text-muted">Know when you are busy</p>
          </div>
        </div>
        <Button onClick={() => window.location.href = '/dashboard/billing'}>
          Upgrade to Pro/Business ⚡
        </Button>
      </div>
    );
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-[300px]">Loading analytics...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-2xl">Analytics</h1>
          <p className="text-muted text-sm mt-1">Understand your customers better</p>
        </div>
        <div className="flex bg-surface border border-border rounded-xl p-1 gap-1">
          {(['7d', '30d', '3m'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-medium transition-all border-none font-sans cursor-pointer',
                dateRange === r ? 'bg-surface-2 text-[#f0f0f5]' : 'bg-transparent text-muted hover:text-[#f0f0f5]'
              )}
            >
              {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '3 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Scans"      value={data.totalScans.toLocaleString()} color="green" />
        <KpiCard label="Unique Visitors"  value={data.uniqueVisitors.toLocaleString()} color="blue" />
        <KpiCard label="Avg. Daily Scans" value={data.avgDailyScans} color="purple" />
        <KpiCard label="Peak Day"         value={data.peakDay} color="gold" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-5 mb-5">
        {/* Bar Chart */}
        <div className="card">
          <h3 className="font-display font-bold mb-5">Daily Scans — Last 7 Days</h3>
          <AnalyticsChart data={data.weeklySeries} />
        </div>

        {/* Peak Hours */}
        <div className="card">
          <h3 className="font-display font-bold mb-4">Peak Hours</h3>
          <div className="space-y-3">
            {data.peakHours.map((ph) => (
              <div key={ph.label} className="flex items-center gap-3">
                <span className="text-xs text-muted w-16 flex-shrink-0">{ph.label}</span>
                <div className="flex-1 bg-surface-2 rounded h-2">
                  <div
                    className="h-2 rounded bg-gradient-to-r from-accent to-accent-2 transition-all"
                    style={{ width: `${ph.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-semibold w-8 text-right">{ph.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Items */}
      <div className="card">
        <h3 className="font-display font-bold mb-4">Most Viewed Items</h3>
        <div className="space-y-1">
          {data.topItems.map((item: { id: string; emoji: string; name: string; views: number; percentage: number }) => (
            <div key={item.id} className="flex items-center gap-4 py-3 border-b border-border/40 last:border-0">
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted">{item.views.toLocaleString()} views</p>
              </div>
              <div className="w-24 bg-surface-2 rounded h-1.5">
                <div className="h-1.5 rounded bg-accent transition-all" style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
