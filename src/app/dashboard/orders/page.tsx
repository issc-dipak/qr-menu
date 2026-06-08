'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface OrderRecord {
  id: string;
  table: string;
  items: string;
  total: number;
  date: string;
  status: 'completed' | 'cancelled' | 'pending';
  paymentStatus: 'paid' | 'unpaid';
}

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

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

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

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-2xl">Orders History</h1>
          <p className="text-muted text-sm mt-1">Track and manage all orders placed from your digital QR Menu.</p>
        </div>
        
        {/* Filter buttons */}
        <div className="flex bg-surface border border-border rounded-xl p-1 gap-1 overflow-x-auto flex-nowrap scrollbar-none w-full md:w-auto">
          {(['all', 'pending', 'completed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border-none font-sans cursor-pointer flex-shrink-0 ${
                filter === f ? 'bg-accent text-bg' : 'bg-transparent text-muted hover:text-[#f0f0f5]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile view (cards stacked) */}
      <div className="md:hidden space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="card text-center py-10 text-muted">No orders found.</div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="card space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#f0f0f5]">{order.id}</span>
                <span className="bg-accent-2/10 text-accent-2 px-2 py-0.5 rounded-full font-bold text-xs">{order.table}</span>
              </div>
              <div className="text-sm text-muted">{order.items}</div>
              <div className="flex justify-between items-center text-xs">
                <div>
                  <div className="text-muted text-[10px]">{order.date}</div>
                  <div className="font-bold text-accent mt-1 text-sm">₹{order.total}</div>
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  <div className="flex gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      order.paymentStatus === 'paid'
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
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-muted">No orders found.</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-4 font-bold text-[#f0f0f5]">{order.id}</td>
                  <td className="py-4">
                    <span className="bg-accent-2/10 text-accent-2 px-2 py-0.5 rounded-full font-bold">{order.table}</span>
                  </td>
                  <td className="py-4 text-muted max-w-[200px] truncate" title={order.items}>{order.items}</td>
                  <td className="py-4 font-bold text-accent">₹{order.total}</td>
                  <td className="py-4 text-muted">{order.date}</td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      order.paymentStatus === 'paid'
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
