'use client';
import { useEffect } from 'react';
import { KpiCard } from '@/components/ui/index';
import { Button } from '@/components/ui/Button';
import { useAnalyticsStore, useAuthStore } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils';
import dynamic from 'next/dynamic';

const AnalyticsChart = dynamic(() => import('@/components/features/analytics/AnalyticsChart'), {
  ssr: false,
  loading: () => <div className="h-[180px] w-full bg-surface-2/40 animate-pulse rounded-xl" />
});

export default function AnalyticsPage() {
  const { owner } = useAuthStore();
  const { data, dateRange, setDateRange, fetchAnalytics } = useAnalyticsStore();
  const { t, lang } = useTranslation('owner');

  useEffect(() => {
    if (owner?.id) {
      fetchAnalytics(owner.id, dateRange);
    }
  }, [owner?.id, dateRange, fetchAnalytics]);

  const translatePeakDay = (peakDayStr: string) => {
    if (!peakDayStr) return '';
    // e.g. "Wed (19 scans)"
    const match = peakDayStr.match(/^([A-Za-z]+)\s*\((\d+)\s*scans?\)$/);
    if (!match) return peakDayStr;
    const [_, dayName, scans] = match;
    
    const dayMap: Record<string, string> = {
      Mon: lang === 'en' ? 'Mon' : lang === 'hi' ? 'सोम' : lang === 'mr' ? 'सोम' : 'સોમ',
      Tue: lang === 'en' ? 'Tue' : lang === 'hi' ? 'मंगल' : lang === 'mr' ? 'मंगळ' : 'મંગળ',
      Wed: lang === 'en' ? 'Wed' : lang === 'hi' ? 'बुध' : lang === 'mr' ? 'बुध' : 'બુધ',
      Thu: lang === 'en' ? 'Thu' : lang === 'hi' ? 'गुरु' : lang === 'mr' ? 'गुरु' : 'ગુરૂ',
      Fri: lang === 'en' ? 'Fri' : lang === 'hi' ? 'शुक्र' : lang === 'mr' ? 'शुक्र' : 'શુક્ર',
      Sat: lang === 'en' ? 'Sat' : lang === 'hi' ? 'शनि' : lang === 'mr' ? 'शनि' : 'શનિ',
      Sun: lang === 'en' ? 'Sun' : lang === 'hi' ? 'रवि' : lang === 'mr' ? 'रवि' : 'રવિ',
      Monday: lang === 'en' ? 'Monday' : lang === 'hi' ? 'सोमवार' : lang === 'mr' ? 'सोमवार' : 'સોમવાર',
      Tuesday: lang === 'en' ? 'Tuesday' : lang === 'hi' ? 'मंगलवार' : lang === 'mr' ? 'मंगळवार' : 'મંગળવાર',
      Wednesday: lang === 'en' ? 'Wednesday' : lang === 'hi' ? 'बुधवार' : lang === 'mr' ? 'बुधवार' : 'બુધવાર',
      Thursday: lang === 'en' ? 'Thursday' : lang === 'hi' ? 'गुरुवार' : lang === 'mr' ? 'गुरुवार' : 'ગુરૂવાર',
      Friday: lang === 'en' ? 'Friday' : lang === 'hi' ? 'शुक्रवार' : lang === 'mr' ? 'शुक्रवार' : 'શુક્રવાર',
      Saturday: lang === 'en' ? 'Saturday' : lang === 'hi' ? 'शनिवार' : lang === 'mr' ? 'शनिवार' : 'શનિવાર',
      Sunday: lang === 'en' ? 'Sunday' : lang === 'hi' ? 'रविवार' : lang === 'mr' ? 'रविवार' : 'રવિવાર',
    };

    const scansLabel = lang === 'en' ? 'scans' : lang === 'hi' ? 'स्कैन' : lang === 'mr' ? 'स्कॅन' : 'સ્કૅન';
    const translatedDay = dayMap[dayName] || dayName;
    return `${translatedDay} (${scans} ${scansLabel})`;
  };

  const translatePeakHourLabel = (label: string) => {
    if (label === 'Other') return t.otherLabel || 'Other';
    const timeMap: Record<string, string> = {
      '8–10 AM': lang === 'en' ? '8–10 AM' : lang === 'hi' ? 'सुबह 8–10' : lang === 'mr' ? 'सकाळी 8–10' : 'સવારે 8–10',
      '12–2 PM': lang === 'en' ? '12–2 PM' : lang === 'hi' ? 'दोपहर 12–2' : lang === 'mr' ? 'दुपारी 12–2' : 'બપોરે 12–2',
      '4–6 PM': lang === 'en' ? '4–6 PM' : lang === 'hi' ? 'शाम 4–6' : lang === 'mr' ? 'संध्या. 4–6' : 'સાંજે 4–6',
      '7–9 PM': lang === 'en' ? '7–9 PM' : lang === 'hi' ? 'रात 7–9' : lang === 'mr' ? 'रात्री 7–9' : 'રાત્રે 7–9',
    };
    return timeMap[label] || label;
  };

  if (owner?.plan === 'free') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-surface border border-border rounded-2xl max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-3xl mb-6 animate-bounce">
          📈
        </div>
        <h2 className="font-display font-black text-2xl mb-3 text-[#f0f0f5]">{t.unlockAnalytics}</h2>
        <p className="text-muted text-sm max-w-md mb-8 leading-relaxed">
          {t.unlockAnalyticsDesc}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-sm mb-8">
          <div className="p-4 bg-surface-2 border border-border rounded-xl">
            <span className="text-xl">📊</span>
            <p className="text-xs font-bold mt-1 text-[#f0f0f5]">{t.scanTracking}</p>
            <p className="text-[10px] text-muted">{t.scanTrackingDesc}</p>
          </div>
          <div className="p-4 bg-surface-2 border border-border rounded-xl">
            <span className="text-xl">🔥</span>
            <p className="text-xs font-bold mt-1 text-[#f0f0f5]">{t.peakHours}</p>
            <p className="text-[10px] text-muted">{t.peakHoursDesc}</p>
          </div>
        </div>
        <Button onClick={() => window.location.href = '/dashboard/billing'} className="w-full sm:w-auto">
          {t.upgradeToPro}
        </Button>
      </div>
    );
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-[300px]">{t.loadingAnalytics}</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-2xl">{t.analyticsTitle}</h1>
          <p className="text-muted text-sm mt-1">{t.analyticsSubtitle}</p>
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
              {r === '7d' ? (t.dateRange7d || '7 Days') : r === '30d' ? (t.dateRange30d || '30 Days') : (t.dateRange3m || '3 Months')}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label={t.totalScansLabel || 'Total Scans'}      value={data.totalScans.toLocaleString()} color="green" />
        <KpiCard label={t.uniqueVisitors || 'Unique Visitors'}  value={data.uniqueVisitors.toLocaleString()} color="blue" />
        <KpiCard label={t.avgDailyScans || 'Avg. Daily Scans'} value={data.avgDailyScans} color="purple" />
        <KpiCard label={t.peakDayLabel || 'Peak Day'}         value={translatePeakDay(data.peakDay)} color="gold" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-5 mb-5">
        {/* Bar Chart */}
        <div className="card">
          <h3 className="font-display font-bold mb-5">{t.dailyScans7d || 'Daily Scans — Last 7 Days'}</h3>
          <AnalyticsChart data={data.weeklySeries} />
        </div>

        {/* Peak Hours */}
        <div className="card">
          <h3 className="font-display font-bold mb-4">{t.peakHours || 'Peak Hours'}</h3>
          <div className="space-y-3">
            {data.peakHours.map((ph) => (
              <div key={ph.label} className="flex items-center gap-3">
                <span className="text-xs text-muted w-16 flex-shrink-0">{translatePeakHourLabel(ph.label)}</span>
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
        <h3 className="font-display font-bold mb-4">{t.topItems || 'Most Viewed Items'}</h3>
        <div className="space-y-1">
          {data.topItems.map((item: { id: string; emoji: string; name: string; views: number; percentage: number }) => (
            <div key={item.id} className="flex items-center gap-4 py-3 border-b border-border/40 last:border-0">
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted">{item.views.toLocaleString()} {t.viewsLabel || 'views'}</p>
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
