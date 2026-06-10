'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { KpiCard } from '@/components/ui/index';
import { Button } from '@/components/ui/Button';
import { useAnalyticsStore, useAuthStore, useMenuStore } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

const AnalyticsChart = dynamic(() => import('@/components/features/analytics/AnalyticsChart'), {
  ssr: false,
  loading: () => <div className="h-[160px] w-full bg-surface-2/40 animate-pulse rounded-xl" />
});

export default function OverviewPage() {
  const { data } = useAnalyticsStore();
  const { owner } = useAuthStore();
  const { t } = useTranslation('owner');
  const { itemCount, fetchItems } = useMenuStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [waiterCalls, setWaiterCalls] = useState<any[]>([]);

  useEffect(() => {
    if (!owner?.id) return;

    // Fetch existing pending calls
    const fetchPendingCalls = async () => {
      const { data, error } = await supabase
        .from('waiter_calls')
        .select('*')
        .eq('owner_id', owner.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching waiter calls:', error);
      } else if (data) {
        setWaiterCalls(data);
      }
    };

    fetchPendingCalls();

    // Subscribe to real-time additions and updates of waiter_calls
    const channel = supabase
      .channel(`waiter-calls-owner-overview-${owner.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waiter_calls',
          filter: `owner_id=eq.${owner.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCall = payload.new as any;
            if (newCall.status === 'pending') {
              setWaiterCalls((prev) => {
                if (prev.some((c) => c.id === newCall.id)) return prev;
                return [newCall, ...prev];
              });
              try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav');
                audio.volume = 0.5;
                audio.play().catch(e => console.log('Audio playback pending interaction:', e));
              } catch (err) {
                console.error('Audio play blocked or failed:', err);
              }
              toast.success(`🛎️ Waiter requested at Table ${newCall.table_number}!`, {
                duration: 6000,
                position: 'top-right',
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedCall = payload.new as any;
            if (updatedCall.status === 'resolved') {
              setWaiterCalls((prev) => prev.filter((c) => c.id !== updatedCall.id));
            } else {
              setWaiterCalls((prev) =>
                prev.map((c) => (c.id === updatedCall.id ? updatedCall : c))
              );
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setWaiterCalls((prev) => prev.filter((c) => c.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [owner?.id]);

  const resolveWaiterCall = async (callId: string) => {
    const toastId = toast.loading('Resolving call...');
    try {
      const { error } = await supabase
        .from('waiter_calls')
        .update({ status: 'resolved' })
        .eq('id', callId);

      if (error) throw error;

      setWaiterCalls((prev) => prev.filter((c) => c.id !== callId));
      toast.success('Call resolved! 🛎️', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Failed to resolve call', { id: toastId });
    }
  };

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
    return <div className="flex items-center justify-center min-h-[300px]">{t.loadingOverview}</div>;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.goodMorning : hour < 17 ? t.goodAfternoon : t.goodEvening;

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
          <p className="text-muted text-sm mt-1">{t.overviewSubtitle}</p>
        </div>
        <Link href="/dashboard/menu">
          <Button size="sm">{t.addItem}</Button>
        </Link>
      </div>
      {/* Active Waiter Calls Alert Panel */}
      {waiterCalls.length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-gold/10 to-amber/5 border border-gold/30 rounded-3xl backdrop-blur-md relative overflow-hidden animate-fade-in">
          <div className="absolute w-60 h-60 rounded-full bg-gold blur-[100px] opacity-[0.05] -top-12 -left-12 pointer-events-none" />
          <div className="flex items-center gap-2.5 mb-5">
            <span className="text-2xl animate-bounce">🛎️</span>
            <div>
              <h2 className="font-display font-black text-base text-[#f0f0f5]">{t.activeWaiterRequests}</h2>
              <p className="text-[11px] text-muted">{t.activeWaiterSubtitle}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {waiterCalls.map((call) => (
              <div
                key={call.id}
                className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between shadow-lg hover:border-gold/30 transition-all"
              >
                <div>
                  <span className="text-xs text-muted font-sans uppercase tracking-wider block">{t.table}</span>
                  <span className="font-display font-extrabold text-lg text-gold">{call.table_number}</span>
                  <span className="text-[9px] text-muted block mt-0.5">
                    {new Date(call.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <button
                  onClick={() => resolveWaiterCall(call.id)}
                  className="bg-gold/10 hover:bg-gold border border-gold/20 hover:border-gold text-gold hover:text-bg font-bold text-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer font-sans"
                >
                  {t.done}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label={t.totalQrScans}  value={data.totalScans.toLocaleString()} color="green" />
        <KpiCard label={t.todayScans}    value={data.todayScans}                  color="blue" />
        <KpiCard label={t.menuItemsCount} value={itemCount}                       trend={`${Math.max(0, 10 - itemCount)} ${t.slotsRemaining}`} color="purple" />
        <KpiCard label={t.thisMonth}      value={data.monthScans.toLocaleString()} color="gold" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-5">
        {/* Weekly Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold">{t.weeklyScans}</h3>
            <span className="badge badge-green text-[10px]">{t.live}</span>
          </div>
          <AnalyticsChart data={data.weeklySeries} />
        </div>

        {/* Recent Orders Tracker */}
        <div className="card">
          <h3 className="font-display font-bold mb-4">{t.recentOrders}</h3>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">{t.noRecentOrders}</p>
            ) : (
              recentOrders.map((o) => (
                <div key={o.id} className="flex flex-col gap-1.5 py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold bg-accent-2/15 text-accent-2 px-2 py-0.5 rounded-full">{o.table}</span>
                    <span className="text-[10px] text-muted">{o.date?.split(',')[1] || t.justNow}</span>
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
                      {o.status === 'completed' ? t.completed : t.markComplete}
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
