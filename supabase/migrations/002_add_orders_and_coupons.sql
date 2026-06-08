-- ================================================================
-- Supabase Migration - Add Orders, Coupons & Customize Settings
-- ================================================================

-- ── 1. THEME SETTINGS COLUMNS ON OWNERS ─────────────────────────
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS theme_settings JSONB DEFAULT '{"primaryColor": "#00e5a0", "fontFamily": "Syne", "layout": "grid"}'::jsonb;

-- ── 2. COUPONS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coupons (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id       UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  code           TEXT NOT NULL,
  discount_type  TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_val   NUMERIC(10,2) NOT NULL CHECK (discount_val > 0),
  active         BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(owner_id, code)
);

CREATE INDEX IF NOT EXISTS idx_coupons_owner_id ON public.coupons(owner_id);

-- Enable RLS for coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Coupons Policies
DROP POLICY IF EXISTS "coupons: owner full access" ON public.coupons;
CREATE POLICY "coupons: owner full access"
  ON public.coupons FOR ALL
  USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "coupons: public select" ON public.coupons;
CREATE POLICY "coupons: public select"
  ON public.coupons FOR SELECT
  USING (active = true);

-- ── 3. ORDERS TABLE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id          UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  table_number      TEXT,
  items             JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount      NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  discount_amount   NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  coupon_code       TEXT,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  payment_status    TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  razorpay_order_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_owner_id ON public.orders(owner_id);
CREATE INDEX IF NOT EXISTS idx_orders_status   ON public.orders(status);

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders Policies
DROP POLICY IF EXISTS "orders: owner full access" ON public.orders;
CREATE POLICY "orders: owner full access"
  ON public.orders FOR ALL
  USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "orders: anyone can insert" ON public.orders;
CREATE POLICY "orders: anyone can insert"
  ON public.orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "orders: anyone can select own order details" ON public.orders;
CREATE POLICY "orders: anyone can select own order details"
  ON public.orders FOR SELECT
  USING (true);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 4. MULTI-HOTEL RAZORPAY ROUTE SETTINGS ──────────────────────────
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS razorpay_linked_account_id TEXT;
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS platform_commission_pct NUMERIC(5,2) DEFAULT 2.00; -- 2% Default commission

