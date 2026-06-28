'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { getShopSessionAnalytics } from '@/services/analyticsService';
import { getShopOrders } from '@/services/orderService';
import { Card, KpiCard, Badge, Skeleton } from '@/components/ui/index';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { Users, Lock, Monitor, Search, Download } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
  Legend
} from 'recharts';

interface SessionRecord {
  id: string;
  session_id: string;
  owner_id: string;
  shop_slug: string;
  created_at: string;
  expires_at: string;
  device_info: string | null;
  ip_hash: string | null;
  items_viewed_count: number;
  items_added_count: number;
  cart_abandoned: boolean;
  order_placed: boolean;
  total_revenue: number;
  last_action_at: string;
}

export default function SessionAnalyticsPage() {
  const { owner } = useAuthStore();
  const { t, lang } = useTranslation('owner');

  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ordered' | 'abandoned' | 'browsing'>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!owner?.id) return;
    const ownerId = owner.id;
    
    async function loadData() {
      setLoading(true);
      try {
        const [sessionData, orderData] = await Promise.all([
          getShopSessionAnalytics(ownerId),
          getShopOrders(ownerId)
        ]);
        
        setSessions(sessionData as SessionRecord[]);
        setDbOrders(orderData);
      } catch (err) {
        console.error('Failed to load session analytics:', err);
        toast.error('Failed to load session metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [owner?.id]);

  if (owner && owner.plan !== 'business') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-surface border border-border rounded-2xl max-w-2xl mx-auto my-8 animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent mb-6">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="font-display font-bold text-2xl mb-3 text-white tracking-tight">
          {t.unlockSessionsTitle || 'Unlock Session Analytics'}
        </h2>
        <p className="text-muted text-sm max-w-md mb-8 leading-relaxed">
          {t.unlockSessionsDesc || 'See live customers browsing your menu, active session funnels, device breakdown, and export detailed CSV reports!'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-sm mb-8">
          <div className="p-4 bg-surface-2 border border-border rounded-xl text-left">
            <span className="text-accent flex items-center gap-1 mb-2">
              <Lock className="w-4 h-4" />
            </span>
            <p className="text-xs font-bold text-white mb-0.5">
              {t.sessionFunnelLabel || 'Session Funnel'}
            </p>
            <p className="text-[10px] text-muted font-medium">
              {t.trackCartAbandonmentDesc || 'Track cart abandonment'}
            </p>
          </div>
          <div className="p-4 bg-surface-2 border border-border rounded-xl text-left">
            <span className="text-accent flex items-center gap-1 mb-2">
              <Monitor className="w-4 h-4" />
            </span>
            <p className="text-xs font-bold text-white mb-0.5">
              {t.activeVisitorsLabel || 'Active Visitors'}
            </p>
            <p className="text-[10px] text-muted font-medium">
              {t.realTimeTrackingDesc || 'Real-time table tracking'}
            </p>
          </div>
        </div>
        <Button onClick={() => window.location.href = '/dashboard/billing'} className="w-full sm:w-auto">
          {t.upgradeToBusinessPlanBtn || 'Upgrade to Business Plan ⚡'}
        </Button>
      </div>
    );
  }

  // Generate realistic mock sessions for preview if database has 0 records
  const getDisplaySessions = (): SessionRecord[] => {
    if (sessions.length > 0) return sessions;

    // High quality mock data to avoid empty screen
    const now = new Date();
    const mock: SessionRecord[] = [];
    const devices = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15'
    ];

    for (let i = 0; i < 24; i++) {
      const createdTime = new Date(now.getTime() - i * 1.5 * 3600 * 1000);
      const isOrdered = i % 3 === 0;
      const isAbandoned = !isOrdered && i % 2 === 0;
      const viewed = Math.floor(2 + Math.random() * 8);
      const added = isOrdered ? Math.floor(1 + Math.random() * 4) : isAbandoned ? Math.floor(1 + Math.random() * 3) : 0;
      const rev = isOrdered ? (added * 80 + Math.floor(Math.random() * 50)) : 0;

      mock.push({
        id: `mock-id-${i}`,
        session_id: `sec_mock_${i}_${Math.random().toString(36).substring(4, 9)}`,
        owner_id: owner?.id || 'mock-owner',
        shop_slug: owner?.shop_slug || 'mock-shop',
        created_at: createdTime.toISOString(),
        expires_at: new Date(createdTime.getTime() + 24 * 3600 * 1000).toISOString(),
        device_info: devices[i % devices.length],
        ip_hash: 'hashed_ip_' + i,
        items_viewed_count: viewed,
        items_added_count: added,
        cart_abandoned: !isOrdered,
        order_placed: isOrdered,
        total_revenue: rev,
        last_action_at: new Date(createdTime.getTime() + 25 * 60 * 1000).toISOString()
      });
    }
    return mock;
  };

  const displaySessions = getDisplaySessions();

  const locale = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : lang === 'gu' ? 'gu-IN' : 'en-IN';

  // 1. Filter sessions by date
  const dateFiltered = displaySessions.filter(s => {
    const sessionDate = new Date(s.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - sessionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (dateFilter === 'today') {
      return sessionDate.toDateString() === now.toDateString();
    }
    if (dateFilter === '7d') {
      return diffDays <= 7;
    }
    if (dateFilter === '30d') {
      return diffDays <= 30;
    }
    return true;
  });

  // 2. Filter sessions by search & status
  const filteredSessions = dateFiltered.filter(s => {
    const statusVal = s.order_placed
      ? 'ordered'
      : s.items_added_count > 0
      ? 'abandoned'
      : 'browsing';
      
    const matchesStatus = statusFilter === 'all' || statusVal === statusFilter;
    
    // Parse device clean label
    const deviceLower = (s.device_info || '').toLowerCase();
    const deviceLabel = deviceLower.includes('iphone') || deviceLower.includes('android') ? 'Mobile' : 'Desktop';

    const matchesSearch = s.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          deviceLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.shop_slug || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // 3. Compute KPI Metrics
  const totalSessionCount = filteredSessions.length;
  const orderedSessions = filteredSessions.filter(s => s.order_placed);
  const conversionRate = totalSessionCount > 0 ? Math.round((orderedSessions.length / totalSessionCount) * 100) : 0;
  
  const abandonedSessions = filteredSessions.filter(s => s.items_added_count > 0 && !s.order_placed);
  const abandonmentRate = totalSessionCount > 0 ? Math.round((abandonedSessions.length / totalSessionCount) * 100) : 0;

  const totalRevenue = filteredSessions.reduce((acc, s) => acc + Number(s.total_revenue), 0);
  const averageOrderValue = orderedSessions.length > 0 ? Math.round(totalRevenue / orderedSessions.length) : 0;

  // Active Sessions right now (created in last 30 minutes)
  const activeNow = displaySessions.filter(s => {
    const actionDate = new Date(s.last_action_at);
    const diffMinutes = (Date.now() - actionDate.getTime()) / (1000 * 60);
    return diffMinutes <= 30 && new Date(s.expires_at) > new Date();
  }).length;

  // Conversion Funnel Data
  const funnelData = [
    { name: `1. ${t.scansTodayLabel || 'Scanned Menu'}`, count: totalSessionCount, fill: '#3b82f6' },
    { name: `2. ${t.cartAddsLabel || 'Added to Cart'}`, count: filteredSessions.filter(s => s.items_added_count > 0).length, fill: '#ffd166' },
    { name: `3. ${t.ordersPlacedLabel || 'Placed Order'}`, count: orderedSessions.length, fill: '#6366f1' },
  ];

  // Daily Scans and Orders Timeline (Chart)
  const timelineData = (() => {
    const days: Record<string, { scans: number; orders: number }> = {};
    
    filteredSessions.forEach(s => {
      const dateLabel = new Date(s.created_at).toLocaleDateString(locale, { day: '2-digit', month: 'short' });
      if (!days[dateLabel]) {
        days[dateLabel] = { scans: 0, orders: 0 };
      }
      days[dateLabel].scans += 1;
      if (s.order_placed) {
        days[dateLabel].orders += 1;
      }
    });

    return Object.entries(days).map(([date, val]) => ({
      date,
      [t.totalQrScans || 'Total Scans']: val.scans,
      [t.ordersPlacedLabel || 'Orders Placed']: val.orders
    })).reverse().slice(-7); // Last 7 unique days
  })();

  // Device Breakdown Data
  const deviceData = (() => {
    let mobile = 0;
    let desktop = 0;
    
    filteredSessions.forEach(s => {
      const ua = (s.device_info || '').toLowerCase();
      if (ua.includes('iphone') || ua.includes('android') || ua.includes('mobile')) {
        mobile++;
      } else {
        desktop++;
      }
    });
    const total = (mobile + desktop) || 1;
    return [
      { name: 'Mobile', value: mobile, percentage: Math.round((mobile / total) * 100), fill: '#6366f1' },
      { name: 'Desktop/Tablet', value: desktop, percentage: Math.round((desktop / total) * 100), fill: '#3b82f6' }
    ];
  })();

  const devNameMap: Record<string, string> = {
    'Mobile': t.mobileLabel || 'Mobile',
    'Desktop/Tablet': t.desktopTabletLabel || 'Desktop/Tablet'
  };

  // Average time spent (minutes)
  const avgTimeSpent = (() => {
    let totalMinutes = 0;
    let count = 0;
    filteredSessions.forEach(s => {
      const created = new Date(s.created_at).getTime();
      const last = new Date(s.last_action_at).getTime();
      const diffMin = (last - created) / (1000 * 60);
      if (diffMin > 0) {
        totalMinutes += diffMin;
        count++;
      }
    });
    return count > 0 ? Math.round(totalMinutes / count) : 3;
  })();

  // Export to CSV Function
  const exportToCSV = () => {
    try {
      const headers = [
        t.sessionId || 'Session ID',
        t.timeStartedLabel || 'Start Time',
        'Last Action',
        t.viewsLabel || 'Items Viewed',
        t.cartAddsLabel || 'Items Added',
        t.sessionStatus || 'Status',
        t.orderRevLabel || 'Revenue (INR)',
        t.deviceLabel || 'Device'
      ];
      const rows = filteredSessions.map(s => {
        const status = s.order_placed
          ? (t.orderedStatus || 'Ordered')
          : s.items_added_count > 0
          ? (t.abandonedStatus || 'Abandoned')
          : (t.browsingOnlyStatus || 'Browsing');
        const cleanDevice = (s.device_info || '').includes('Mobi')
          ? (t.mobileLabel || 'Mobile')
          : (t.desktopTabletLabel || 'Desktop/Tablet');
        return [
          s.session_id,
          new Date(s.created_at).toLocaleString(locale),
          new Date(s.last_action_at).toLocaleString(locale),
          s.items_viewed_count,
          s.items_added_count,
          status,
          s.total_revenue,
          cleanDevice
        ];
      });

      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `session_analytics_${dateFilter}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(lang === 'en' ? 'CSV exported successfully! 📊' : lang === 'hi' ? 'CSV सफलतापूर्वक निर्यात किया गया! 📊' : lang === 'mr' ? 'CSV यशस्वीरित्या निर्यात केले! 📊' : 'CSV સફળતાપૂર્વક નિકાસ કરવામાં આવ્યું! 📊');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export CSV.');
    }
  };

  // Pagination execution
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage) || 1;
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const dateLabelMap: Record<string, string> = {
    today: t.dateToday || 'Today',
    '7d': t.dateRange7d || '7 Days',
    '30d': t.dateRange30d || '30 Days',
    all: t.all || 'All',
  };

  const statusLabelMap = {
    ordered: t.orderedStatus || 'Ordered',
    abandoned: t.abandonedStatus || 'Abandoned',
    browsing: t.browsingOnlyStatus || 'Browsing Only'
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Filters Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" /> {t.sessionsTitle || 'Customer Sessions'}
            {sessions.length === 0 && (
              <Badge variant="blue" className="ml-2">{t.demoDataLabel || 'Demo Data'}</Badge>
            )}
          </h1>
          <p className="text-muted text-sm mt-1">{t.sessionsSubtitle || 'Track customer activity on your menu'}</p>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex bg-surface border border-border rounded-xl p-1 gap-1 text-xs">
            {(['today', '7d', '30d', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setDateFilter(f); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer border-none transition-all ${
                  dateFilter === f ? 'bg-white/10 text-white font-bold' : 'bg-transparent text-muted hover:text-white'
                }`}
              >
                {dateLabelMap[f]}
              </button>
            ))}
          </div>

          <Button onClick={exportToCSV} size="sm" variant="ghost" className="border-border text-sm flex items-center gap-1.5" leftIcon={<Download className="w-4 h-4" />}>
            {t.exportCsv || 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col justify-center p-5 border-l-4 border-l-accent relative overflow-hidden">
          <p className="text-[11px] text-muted font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
            {t.activeVisitors30m || 'Active Visitors (Last 30m)'}
          </p>
          <p className="font-display text-3xl font-bold text-white">{activeNow}</p>
          <p className="text-[10px] text-muted mt-2">{t.activeMenusOpenDesc || 'Active menus open currently'}</p>
        </Card>
        
        <KpiCard label={t.conversionRateLabel || 'Conversion Rate'} value={`${conversionRate}%`} color="blue" trend={`${orderedSessions.length} ${t.sessionsOrderedLabel || 'sessions ordered'}`} trendUp />
        
        <KpiCard label={t.cartAbandonmentLabel || 'Cart Abandonment'} value={`${abandonmentRate}%`} color="gold" trend={`${abandonedSessions.length} ${t.leftItemsInCartLabel || 'left items in cart'}`} />
        
        <KpiCard label={t.totalRevenueSessionLabel || 'Total Revenue (Session)'} value={`₹${totalRevenue}`} color="green" trend={`${t.avgLabel || 'Avg'} ₹${averageOrderValue} / ${t.orderLabel || 'order'}`} trendUp />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Timeline Activity Chart */}
        <div className="card lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-semibold text-white tracking-tight text-sm">{t.scanVsOrderLabel || 'Scan vs Order Activity'}</h3>
            <span className="text-xs text-muted">{t.last7ActiveDays || 'Last 7 Active Days'}</span>
          </div>
          <div className="h-64">
            {timelineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted text-xs">{t.noData || 'No data available'}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                  <XAxis dataKey="date" stroke="#888891" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888891" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f0f0f5', borderRadius: 8 }}
                    labelClassName="font-bold text-accent"
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" dataKey={t.totalQrScans || 'Total Scans'} stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey={t.ordersPlacedLabel || 'Orders Placed'} stroke="#6366f1" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Conversion Funnel Bar Chart */}
        <div className="card space-y-4">
          <h3 className="font-display font-semibold text-white tracking-tight text-sm">{t.customerConversionFunnel || 'Customer Conversion Funnel'}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" stroke="#888891" fontSize={10} hide />
                <YAxis type="category" dataKey="name" stroke="#888891" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f0f0f5', borderRadius: 8 }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="count" radius={8} barSize={20}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Device & Quality Metrics Row */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-5 space-y-4 flex flex-col justify-between">
          <h3 className="font-display font-semibold text-muted uppercase tracking-wider text-xs">{t.sessionQualityTitle || 'Session Quality'}</h3>
          <div className="space-y-4 my-2">
            <div className="flex justify-between items-center border-b border-border/40 pb-2">
              <span className="text-xs text-muted">{t.avgTimeSpentSession || 'Avg Time Spent / Session'}</span>
              <span className="text-sm font-bold text-white">{avgTimeSpent} {t.minutesShort || 'min'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/40 pb-2">
              <span className="text-xs text-muted">{t.avgItemsViewed || 'Avg Items Viewed'}</span>
              <span className="text-sm font-bold text-white">
                {Math.round(filteredSessions.reduce((acc, s) => acc + s.items_viewed_count, 0) / (totalSessionCount || 1))} {t.items || 'items'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="text-xs text-muted">{t.avgItemsInCart || 'Avg Items in Cart'}</span>
              <span className="text-sm font-bold text-white">
                {Math.round(filteredSessions.reduce((acc, s) => acc + s.items_added_count, 0) / (totalSessionCount || 1))} {t.items || 'items'}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-muted leading-relaxed">
            {t.sessionQualityDesc || 'High quality sessions (longer time, higher views) usually correlate with order placements.'}
          </div>
        </div>

        <div className="card p-5 space-y-4 md:col-span-2">
          <h3 className="font-display font-semibold text-white tracking-tight text-sm">{t.trafficSourceTitle || 'Traffic Source (Device Type)'}</h3>
          <div className="flex items-center justify-around h-28 gap-4 pt-2">
            {deviceData.map((dev) => (
              <div key={dev.name} className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto border border-border" style={{ backgroundColor: `${dev.fill}15`, color: dev.fill }}>
                  {dev.name === 'Mobile' ? '📱' : '💻'}
                </div>
                <p className="text-xs font-bold text-white">{devNameMap[dev.name] || dev.name}</p>
                <p className="text-[10px] text-muted">{dev.value} {t.sessions || 'sessions'} ({dev.percentage}%)</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session Log Table */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-display font-semibold text-white tracking-tight text-sm">{t.detailedSessionLog || 'Detailed Session Log'}</h3>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="flex items-center bg-surface border border-border rounded-xl px-3.5 py-2 gap-2 flex-1 sm:w-44 focus-within:border-accent/40 transition-all">
              <Search className="w-3.5 h-3.5 text-muted flex-shrink-0" />
              <input
                type="text"
                placeholder={t.searchSessionPlaceholder || 'Search session...'}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="bg-transparent outline-none text-xs text-[#f0f0f5] placeholder:text-muted/60 w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
              className="bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-[#f0f0f5] outline-none cursor-pointer focus:border-accent"
            >
              <option value="all">{t.allStatuses || 'All Statuses'}</option>
              <option value="ordered">{t.orderedStatus || 'Ordered'}</option>
              <option value="abandoned">{t.abandonedStatus || 'Abandoned'}</option>
              <option value="browsing">{t.browsingOnlyStatus || 'Browsing Only'}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-muted border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-[10px] uppercase text-muted font-bold tracking-wider">
                <th className="py-3 px-4">{t.sessionId || 'Session ID'}</th>
                <th className="py-3 px-4">{t.timeStartedLabel || 'Time Started'}</th>
                <th className="py-3 px-4">{t.viewsLabel || 'Views'}</th>
                <th className="py-3 px-4">{t.cartAddsLabel || 'Cart adds'}</th>
                <th className="py-3 px-4">{t.sessionStatus || 'Status'}</th>
                <th className="py-3 px-4 text-right">{t.orderRevLabel || 'Order Rev'}</th>
                <th className="py-3 px-4">{t.deviceLabel || 'Device'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-[#f0f0f5]">
              {paginatedSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted text-xs">{t.noSessions || 'No sessions yet'}</td>
                </tr>
              ) : (
                paginatedSessions.map((s) => {
                  const statusVal = s.order_placed
                    ? 'ordered'
                    : s.items_added_count > 0
                    ? 'abandoned'
                    : 'browsing';

                  const badgeVariants = {
                    ordered: 'green',
                    abandoned: 'red',
                    browsing: 'muted'
                  } as const;

                  const cleanDevice = (s.device_info || '').toLowerCase();
                  const deviceLabel = cleanDevice.includes('iphone') || cleanDevice.includes('android') || cleanDevice.includes('mobile')
                    ? 'Mobile'
                    : 'Desktop/Tablet';

                  return (
                    <tr key={s.id} className="hover:bg-white/[0.01]">
                      <td className="py-3.5 px-4 font-mono font-bold text-accent" title={s.session_id}>
                        {s.session_id.substring(0, 16)}...
                      </td>
                      <td className="py-3.5 px-4 text-muted">
                        {new Date(s.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                        <span className="text-[10px] text-muted/50 block">
                          {new Date(s.created_at).toLocaleDateString(locale, { day: '2-digit', month: 'short' })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold">{s.items_viewed_count}</td>
                      <td className="py-3.5 px-4 font-bold">{s.items_added_count}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={badgeVariants[statusVal]}>
                          {statusLabelMap[statusVal]}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-accent-2">
                        {s.order_placed ? `₹${s.total_revenue}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-muted">{devNameMap[deviceLabel] || deviceLabel}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Buttons */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 border-t border-border/30">
            <span className="text-[10px] text-muted">{t.pageLabel || 'Page'} {currentPage} {t.ofLabel || 'of'} {totalPages}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-border text-xs"
              >
                {t.previousBtn || 'Previous'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-border text-xs"
              >
                {t.nextBtn || 'Next'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
