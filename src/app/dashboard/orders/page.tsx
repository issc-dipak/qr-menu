'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { cn } from '@/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { useAuthStore } from '@/store';
import { supabase } from '@/lib/supabase';
import type { WaiterCall } from '@/types/supabase';

interface OrderRecord {
  id: string;
  table: string;
  items: string;
  total: number;
  date: string;
  status: 'completed' | 'cancelled' | 'pending';
  paymentStatus: 'paid' | 'unpaid';
  instructions?: string | null;
}

const parseOrderDate = (dateStr: string): Date | null => {
  try {
    const cleaned = dateStr.replace(/,/g, '');
    const parts = cleaned.split(/\s+/);
    if (parts.length < 4) return null;

    const day = parseInt(parts[0], 10);
    const monthStr = parts[1];
    const year = parseInt(parts[2], 10);
    const timeStr = parts[3];
    const ampm = parts[4]?.toLowerCase();

    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const month = months[monthStr.toLowerCase().substring(0, 3)];
    if (month === undefined) return null;

    const timeParts = timeStr.split(':');
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    return new Date(year, month, day, hours, minutes);
  } catch (e) {
    console.error('Failed to parse date:', dateStr, e);
    return null;
  }
};

const parseOrderItems = (itemsStr: string) => {
  return itemsStr.split(',').map((item) => {
    const trimmed = item.trim();
    const match = trimmed.match(/^(\d+)\s*x\s*(.+)$/i);
    if (match) {
      return {
        quantity: parseInt(match[1], 10),
        name: match[2],
      };
    }
    return {
      quantity: 1,
      name: trimmed,
    };
  });
};

interface ChartDataPoint {
  label: string;
  sales: number;
  count: number;
}

const getChartData = (filteredOrders: OrderRecord[], dateFilter: string): ChartDataPoint[] => {
  const data: Record<string, { sales: number; count: number }> = {};

  if (dateFilter === 'today' || dateFilter === 'yesterday') {
    for (let i = 0; i < 24; i += 2) {
      const label = `${String(i).padStart(2, '0')}:00`;
      data[label] = { sales: 0, count: 0 };
    }

    filteredOrders.forEach((o) => {
      const d = parseOrderDate(o.date);
      if (!d) return;
      const hour = d.getHours();
      const roundedHour = Math.floor(hour / 2) * 2;
      const label = `${String(roundedHour).padStart(2, '0')}:00`;
      if (data[label]) {
        data[label].sales += o.total;
        data[label].count += 1;
      }
    });
  } else if (dateFilter === 'month') {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      data[`${i}`] = { sales: 0, count: 0 };
    }

    filteredOrders.forEach((o) => {
      const d = parseOrderDate(o.date);
      if (!d) return;
      const day = d.getDate();
      const label = `${day}`;
      if (data[label]) {
        data[label].sales += o.total;
        data[label].count += 1;
      }
    });
  } else if (dateFilter === 'year') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((m) => {
      data[m] = { sales: 0, count: 0 };
    });

    filteredOrders.forEach((o) => {
      const d = parseOrderDate(o.date);
      if (!d) return;
      const monthIndex = d.getMonth();
      const label = months[monthIndex];
      if (data[label]) {
        data[label].sales += o.total;
        data[label].count += 1;
      }
    });
  } else {
    filteredOrders.forEach((o) => {
      const d = parseOrderDate(o.date);
      if (!d) return;
      const dayStr = String(d.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthStr = months[d.getMonth()];
      const label = `${dayStr} ${monthStr}`;

      if (!data[label]) {
        data[label] = { sales: 0, count: 0 };
      }
      data[label].sales += o.total;
      data[label].count += 1;
    });
  }

  return Object.entries(data)
    .map(([label, val]) => ({
      label,
      sales: val.sales,
      count: val.count,
    }))
    .sort((a, b) => {
      if (dateFilter === 'all') {
        const months: Record<string, number> = {
          Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
          Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };
        const aParts = a.label.split(' ');
        const bParts = b.label.split(' ');
        const aDay = parseInt(aParts[0], 10);
        const aMonth = months[aParts[1]];
        const bDay = parseInt(bParts[0], 10);
        const bMonth = months[bParts[1]];
        return aMonth - bMonth || aDay - bDay;
      }
      return 0;
    });
};

const DEFAULT_ORDERS: OrderRecord[] = [
  { id: 'ORD-101', table: 'Table 2', items: '1x Filter Coffee, 1x Samosa', total: 120, date: '08 Jun 2026, 02:30 PM', status: 'completed', paymentStatus: 'paid' },
  { id: 'ORD-102', table: 'Table 4', items: '2x Masala Chai', total: 45, date: '08 Jun 2026, 02:22 PM', status: 'completed', paymentStatus: 'paid' },
  { id: 'ORD-103', table: 'Table 1', items: '2x Cold Coffee, 1x Butter Toast', total: 240, date: '08 Jun 2026, 02:10 PM', status: 'pending', paymentStatus: 'unpaid' },
  { id: 'ORD-104', table: 'Table 3', items: '1x Masala Chai, 1x Butter Toast', total: 45, date: '07 Jun 2026, 08:15 PM', status: 'completed', paymentStatus: 'paid' },
  { id: 'ORD-105', table: 'Table 2', items: '2x Masala Chai, 2x Samosa', total: 140, date: '07 Jun 2026, 05:40 PM', status: 'cancelled', paymentStatus: 'unpaid' },
  { id: 'ORD-106', table: 'Takeaway', items: '1x Cold Coffee', total: 60, date: '07 Jun 2026, 04:12 PM', status: 'completed', paymentStatus: 'paid' },
];

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const { owner } = useAuthStore();
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio playback pending interaction:', e));
    } catch (err) {
      console.error('Audio play blocked or failed:', err);
    }
  };

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
        setWaiterCalls(data as WaiterCall[]);
      }
    };

    fetchPendingCalls();

    // Subscribe to real-time additions and updates of waiter_calls
    const channel = supabase
      .channel(`waiter-calls-owner-${owner.id}`)
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
            const newCall = payload.new as WaiterCall;
            if (newCall.status === 'pending') {
              setWaiterCalls((prev) => {
                if (prev.some((c) => c.id === newCall.id)) return prev;
                return [newCall, ...prev];
              });
              playNotificationSound();
              toast.success(`🛎️ Waiter requested at Table ${newCall.table_number}!`, {
                duration: 6000,
                position: 'top-right',
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedCall = payload.new as WaiterCall;
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

  useEffect(() => {
    // One-time reset to clear all previous test/mock data from localStorage
    if (!localStorage.getItem('orders-cleaned-v2')) {
      localStorage.removeItem('owner-orders-history');
      localStorage.setItem('orders-cleaned-v2', 'true');
    }

    // Load from localstorage to make it dynamic
    const local = localStorage.getItem('owner-orders-history');
    if (local) {
      const parsed = JSON.parse(local);
      // Filter out mock and old test order IDs (including ORD-242)
      const filtered = parsed.filter((o: OrderRecord) =>
        !['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-105', 'ORD-106', 'ORD-242'].includes(o.id)
      );
      setOrders(filtered);
      localStorage.setItem('owner-orders-history', JSON.stringify(filtered));
    } else {
      setOrders([]);
    }
  }, []);

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'month' | 'year'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<OrderRecord | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  };

  const isSameMonth = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth();
  };

  const isSameYear = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear();
  };

  // 1. Filter orders ONLY by Date for Analytics and KPIs
  const dateFilteredOrders = orders.filter((order) => {
    if (dateFilter === 'all') return true;

    const orderDate = parseOrderDate(order.date);
    if (!orderDate) return false;

    const today = new Date();

    if (dateFilter === 'today') {
      return isSameDay(orderDate, today);
    }

    if (dateFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      return isSameDay(orderDate, yesterday);
    }

    if (dateFilter === 'month') {
      return isSameMonth(orderDate, today);
    }

    if (dateFilter === 'year') {
      return isSameYear(orderDate, today);
    }

    return true;
  });

  // 2. Filter raw orders by Status, Payment status, and Search query for the Table list (independent of dateFilter)
  const tableFilteredOrders = orders.filter((order) => {
    // Status Filter
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    // Payment Status Filter
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;

    // Search Query Filter (Order ID, Table, or Items)
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      order.id.toLowerCase().includes(query) ||
      order.table.toLowerCase().includes(query) ||
      order.items.toLowerCase().includes(query);

    return matchesStatus && matchesPayment && matchesSearch;
  });

  const stats = {
    totalRevenue: dateFilteredOrders
      .filter((o) => o.status === 'completed' || o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0),
    totalOrders: dateFilteredOrders.length,
    completedOrders: dateFilteredOrders.filter((o) => o.status === 'completed').length,
    pendingOrders: dateFilteredOrders.filter((o) => o.status === 'pending').length,
  };

  const toggleStatus = (id: string, newStatus: 'completed' | 'cancelled') => {
    const updated = orders.map(o => o.id === id ? { ...o, status: newStatus, paymentStatus: newStatus === 'completed' ? 'paid' : o.paymentStatus } : o);
    setOrders(updated);
    localStorage.setItem('owner-orders-history', JSON.stringify(updated));
    toast.success(`Order status updated to ${newStatus}! 🎉`);
  };

  const togglePaymentStatus = (id: string) => {
    const updated = orders.map(o => o.id === id ? { ...o, paymentStatus: 'paid' as const } : o);
    setOrders(updated);
    localStorage.setItem('owner-orders-history', JSON.stringify(updated));
    toast.success('Payment status updated to Paid! 💰');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-accent/10 text-accent border border-accent/20';
      case 'cancelled': return 'bg-danger/10 text-danger border border-danger/20';
      default: return 'bg-gold/10 text-gold border border-gold/20';
    }
  };

  const primaryColor = owner?.theme_settings?.primaryColor || '#00e5a0';

  return (
    <div>
      {/* Active Waiter Calls Alert Panel */}
      {waiterCalls.length > 0 && (
        <div className="mb-8 p-6 bg-white/[0.03] border border-accent/25 rounded-2xl animate-fade-in backdrop-blur-md">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-xl animate-bounce">🛎️</span>
            <div>
              <h2 className="font-display font-black text-base text-[#f0f0f5]">Active Waiter Calls</h2>
              <p className="text-[11px] text-muted">Customers at the following tables are requesting service. Resolve them when done.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {waiterCalls.map((call) => (
              <div
                key={call.id}
                className="bg-surface border border-border/80 rounded-xl p-4 flex items-center justify-between shadow-lg hover:border-accent/30 transition-all"
              >
                <div>
                  <span className="text-xs text-muted font-sans uppercase tracking-wider block">Table</span>
                  <span className="font-display font-extrabold text-lg text-accent">{call.table_number}</span>
                  <span className="text-[9px] text-muted block mt-0.5">
                    {new Date(call.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <button
                  onClick={() => resolveWaiterCall(call.id)}
                  className="bg-accent/15 hover:bg-accent border border-accent/20 text-accent hover:text-bg font-bold text-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="font-display font-black text-2xl">Orders History</h1>
          <p className="text-muted text-sm mt-1">Track and manage all orders placed from your digital QR Menu.</p>
        </div>
      </div>

      {/* Analytics, KPIs, and Charts Section */}
      <div className="mb-8 bg-white/[0.02] border border-border/80 p-5 rounded-3xl backdrop-blur-md">
        {/* Analytics Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/30">
          <div>
            <h2 className="font-display font-black text-base text-[#f0f0f5]">Sales Performance</h2>
            <p className="text-[10px] text-muted">Real-time revenue metrics and daily transaction volume.</p>
          </div>

          {/* Date Range Select */}
          <div className="flex bg-surface border border-border rounded-xl p-1 gap-1 overflow-x-auto scrollbar-none">
            {([
              { value: 'all', label: 'All Time' },
              { value: 'today', label: 'Today' },
              { value: 'yesterday', label: 'Yesterday' },
              { value: 'month', label: 'This Month' },
              { value: 'year', label: 'This Year' }
            ] as const).map((f) => (
              <button
                key={f.value}
                onClick={() => setDateFilter(f.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border-none font-sans cursor-pointer flex-shrink-0',
                  dateFilter === f.value ? 'bg-[#f0f0f5]/10 text-[#f0f0f5]' : 'bg-transparent text-muted hover:text-[#f0f0f5]'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Revenue Card */}
          <div className="p-4 bg-surface border border-border/60 rounded-xl">
            <span className="text-xl">💰</span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1.5">Total Revenue</p>
            <p className="text-lg font-display font-black text-accent mt-1" style={{ color: primaryColor }}>
              ₹{stats.totalRevenue.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Total Orders Card */}
          <div className="p-4 bg-surface border border-border/60 rounded-xl">
            <span className="text-xl">📦</span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1.5">Total Orders</p>
            <p className="text-lg font-display font-black text-[#f0f0f5] mt-1">{stats.totalOrders}</p>
          </div>

          {/* Completed Orders Card */}
          <div className="p-4 bg-surface border border-border/60 rounded-xl">
            <span className="text-xl">✅</span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1.5">Completed</p>
            <p className="text-lg font-display font-black text-accent mt-1" style={{ color: '#00e5a0' }}>{stats.completedOrders}</p>
          </div>

          {/* Pending Orders Card */}
          <div className="p-4 bg-surface border border-border/60 rounded-xl">
            <span className="text-xl">🛎️</span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1.5">Pending Service</p>
            <p className="text-lg font-display font-black text-gold mt-1">{stats.pendingOrders}</p>
          </div>
        </div>

        {/* Trend Graph */}
        {mounted && dateFilteredOrders.length > 0 ? (
          <div className="h-56 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getChartData(dateFilteredOrders, dateFilter)}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#7a7a92', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7a7a92', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#0d1a12', border: '1px solid rgba(0,229,160,0.15)', borderRadius: 12, fontSize: 11 }}
                  labelStyle={{ color: '#f0f0f5', fontWeight: 'bold' }}
                  itemStyle={{ color: primaryColor }}
                />
                <Area type="monotone" dataKey="sales" name="Sales (₹)" stroke={primaryColor} fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : mounted && (
          <div className="py-12 bg-surface/50 border border-border/40 rounded-2xl text-center text-muted text-xs font-semibold">
            No sales or orders trend data found in this range.
          </div>
        )}
      </div>

      {/* Table & Search Header */}
      <div className="mb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white/[0.01] border border-border/40 p-3.5 rounded-2xl">
        {/* Search Input */}
        <div className="flex items-center bg-surface border border-border rounded-xl px-3.5 py-2 gap-2 flex-1 max-w-md">
          <span className="text-muted text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search by Table, ID, or Items..."
            className="bg-transparent outline-none text-xs flex-1 text-[#f0f0f5] placeholder:text-muted"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-muted hover:text-white transition-colors text-xs border-none bg-transparent cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Buttons */}
          <div className="flex bg-surface border border-border rounded-xl p-1 gap-1 overflow-x-auto scrollbar-none">
            {(['all', 'pending', 'completed', 'cancelled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border-none font-sans cursor-pointer flex-shrink-0',
                  statusFilter === f ? 'bg-accent text-bg' : 'bg-transparent text-muted hover:text-[#f0f0f5]'
                )}
                style={statusFilter === f ? { backgroundColor: primaryColor } : {}}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Payment Filter */}
          <div className="flex bg-surface border border-border rounded-xl p-1 gap-1 overflow-x-auto scrollbar-none">
            {([
              { value: 'all', label: 'All Payments' },
              { value: 'paid', label: 'Paid 💰' },
              { value: 'unpaid', label: 'Unpaid ⏳' }
            ] as const).map((f) => (
              <button
                key={f.value}
                onClick={() => setPaymentFilter(f.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border-none font-sans cursor-pointer flex-shrink-0',
                  paymentFilter === f.value ? 'bg-[#f0f0f5]/10 text-[#f0f0f5]' : 'bg-transparent text-muted hover:text-[#f0f0f5]'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile view (cards stacked) */}
      <div className="md:hidden space-y-4">
        {tableFilteredOrders.length === 0 ? (
          <div className="card text-center py-10 text-muted">No orders found.</div>
        ) : (
          tableFilteredOrders.map((order) => (
            <div key={order.id} className="card space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#f0f0f5]">{order.id}</span>
                <span className="bg-accent-2/10 text-accent-2 px-2 py-0.5 rounded-full font-bold text-xs">{order.table}</span>
              </div>
              <div className="text-sm text-muted">{order.items}</div>
              {order.instructions && (
                <div className="text-xs bg-white/[0.02] border border-border/40 px-2.5 py-1.5 rounded-lg text-gold font-sans mt-1">
                  <span className="font-bold text-[9px] uppercase tracking-wider block text-muted/65 mb-0.5">Instructions:</span>
                  {order.instructions}
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <div>
                  <div className="text-muted text-[10px]">{order.date}</div>
                  <div className="font-bold text-accent mt-1 text-sm">₹{order.total}</div>
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  <div className="flex gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${order.paymentStatus === 'paid'
                        ? 'bg-accent/10 text-accent border border-accent/20'
                        : 'bg-gold/10 text-gold border border-gold/20'
                      }`}>
                      {order.paymentStatus}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  {order.status === 'pending' && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => toggleStatus(order.id, 'completed')}
                        className="bg-accent/10 hover:bg-accent border border-accent/35 text-accent hover:text-bg font-bold px-3 py-1 rounded text-[10px] transition-all cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => toggleStatus(order.id, 'cancelled')}
                        className="bg-danger/10 hover:bg-danger border border-danger/35 text-danger hover:text-[#f0f0f5] font-bold px-3 py-1 rounded text-[10px] transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {order.status !== 'pending' && (
                    <span className="text-muted/40 italic text-[10px] mt-1">Archived</span>
                  )}
                  {order.paymentStatus === 'unpaid' && (
                    <button
                      onClick={() => togglePaymentStatus(order.id)}
                      className="bg-gold/10 hover:bg-gold border border-gold/35 text-gold hover:text-bg font-bold px-3 py-1 rounded text-[10px] transition-all cursor-pointer mt-1.5"
                    >
                      Mark Paid
                    </button>
                  )}
                  <button
                    onClick={() => setActiveReceiptOrder(order)}
                    className="bg-accent/15 hover:bg-accent border border-accent/25 text-accent hover:text-bg font-bold px-3 py-1 rounded text-[10px] transition-all cursor-pointer mt-1.5 font-sans"
                    style={{ borderColor: `${primaryColor}30`, color: primaryColor }}
                  >
                    Receipt 🖨️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop view (table) */}
      <div className="hidden md:block card overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-border/50 text-[10px] uppercase font-bold tracking-wider text-muted">
              <th className="pb-3 pt-1">Order ID</th>
              <th className="pb-3 pt-1">Table/Location</th>
              <th className="pb-3 pt-1">Items</th>
              <th className="pb-3 pt-1">Total Bill</th>
              <th className="pb-3 pt-1">Date & Time</th>
              <th className="pb-3 pt-1">Payment</th>
              <th className="pb-3 pt-1">Status</th>
              <th className="pb-3 pt-1 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-xs">
            {tableFilteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-muted">No orders found.</td>
              </tr>
            ) : (
              tableFilteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-4 font-bold text-[#f0f0f5]">{order.id}</td>
                  <td className="py-4">
                    <span className="bg-accent-2/10 text-accent-2 px-2 py-0.5 rounded-full font-bold">{order.table}</span>
                  </td>
                  <td className="py-4 max-w-[200px]">
                    <div className="text-muted truncate font-semibold" title={order.items}>{order.items}</div>
                    {order.instructions && (
                      <div className="text-[11px] text-gold mt-1 bg-white/[0.02] border border-border/30 px-2 py-1 rounded whitespace-pre-wrap" title={order.instructions}>
                        <span className="font-bold text-[9px] uppercase tracking-wider block text-muted/65 mb-0.5">Instructions:</span>
                        {order.instructions}
                      </div>
                    )}
                  </td>
                  <td className="py-4 font-bold text-accent">₹{order.total}</td>
                  <td className="py-4 text-muted">{order.date}</td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${order.paymentStatus === 'paid'
                        ? 'bg-accent/10 text-accent border border-accent/20'
                        : 'bg-gold/10 text-gold border border-gold/20'
                      }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 text-right space-x-1.5">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => toggleStatus(order.id, 'completed')}
                          className="bg-accent/10 hover:bg-accent border border-accent/35 text-accent hover:text-bg font-bold px-2 py-1 rounded text-[10px] transition-all cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => toggleStatus(order.id, 'cancelled')}
                          className="bg-danger/10 hover:bg-danger border border-danger/35 text-danger hover:text-[#f0f0f5] font-bold px-2 py-1 rounded text-[10px] transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {order.status !== 'pending' && (
                      <span className="text-muted/40 italic">Archived</span>
                    )}
                    {order.paymentStatus === 'unpaid' && (
                      <button
                        onClick={() => togglePaymentStatus(order.id)}
                        className="bg-gold/10 hover:bg-gold border border-gold/35 text-gold hover:text-bg font-bold px-2 py-1 rounded text-[10px] transition-all cursor-pointer"
                      >
                        Mark Paid
                      </button>
                    )}
                    <button
                      onClick={() => setActiveReceiptOrder(order)}
                      className="bg-accent/15 hover:bg-accent border border-accent/25 text-accent hover:text-bg font-bold px-2 py-1 rounded text-[10px] transition-all cursor-pointer font-sans"
                      style={{ borderColor: `${primaryColor}30`, color: primaryColor }}
                    >
                      Receipt 🖨️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Receipt Modal */}
      {activeReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border/80 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setActiveReceiptOrder(null)}
              className="absolute top-4 right-4 text-muted hover:text-white transition-colors bg-transparent border-none text-lg cursor-pointer animate-none"
            >
              ✕
            </button>

            <h3 className="font-display font-black text-lg text-[#f0f0f5] mb-4">Print Receipt / KOT</h3>

            {/* Receipt Paper Area */}
            <div
              id="receipt-print-area"
              className="bg-[#fcfcfa] text-[#1a1a1a] p-6 rounded-xl font-mono text-xs shadow-inner overflow-y-auto max-h-[380px] border border-stone-200"
              style={{ fontFamily: 'Courier New, Courier, monospace' }}
            >
              <div className="text-center space-y-1">
                <h2 className="font-bold text-sm uppercase tracking-wider">{owner?.shop?.name || 'Dukaan Menu'}</h2>
                <p className="text-[10px] text-stone-500">{owner?.shop?.address || 'Digital QR Order'}</p>
                {owner?.shop?.phone && <p className="text-[10px] text-stone-500">Ph: {owner.shop.phone}</p>}
              </div>

              <div className="border-t border-dashed border-stone-400 my-3" />

              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>ORDER ID:</span>
                  <span className="font-bold">{activeReceiptOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>TABLE:</span>
                  <span className="font-bold uppercase">{activeReceiptOrder.table}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{activeReceiptOrder.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAYMENT:</span>
                  <span className="font-bold uppercase">{activeReceiptOrder.paymentStatus}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-stone-400 my-3" />

              {/* Items List */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-[10px]">
                  <span>QTY & ITEM DESCRIPTION</span>
                  <span>TOTAL</span>
                </div>
                <div className="border-t border-stone-300 my-1" />
                {parseOrderItems(activeReceiptOrder.items).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <span>{item.quantity}x {item.name}</span>
                    <span>-</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-stone-400 my-3" />

              {/* Total Bill */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>GRAND TOTAL:</span>
                  <span>₹{activeReceiptOrder.total}</span>
                </div>
                <p className="text-[9px] text-stone-500 italic mt-1">Prices are inclusive of all taxes.</p>
              </div>

              {activeReceiptOrder.instructions && (
                <>
                  <div className="border-t border-stone-300 my-2" />
                  <div className="text-[10px]">
                    <span className="font-bold block">KITCHEN INSTRUCTIONS:</span>
                    <p className="italic text-stone-600 mt-0.5">{activeReceiptOrder.instructions}</p>
                  </div>
                </>
              )}

              <div className="border-t border-dashed border-stone-400 my-3" />

              <div className="text-center space-y-1 text-[9px] text-stone-500">
                <p>Scan QR code to order again</p>
                <p className="font-bold uppercase tracking-widest mt-2">*** Thank You ***</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  const printContent = document.getElementById('receipt-print-area')?.innerHTML;
                  if (printContent) {
                    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
                    if (windowPrint) {
                      windowPrint.document.write(`
                        <html>
                          <head>
                            <title>Print Receipt - ${activeReceiptOrder.id}</title>
                            <style>
                              body {
                                font-family: 'Courier New', Courier, monospace;
                                padding: 20px;
                                color: #000;
                                background: #fff;
                                width: 80mm;
                              }
                              .text-center { text-align: center; }
                              .flex { display: flex; }
                              .justify-between { justify-content: space-between; }
                              .space-y-1 > * + * { margin-top: 4px; }
                              .space-y-1.5 > * + * { margin-top: 6px; }
                              .font-bold { font-weight: bold; }
                              .uppercase { text-transform: uppercase; }
                              .italic { font-style: italic; }
                              .border-t { border-top: 1px solid #000; }
                              .border-dashed { border-style: dashed; }
                              .my-3 { margin-top: 12px; margin-bottom: 12px; }
                              .my-1 { margin-top: 4px; margin-bottom: 4px; }
                              .my-2 { margin-top: 8px; margin-bottom: 8px; }
                              .text-sm { font-size: 14px; }
                              .text-xs { font-size: 12px; }
                              .text-\\[10px\\] { font-size: 10px; }
                              .text-\\[9px\\] { font-size: 9px; }
                              @media print {
                                body { padding: 0; margin: 0; width: 80mm; }
                              }
                            </style>
                          </head>
                          <body onload="window.print(); window.close();">
                            \${printContent}
                          </body>
                        </html>
                      `);
                      windowPrint.document.close();
                    }
                  }
                }}
                className="flex-1 hover:bg-opacity-90 border font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg text-bg"
                style={{ backgroundColor: primaryColor, borderColor: `${primaryColor}20` }}
              >
                <span>🖨️</span> Print KOT / Bill
              </button>
              <button
                onClick={() => setActiveReceiptOrder(null)}
                className="flex-1 bg-surface border border-border hover:bg-surface/80 text-[#f0f0f5] font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
