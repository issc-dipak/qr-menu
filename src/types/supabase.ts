// Auto-generated Supabase types — matches our SQL schema exactly

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface OwnersTable {
  Row: {
    id: string;
    user_id: string;        // FK → auth.users.id
    name: string;
    email: string;
    shop_name: string;
    shop_slug: string;        // unique — used in /menu/[slug]
    shop_category: string;
    shop_address: string | null;
    shop_description: string | null;
    shop_hours: string | null;
    shop_phone: string | null;
    shop_avatar: string;        // emoji
    theme_settings?: { primaryColor?: string; fontFamily?: string; layout?: 'grid' | 'list' } | null;
    razorpay_linked_account_id: string | null;
    platform_commission_pct: number | null;
    plan: 'free' | 'pro' | 'business';
    plan_expires_at: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    email: string;
    shop_name: string;
    shop_slug: string;
    shop_category?: string;
    shop_address?: string | null;
    shop_description?: string | null;
    shop_hours?: string | null;
    shop_phone?: string | null;
    shop_avatar?: string;
    theme_settings?: { primaryColor?: string; fontFamily?: string; layout?: 'grid' | 'list' } | null;
    razorpay_linked_account_id?: string | null;
    platform_commission_pct?: number | null;
    plan?: 'free' | 'pro' | 'business';
    plan_expires_at?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<OwnersTable['Insert']>;
  Relationships: [];
}

export interface MenuItemsTable {
  Row: {
    id: string;
    owner_id: string;         // FK → owners.id
    emoji: string;
    name: string;
    description: string | null;
    price: number;
    category: string;
    status: 'active' | 'draft';
    sort_order: number;
    image_url: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    owner_id: string;
    emoji?: string;
    name: string;
    description?: string | null;
    price: number;
    category?: string;
    status?: 'active' | 'draft';
    sort_order?: number;
    image_url?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<MenuItemsTable['Insert']>;
  Relationships: [];
}

export interface QrScansTable {
  Row: {
    id: string;
    owner_id: string;          // FK → owners.id
    scanned_at: string;
    user_agent: string | null;
    ip_hash: string | null;   // privacy — hashed
  };
  Insert: {
    id?: string;
    owner_id: string;
    scanned_at?: string;
    user_agent?: string | null;
    ip_hash?: string | null;
  };
  Update: never;
  Relationships: [];
}

export interface SubscriptionsTable {
  Row: {
    id: string;
    owner_id: string;
    razorpay_payment_id: string | null;
    razorpay_order_id: string | null;
    plan: 'pro' | 'business';
    amount: number;
    status: 'active' | 'cancelled' | 'expired';
    starts_at: string;
    expires_at: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    owner_id: string;
    razorpay_payment_id?: string | null;
    razorpay_order_id?: string | null;
    plan: 'pro' | 'business';
    amount: number;
    status?: 'active' | 'cancelled' | 'expired';
    starts_at?: string;
    expires_at: string;
    created_at?: string;
  };
  Update: Partial<SubscriptionsTable['Insert']>;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      owners: OwnersTable;
      menu_items: MenuItemsTable;
      qr_scans: QrScansTable;
      subscriptions: SubscriptionsTable;
    };
    Views: {
      owner_analytics: {
        Row: {
          owner_id: string;
          total_scans: number;
          today_scans: number;
          week_scans: number;
          month_scans: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_daily_scans: {
        Args: { p_owner_id: string; p_days: number };
        Returns: { day: string; scans: number }[];
      };
    };
    CompositeTypes: {};
  };
}

export type Owner = Database['public']['Tables']['owners']['Row'];
export type MenuItem = Database['public']['Tables']['menu_items']['Row'];
export type QrScan = Database['public']['Tables']['qr_scans']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
