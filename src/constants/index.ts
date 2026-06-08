import type { Plan, MenuItemCategory, ShopCategory, NavItem } from '@/types';

// ─── PLANS ────────────────────────────────────────────────────
export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    maxItems: 10,
    maxQrCodes: 1,
    features: [
      { label: 'Up to 10 menu items', included: true },
      { label: '1 QR code', included: true },
      { label: 'Basic menu design', included: true },
      { label: 'Shareable link', included: true },
      { label: 'Photo upload', included: false },
      { label: 'Analytics dashboard', included: false },
      { label: 'Custom branding', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 149,
    maxItems: Infinity,
    maxQrCodes: 1,
    features: [
      { label: 'Unlimited menu items', included: true },
      { label: '1 QR code', included: true },
      { label: 'Beautiful menu design', included: true },
      { label: 'Shareable link', included: true },
      { label: 'Photo upload', included: true },
      { label: 'Analytics dashboard', included: true },
      { label: 'Custom branding', included: false },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: 299,
    maxItems: Infinity,
    maxQrCodes: 5,
    features: [
      { label: 'Unlimited menu items', included: true },
      { label: '5 QR codes', included: true },
      { label: 'Premium menu design', included: true },
      { label: 'Shareable link', included: true },
      { label: 'Photo upload', included: true },
      { label: 'Advanced analytics', included: true },
      { label: 'Custom branding', included: true },
    ],
  },
];

// ─── CATEGORIES ───────────────────────────────────────────────
export const MENU_CATEGORIES: MenuItemCategory[] = [
  'Hot Drinks',
  'Cold Drinks',
  'Snacks',
  'Main Course',
  'Desserts',
  'Other',
];

export const SHOP_CATEGORIES: ShopCategory[] = [
  'Restaurant / Dhaba',
  'Chai / Juice Shop',
  'Salon / Beauty Parlour',
  'Boutique / Clothing',
  'Grocery / Kirana',
  'Tuition / Coaching',
  'Services',
  'Other',
];

// ─── EMOJIS ───────────────────────────────────────────────────
export const ITEM_EMOJIS = [
  '🍵','☕','🧋','🥐','🍕','🍜','🥪','🍰',
  '🥤','🍋','🫖','🍩','💇','✂️','💅','👕',
  '🍔','🌮','🍣','🥗','🍱','🥘','🍛','🍲',
  '🧁','🍫','🍦','🧃','🍺','🥛','🫙','🛒',
];

export const DASHBOARD_NAV: NavItem[] = [
  { label: 'Overview',   href: '/dashboard/overview',   icon: '📊' },
  { label: 'Menu Items', href: '/dashboard/menu',       icon: '🍽️' },
  { label: 'Orders',     href: '/dashboard/orders',     icon: '📋' },
  { label: 'QR Code',   href: '/dashboard/qr',         icon: '🔳' },
  { label: 'Analytics', href: '/dashboard/analytics',  icon: '📈' },
  { label: 'Ask AI',    href: '/dashboard/ask-ai',     icon: '✨' },
  { label: 'Settings',  href: '/dashboard/settings',   icon: '⚙️' },
  { label: 'Billing',   href: '/dashboard/billing',    icon: '💳' },
];

// ─── MOCK DATA ────────────────────────────────────────────────
export const MOCK_OWNER = {
  id: '1',
  name: 'Rajesh Sharma',
  email: 'rajesh@sharmachai.com',
  plan: 'free' as const,
  qrUrl: 'dukaanqr.in/menu/sharma-chai-corner',
  createdAt: '2024-01-01',
  shop: {
    name: 'Sharma Chai Corner',
    category: 'Chai / Juice Shop' as ShopCategory,
    address: 'Sector 14, Delhi',
    description: 'Best chai in Sector 14. Open since 2018.',
    hours: '7 AM – 10 PM',
    phone: '+91 98765 43210',
    avatar: '☕',
  },
};

export const MOCK_MENU_ITEMS = [
  { id: '1', emoji: '🍵', name: 'Masala Chai',   description: 'Fresh ginger & cardamom',    price: 20, category: 'Hot Drinks'  as MenuItemCategory, status: 'active' as const, createdAt: '2024-01-01' },
  { id: '2', emoji: '☕', name: 'Filter Coffee',  description: 'South Indian style',         price: 30, category: 'Hot Drinks'  as MenuItemCategory, status: 'active' as const, createdAt: '2024-01-02' },
  { id: '3', emoji: '🫖', name: 'Green Tea',      description: 'Refreshing & healthy',       price: 25, category: 'Hot Drinks'  as MenuItemCategory, status: 'active' as const, createdAt: '2024-01-03' },
  { id: '4', emoji: '🧋', name: 'Cold Coffee',    description: 'Chilled & creamy',           price: 60, category: 'Cold Drinks' as MenuItemCategory, status: 'active' as const, createdAt: '2024-01-04' },
  { id: '5', emoji: '🍋', name: 'Nimbu Pani',     description: 'Fresh lemon, mint',          price: 20, category: 'Cold Drinks' as MenuItemCategory, status: 'active' as const, createdAt: '2024-01-05' },
  { id: '6', emoji: '🥤', name: 'Lassi',          description: 'Sweet yogurt drink',         price: 40, category: 'Cold Drinks' as MenuItemCategory, status: 'active' as const, createdAt: '2024-01-06' },
  { id: '7', emoji: '🥐', name: 'Butter Toast',   description: 'With jam & butter',          price: 25, category: 'Snacks'      as MenuItemCategory, status: 'active' as const, createdAt: '2024-01-07' },
  { id: '8', emoji: '🥪', name: 'Veg Sandwich',   description: 'Veggies, chutney & cheese',  price: 50, category: 'Snacks'      as MenuItemCategory, status: 'active' as const, createdAt: '2024-01-08' },
];

export const MOCK_ANALYTICS = {
  totalScans: 1247,
  todayScans: 43,
  weekScans: 297,
  monthScans: 1247,
  uniqueVisitors: 892,
  avgDailyScans: 178,
  peakDay: 'Saturday',
  weeklySeries: [
    { day: 'Mon', scans: 28 },
    { day: 'Tue', scans: 38 },
    { day: 'Wed', scans: 24 },
    { day: 'Thu', scans: 49 },
    { day: 'Fri', scans: 42 },
    { day: 'Sat', scans: 63 },
    { day: 'Sun', scans: 53 },
  ],
  peakHours: [
    { label: '8–10 AM',  percentage: 60 },
    { label: '12–2 PM',  percentage: 90 },
    { label: '4–6 PM',   percentage: 75 },
    { label: '7–9 PM',   percentage: 45 },
    { label: 'Other',    percentage: 20 },
  ],
  topItems: [
    { id: '1', name: 'Masala Chai',  emoji: '🍵', views: 523, percentage: 100 },
    { id: '4', name: 'Cold Coffee',  emoji: '🧋', views: 312, percentage: 60  },
    { id: '2', name: 'Filter Coffee',emoji: '☕', views: 198, percentage: 38  },
    { id: '7', name: 'Butter Toast', emoji: '🥐', views: 142, percentage: 27  },
  ],
};
