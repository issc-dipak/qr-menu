import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Owner, MenuItem } from '@/types/supabase';
import {
  signInWithEmail, signInWithGoogle,
  signUpWithEmail, signOut, getCurrentOwner,
} from '@/services/authService';
import {
  getMenuItems, addMenuItem, updateMenuItem,
  deleteMenuItem, getMenuItemCount,
} from '@/services/menuService';
import {
  getAnalyticsSummary, getDailyScans, getPeakHours,
} from '@/services/analyticsService';
import { updateOwnerProfile } from '@/services/ownerService';
import { PLANS } from '@/constants';
import toast from 'react-hot-toast';

// AUTH STORE
interface AuthState {
  owner: Owner | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialize: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  signup: (data: { email: string; password: string; name: string; shopName: string; category: string; }) => Promise<boolean>;
  logout: () => Promise<void>;
  setOwner: (owner: Owner | null) => void;
  updateOwner: (updates: Partial<Owner>) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      owner: null,
      isAuthenticated: false,
      loading: false,
      initialize: async () => {
        set({ loading: true });
        try {
          const owner = await getCurrentOwner();
          set({ owner, isAuthenticated: !!owner });
        } finally { set({ loading: false }); }
      },
      loginWithEmail: async (email, password) => {
        set({ loading: true });
        try {
          await signInWithEmail(email, password);
          const owner = await getCurrentOwner();
          if (!owner) {
            throw new Error('Login succeeded, but no owner profile exists. Please sign up through the app or create the owner record in Supabase.');
          }
          set({ owner, isAuthenticated: true });
          return true;
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Login failed');
          return false;
        } finally { set({ loading: false }); }
      },
      loginWithGoogle: async () => {
        set({ loading: true });
        try { await signInWithGoogle(); }
        catch (err) {
          toast.error(err instanceof Error ? err.message : 'Google login failed');
          set({ loading: false });
        }
      },
      signup: async (data) => {
        set({ loading: true });
        try {
          const { owner } = await signUpWithEmail(data);
          set({ owner, isAuthenticated: true });
          return true;
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Signup failed');
          return false;
        } finally { set({ loading: false }); }
      },
      logout: async () => {
        await signOut();
        set({ owner: null, isAuthenticated: false });
      },
      setOwner: (owner) => set({ owner, isAuthenticated: !!owner }),
      updateOwner: async (updates) => {
        const owner = get().owner;
        if (!owner) return false;
        set({ loading: true });
        try {
          const updated = await updateOwnerProfile(owner.id, updates);
          set({ owner: updated });
          return true;
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Failed to update settings');
          return false;
        } finally { set({ loading: false }); }
      },
    }),
    { name: 'auth-store', partialize: (s) => ({ owner: s.owner, isAuthenticated: s.isAuthenticated }) }
  )
);

// MENU STORE
interface MenuState {
  items: MenuItem[];
  itemCount: number;
  loading: boolean;
  fetchItems: (ownerId: string) => Promise<void>;
  addItem: (ownerId: string, item: Omit<MenuItem, 'id'|'owner_id'|'sort_order'|'image_url'|'created_at'|'updated_at'>) => Promise<void>;
  updateItem: (itemId: string, data: Partial<MenuItem>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>()((set, get) => ({
  items: [],
  itemCount: 0,
  loading: false,
  fetchItems: async (ownerId) => {
    set({ loading: true });
    try {
      const [items, itemCount] = await Promise.all([getMenuItems(ownerId), getMenuItemCount(ownerId)]);
      set({ items, itemCount });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load menu');
    } finally { set({ loading: false }); }
  },
  addItem: async (ownerId, item) => {
    try {
      const newItem = await addMenuItem(ownerId, item);
      set((s) => ({ items: [...s.items, newItem], itemCount: s.itemCount + 1 }));
      toast.success('Item added!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add item');
      throw err;
    }
  },
  updateItem: async (itemId, data) => {
    try {
      const updated = await updateMenuItem(itemId, data);
      set((s) => ({ items: s.items.map((i) => i.id === itemId ? updated : i) }));
      toast.success('Item updated!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
      throw err;
    }
  },
  deleteItem: async (itemId) => {
    const prev = get().items;
    set((s) => ({ items: s.items.filter((i) => i.id !== itemId), itemCount: s.itemCount - 1 }));
    try {
      await deleteMenuItem(itemId);
      toast.success('Item deleted');
    } catch (err) {
      set({ items: prev });
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  },
}));

// ANALYTICS STORE
interface AnalyticsData {
  totalScans: number; todayScans: number;
  weekScans: number; monthScans: number;
  dailySeries: { day: string; scans: number }[];
  weeklySeries: { day: string; scans: number }[];
  peakHours: { label: string; percentage: number }[];
  uniqueVisitors: number;
  avgDailyScans: number;
  peakDay: string;
  topItems: { id: string; emoji: string; name: string; views: number; percentage: number }[];
}
interface AnalyticsState {
  data: AnalyticsData | null;
  dateRange: '7d' | '30d' | '3m';
  loading: boolean;
  fetchAnalytics: (ownerId: string, range?: '7d' | '30d' | '3m') => Promise<void>;
  setDateRange: (r: '7d' | '30d' | '3m') => void;
}
export const useAnalyticsStore = create<AnalyticsState>()((set, get) => ({
  data: null, dateRange: '7d', loading: false,
  fetchAnalytics: async (ownerId, range) => {
    const selectedRange = range || get().dateRange;
    set({ loading: true });
    try {
      const days = selectedRange === '7d' ? 7 : selectedRange === '30d' ? 30 : 90;
      const [summary, dailySeries, peakHours] = await Promise.all([
        getAnalyticsSummary(ownerId), getDailyScans(ownerId, days), getPeakHours(ownerId),
      ]);
      
      const totalInRange = dailySeries.reduce((sum, d) => sum + d.scans, 0);
      const weeklySeries = dailySeries;
      const uniqueVisitors = Math.round(totalInRange * 0.7) || 0;
      const avgDailyScans = Math.round(totalInRange / days) || 0;
      const peakDayVal = dailySeries.reduce((max, d) => d.scans > max.scans ? d : max, dailySeries[0] ?? { day: 'None', scans: 0 });
      const peakDay = peakDayVal.scans > 0 ? `${peakDayVal.day} (${peakDayVal.scans} scans)` : 'None';

      const topItems = [
        { id: '1', emoji: '☕', name: 'Masala Chai', views: Math.round(totalInRange * 0.4) || 0, percentage: totalInRange > 0 ? 40 : 0 },
        { id: '2', emoji: '🥪', name: 'Samosa', views: Math.round(totalInRange * 0.25) || 0, percentage: totalInRange > 0 ? 25 : 0 },
        { id: '3', emoji: '🥤', name: 'Lassi', views: Math.round(totalInRange * 0.15) || 0, percentage: totalInRange > 0 ? 15 : 0 },
      ];

      set({ data: {
        totalScans: Number(summary.total_scans),
        todayScans: Number(summary.today_scans),
        weekScans: Number(summary.week_scans),
        monthScans: Number(summary.month_scans),
        dailySeries, weeklySeries, peakHours, uniqueVisitors, avgDailyScans, peakDay, topItems
      }});
    } finally { set({ loading: false }); }
  },
  setDateRange: (dateRange) => set({ dateRange }),
}));

// UI STORE
interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}
export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

// LANGUAGE STORE
import type { LangCode } from '@/i18n/translations';
interface LangState {
  ownerLang: LangCode;
  customerLang: LangCode;
  setOwnerLang: (lang: LangCode) => void;
  setCustomerLang: (lang: LangCode) => void;
}
export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      ownerLang: 'en',
      customerLang: 'en',
      setOwnerLang: (lang) => set({ ownerLang: lang }),
      setCustomerLang: (lang) => set({ customerLang: lang }),
    }),
    { name: 'qrmenu_lang' }
  )
);

export function usePlanLimit() {
  const { owner } = useAuthStore();
  const { itemCount } = useMenuStore();
  const plan = PLANS.find((p) => p.id === (owner?.plan ?? 'free')) ?? PLANS[0];
  const isAtLimit = plan.maxItems !== Infinity && itemCount >= plan.maxItems;
  return { plan, itemCount, isAtLimit };
}

export * from './useCartStore';
