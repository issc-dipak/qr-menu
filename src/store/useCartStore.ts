'use client';
import { create } from 'zustand';
import {
  SessionData,
  CartItem,
  Order,
  createNewSession,
  getActiveSession,
  updateSession,
  clearSession as clearSessionStorage,
  getActiveSessionId
} from '@/lib/sessionManager';
import { saveOrderToDatabase, fetchOrderHistoryBySessionId } from '@/services/orderService';
import { recordAddToCart, recordCheckout } from '@/services/analyticsService';
import toast from 'react-hot-toast';

interface CartState {
  session: SessionData | null;
  items: CartItem[];
  orderHistory: Order[];
  tableNumber: string;
  loading: boolean;
  
  // Actions
  initializeSession: (shopSlug: string, existingSessionId?: string | null) => Promise<SessionData>;
  setTableNumber: (table: string) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  
  // Orders
  createOrder: (orderData: {
    table: string;
    items: string;
    total: number;
    paymentId?: string | null;
    paymentMethod?: string;
    instructions?: string | null;
  }) => Promise<Order | null>;
  syncOrderHistory: () => Promise<void>;
  clearSession: () => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  session: null,
  items: [],
  orderHistory: [],
  tableNumber: '',
  loading: false,

  initializeSession: async (shopSlug, existingSessionId) => {
    set({ loading: true });
    try {
      let activeSession: SessionData | null = null;
      
      // 1. Check if a specific session ID was requested (e.g. from ?sid= in URL)
      if (existingSessionId) {
        activeSession = getActiveSession(existingSessionId);
      }
      
      // 2. Fallback to active session in sessionStorage if no sid in URL
      if (!activeSession) {
        const activeId = getActiveSessionId();
        if (activeId) {
          activeSession = getActiveSession(activeId);
        }
      }
      
      // 3. Verify that the restored session belongs to the SAME shop.
      // If the customer scans a QR for shop A, then scans a QR for shop B, we must start a new session!
      if (activeSession && activeSession.shopSlug !== shopSlug) {
        activeSession = null;
      }

      // 4. Create new session if no valid active session exists
      if (!activeSession) {
        activeSession = createNewSession(shopSlug);
      }

      set({
        session: activeSession,
        items: activeSession.cart,
        orderHistory: activeSession.orderHistory,
        tableNumber: activeSession.orderHistory[0]?.table.replace('Table ', '') || '',
        loading: false
      });

      // Synchronize with database order history in the background if possible
      try {
        const dbOrders = await fetchOrderHistoryBySessionId(activeSession.sessionId);
        if (dbOrders && dbOrders.length > 0) {
          // Map DB orders to our client-side Order structure
          const mappedOrders: Order[] = dbOrders.map((o: any) => ({
            id: o.id,
            table: o.delivery_address || 'N/A',
            items: typeof o.items === 'string' ? o.items : 
                   Array.isArray(o.items) ? o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ') : '',
            total: Number(o.total),
            date: new Date(o.created_at).toLocaleString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }),
            status: o.status as 'pending' | 'completed' | 'cancelled',
            paymentStatus: (o.payment_id ? 'paid' : 'unpaid') as 'paid' | 'unpaid',
            instructions: null
          }));

          const updated = updateSession(activeSession.sessionId, { orderHistory: mappedOrders });
          if (updated) {
            set({ session: updated, orderHistory: mappedOrders });
          }
        }
      } catch (err) {
        console.warn('Could not sync order history from database:', err);
      }

      return activeSession;
    } catch (error) {
      console.error('Error initializing session:', error);
      // Fallback: create fresh session to avoid blocking user
      const fallbackSession = createNewSession(shopSlug);
      set({
        session: fallbackSession,
        items: fallbackSession.cart,
        orderHistory: fallbackSession.orderHistory,
        tableNumber: '',
        loading: false
      });
      return fallbackSession;
    }
  },

  setTableNumber: (tableNumber) => {
    set({ tableNumber });
  },

  addItem: (newItem) => {
    const session = get().session;
    if (!session) return;

    const currentItems = get().items;
    const exists = currentItems.find((item) => item.id === newItem.id);
    let newItems: CartItem[] = [];

    if (exists) {
      newItems = currentItems.map((item) =>
        item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newItems = [...currentItems, { ...newItem, quantity: 1 }];
    }

    // Sync to state and sessionStorage
    const updatedSession = updateSession(session.sessionId, { cart: newItems });
    set({ items: newItems, session: updatedSession });
    recordAddToCart(session.sessionId);
  },

  removeItem: (id) => {
    const session = get().session;
    if (!session) return;

    const newItems = get().items.filter((item) => item.id !== id);
    const updatedSession = updateSession(session.sessionId, { cart: newItems });
    set({ items: newItems, session: updatedSession });
  },

  updateQuantity: (id, quantity) => {
    const session = get().session;
    if (!session) return;

    let newItems: CartItem[] = [];
    if (quantity <= 0) {
      newItems = get().items.filter((item) => item.id !== id);
    } else {
      newItems = get().items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
    }

    const updatedSession = updateSession(session.sessionId, { cart: newItems });
    set({ items: newItems, session: updatedSession });
  },

  clearCart: () => {
    const session = get().session;
    if (!session) return;

    const updatedSession = updateSession(session.sessionId, { cart: [] });
    set({ items: [], session: updatedSession });
  },

  getTotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  createOrder: async (orderData) => {
    const session = get().session;
    if (!session) {
      toast.error('No active session. Please scan QR code again.');
      return null;
    }

    set({ loading: true });
    try {
      // 1. Prepare items structure for DB jsonb
      const dbItems = get().items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      // 2. Save order to Supabase
      const newDbOrder = await saveOrderToDatabase(session.sessionId, {
        items: dbItems,
        total: orderData.total,
        paymentId: orderData.paymentId || null,
        paymentMethod: orderData.paymentMethod || 'cash',
        status: 'pending',
        deliveryAddress: orderData.table,
      });

      if (!newDbOrder) {
        throw new Error('Failed to save order in database.');
      }

      // 3. Map database response to client state order
      const clientOrder: Order = {
        id: newDbOrder.id,
        table: newDbOrder.delivery_address || orderData.table,
        items: get().items.map(i => `${i.quantity}x ${i.name}`).join(', '),
        total: Number(newDbOrder.total),
        date: new Date(newDbOrder.created_at).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        status: newDbOrder.status as 'pending' | 'completed' | 'cancelled',
        paymentStatus: (newDbOrder.payment_id ? 'paid' : 'unpaid') as 'paid' | 'unpaid',
        instructions: orderData.instructions || null
      };

      // 4. Update local session orderHistory and clear cart
      const updatedHistory = [clientOrder, ...get().orderHistory];
      const updatedSession = updateSession(session.sessionId, {
        cart: [],
        orderHistory: updatedHistory
      });

      set({
        orderHistory: updatedHistory,
        items: [],
        session: updatedSession,
        loading: false
      });

      recordCheckout(session.sessionId, orderData.total);

      return clientOrder;
    } catch (error: any) {
      set({ loading: false });
      console.error('Order creation error:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
      return null;
    }
  },

  syncOrderHistory: async () => {
    const session = get().session;
    if (!session) return;

    try {
      const dbOrders = await fetchOrderHistoryBySessionId(session.sessionId);
      if (dbOrders) {
        const mappedOrders: Order[] = dbOrders.map((o: any) => ({
          id: o.id,
          table: o.delivery_address || 'N/A',
          items: typeof o.items === 'string' ? o.items : 
                 Array.isArray(o.items) ? o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ') : '',
          total: Number(o.total),
          date: new Date(o.created_at).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          }),
          status: o.status as 'pending' | 'completed' | 'cancelled',
          paymentStatus: (o.payment_id ? 'paid' : 'unpaid') as 'paid' | 'unpaid',
          instructions: null
        }));

        const updated = updateSession(session.sessionId, { orderHistory: mappedOrders });
        set({ session: updated, orderHistory: mappedOrders });
      }
    } catch (error) {
      console.error('Failed to sync order history:', error);
    }
  },

  clearSession: () => {
    const session = get().session;
    if (session) {
      clearSessionStorage(session.sessionId);
    }
    set({ session: null, items: [], orderHistory: [], tableNumber: '' });
  }
}));
