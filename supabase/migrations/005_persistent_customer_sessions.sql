-- ================================================================
-- Supabase Migration - 005 Persistent Customer Sessions
-- ================================================================

-- ── 1. CUSTOMERS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customers (
  customer_id      TEXT PRIMARY KEY, -- Client/Server UUID
  mobile_number    TEXT UNIQUE NOT NULL, -- 10-digit phone
  first_name       TEXT,
  last_name        TEXT,
  email            TEXT UNIQUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login       TIMESTAMPTZ,
  total_orders     INTEGER NOT NULL DEFAULT 0,
  loyalty_points   INTEGER NOT NULL DEFAULT 0,
  last_order_date  TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. CUSTOMER SESSIONS TABLE ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customer_sessions (
  session_id   TEXT PRIMARY KEY, -- Session token UUID
  customer_id  TEXT NOT NULL REFERENCES public.customers(customer_id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ NOT NULL,
  device_info  TEXT,
  ip_hash      TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. CUSTOMER ORDERS TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customer_orders (
  order_id         TEXT PRIMARY KEY,
  customer_id      TEXT NOT NULL REFERENCES public.customers(customer_id) ON DELETE CASCADE,
  shop_slug        TEXT NOT NULL,
  items            JSONB NOT NULL DEFAULT '[]'::jsonb,
  total            NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  payment_id       TEXT,
  payment_method   TEXT NOT NULL DEFAULT 'cash',
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  delivery_address TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at     TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. INDEXES FOR PERFORMANCE ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON public.customers(mobile_number);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_customer ON public.customer_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_orders_customer ON public.customer_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_orders_created ON public.customer_orders(created_at DESC);

-- ── 5. TRIGGERS FOR TIMESTAMPS ──────────────────────────────────
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER customer_sessions_updated_at
  BEFORE UPDATE ON public.customer_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER customer_orders_updated_at
  BEFORE UPDATE ON public.customer_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 6. ROW LEVEL SECURITY (RLS) ─────────────────────────────────
ALTER TABLE public.customers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_orders   ENABLE ROW LEVEL SECURITY;

-- Customers Policies
DROP POLICY IF EXISTS "customers: public read profile" ON public.customers;
CREATE POLICY "customers: public read profile" ON public.customers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "customers: public insert profile" ON public.customers;
CREATE POLICY "customers: public insert profile" ON public.customers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "customers: public update profile" ON public.customers;
CREATE POLICY "customers: public update profile" ON public.customers
  FOR UPDATE USING (true);

-- Sessions Policies
DROP POLICY IF EXISTS "customer_sessions: public full access" ON public.customer_sessions;
CREATE POLICY "customer_sessions: public full access" ON public.customer_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- Orders Policies
DROP POLICY IF EXISTS "customer_orders: public full access" ON public.customer_orders;
CREATE POLICY "customer_orders: public full access" ON public.customer_orders
  FOR ALL USING (true) WITH CHECK (true);
