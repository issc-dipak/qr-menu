'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { KpiCard } from '@/components/ui/index';
import { Button } from '@/components/ui/Button';
import { useAnalyticsStore, useAuthStore, useMenuStore } from '@/store';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

const AnalyticsChart = dynamic(() => import('@/components/features/analytics/AnalyticsChart'), {
  ssr: false,
  loading: () => <div className="h-[160px] w-full bg-surface-2/40 animate-pulse rounded-xl" />
});

export default function OverviewPage() {
  const { data } = useAnalyticsStore();
  const { owner } = useAuthStore();
  const { itemCount, fetchItems } = useMenuStore();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (owner) {
      fetchItems(owner.id);
    }
  }, [owner, fetchItems]);

  useEffect(() => {
    const local = localStorage.getItem('owner-orders-history');
    if (local) {
      setOrders(JSON.parse(local));
    } else {
      setOrders([]);
    }
  }, []);

  if (!data) {
    return <div className="flex items-center justify-center min-h-[300px]">Loading overview...</div>;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const toggleOrderStatus = (id: string) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: 'completed', paymentStatus: 'paid' } : o);
    setOrders(updated);
    localStorage.setItem('owner-orders-history', JSON.stringify(updated));
    toast.success(`Order status updated to Completed! 🎉`);
  };

  const recentOrders = orders.slice(0, 3);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-2xl">{greeting}, {owner?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-muted text-sm mt-1">Here&apos;s what&apos;s happening with your menu today.</p>
        </div>
        <Link href="/dashboard/menu">
          <Button size="sm">+ Add Item</Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total QR Scans"  value={data.totalScans.toLocaleString()} color="green" />
        <KpiCard label="Today's Scans"   value={data.todayScans}                  color="blue" />
        <KpiCard label="Menu Items"       value={itemCount}                        trend={`${Math.max(0, 10 - itemCount)} slots remaining`} color="purple" />
        <KpiCard label="This Month"       value={data.monthScans.toLocaleString()} color="gold" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-5">
        {/* Weekly Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold">Weekly Scans</h3>
            <span className="badge badge-green text-[10px]">● Live</span>
          </div>
          <AnalyticsChart data={data.weeklySeries} />
        </div>

        {/* Recent Orders Tracker */}
        <div className="card">
          <h3 className="font-display font-bold mb-4">Recent Orders (Realtime)</h3>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">No recent orders yet.</p>
            ) : (
              recentOrders.map((o) => (
                <div key={o.id} className="flex flex-col gap-1.5 py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold bg-accent-2/15 text-accent-2 px-2 py-0.5 rounded-full">{o.table}</span>
                    <span className="text-[10px] text-muted">{o.date?.split(',')[1] || 'Just now'}</span>
                  </div>
                  <p className="text-xs font-medium text-[#f0f0f5]">{o.items}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-bold text-accent">₹{o.total}</span>
                    <button
                      onClick={() => o.status !== 'completed' && toggleOrderStatus(o.id)}
                      disabled={o.status === 'completed'}
                      className={`text-[10px] px-2 py-1 rounded font-bold border transition-all cursor-pointer ${
                        o.status === 'completed'
                          ? 'bg-accent/10 border-accent/20 text-accent cursor-default'
                          : 'bg-surface border-border text-muted hover:border-accent'
                      }`}
                    >
                      {o.status === 'completed' ? '✓ Completed' : 'Mark Complete'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
