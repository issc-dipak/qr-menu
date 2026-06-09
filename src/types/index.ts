// ─── MENU ITEM ───────────────────────────────────────────────
export type MenuItemCategory = string;

export type MenuItemStatus = 'active' | 'draft';

export type { MenuItem, Owner } from './supabase';

// ─── OWNER / SHOP ─────────────────────────────────────────────
export type ShopCategory =
  | 'Restaurant / Dhaba'
  | 'Chai / Juice Shop'
  | 'Salon / Beauty Parlour'
  | 'Boutique / Clothing'
  | 'Grocery / Kirana'
  | 'Tuition / Coaching'
  | 'Services'
  | 'Other';

export interface ShopInfo {
  name: string;
  category: ShopCategory;
  address: string;
  description: string;
  hours: string;
  phone: string;
  avatar: string;
}



// ─── PLAN ─────────────────────────────────────────────────────
export type PlanType = 'free' | 'pro' | 'business';

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  features: PlanFeature[];
  maxItems: number;
  maxQrCodes: number;
}

export interface PlanFeature {
  label: string;
  included: boolean;
}

// ─── ANALYTICS ────────────────────────────────────────────────
export interface DailyScan {
  day: string;
  scans: number;
}

export interface PeakHour {
  label: string;
  percentage: number;
}

export interface TopItem {
  id: string;
  name: string;
  emoji: string;
  views: number;
  percentage: number;
}

export interface AnalyticsData {
  totalScans: number;
  todayScans: number;
  weekScans: number;
  monthScans: number;
  uniqueVisitors: number;
  avgDailyScans: number;
  peakDay: string;
  weeklySeries: DailyScan[];
  peakHours: PeakHour[];
  topItems: TopItem[];
}

// ─── AUTH ─────────────────────────────────────────────────────
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  shopName: string;
  email: string;
  password: string;
  category: ShopCategory;
}

// ─── UI ───────────────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface ToastOptions {
  message: string;
  type: 'success' | 'error' | 'info';
}
