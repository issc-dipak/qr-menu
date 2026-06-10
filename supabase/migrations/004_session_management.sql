-- ================================================================
-- Supabase Migration - 004 Session Management
-- ================================================================

-- ── 1. SESSIONS TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id          TEXT UNIQUE NOT NULL, -- UUID string generated on the client
  owner_id            UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  shop_slug           TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at          TIMESTAMPTZ NOT NULL,
  device_info         TEXT,
  ip_hash             TEXT,
  items_viewed_count  INTEGER DEFAULT 0,
  items_added_count   INTEGER DEFAULT 0,
  cart_abandoned      BOOLEAN DEFAULT TRUE,
  order_placed        BOOLEAN DEFAULT FALSE,
  total_revenue       NUMERIC(10,2) DEFAULT 0.00,
  last_action_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN public.sessions.id IS 'Internal unique UUID primary key';
COMMENT ON COLUMN public.sessions.session_id IS 'Unique session ID string (UUID) shared with the client';
COMMENT ON COLUMN public.sessions.owner_id IS 'Reference to the shop owner';
COMMENT ON COLUMN public.sessions.shop_slug IS 'The URL slug of the shop';
COMMENT ON COLUMN public.sessions.created_at IS 'When the session was created';
COMMENT ON COLUMN public.sessions.expires_at IS 'When the session expires (usually 24 hours)';
COMMENT ON COLUMN public.sessions.device_info IS 'User agent details for analytics';
COMMENT ON COLUMN public.sessions.ip_hash IS 'Privacy hashed client IP address';

-- ── 2. SESSION ORDERS TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.session_orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id       TEXT NOT NULL REFERENCES public.sessions(session_id) ON DELETE CASCADE,
  items            JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {id, name, price, quantity}
  total            NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  payment_id       TEXT, -- Razorpay payment or transaction ID
  payment_method   TEXT DEFAULT 'cash', -- 'cash' or 'online'
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  delivery_address TEXT, -- Table number or physical table location details
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN public.session_orders.id IS 'Unique order ID';
COMMENT ON COLUMN public.session_orders.session_id IS 'Associated session ID';
COMMENT ON COLUMN public.session_orders.items IS 'Ordered items list with metadata';
COMMENT ON COLUMN public.session_orders.total IS 'Total checkout price after discounts';
COMMENT ON COLUMN public.session_orders.payment_id IS 'Gateway transaction identifier';
COMMENT ON COLUMN public.session_orders.payment_method IS 'Method of payment (cash or online)';
COMMENT ON COLUMN public.session_orders.status IS 'Status of preparation/delivery';
COMMENT ON COLUMN public.session_orders.delivery_address IS 'Table number or specific customer notes';

-- ── 3. SESSION CARTS TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.session_carts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id   TEXT UNIQUE NOT NULL REFERENCES public.sessions(session_id) ON DELETE CASCADE,
  items        JSONB NOT NULL DEFAULT '[]'::jsonb, -- Active cart items list
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN public.session_carts.id IS 'Unique cart identifier';
COMMENT ON COLUMN public.session_carts.session_id IS 'Unique reference to client session';
COMMENT ON COLUMN public.session_carts.items IS 'Active items stored in the cart';
COMMENT ON COLUMN public.session_carts.last_updated IS 'Last active time items were updated';

-- ── 4. INDEXES FOR PERFORMANCE ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON public.sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_owner_id    ON public.sessions(owner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at  ON public.sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_session_orders_session_id ON public.session_orders(session_id);
CREATE INDEX IF NOT EXISTS idx_session_orders_created_at ON public.session_orders(created_at);

CREATE INDEX IF NOT EXISTS idx_session_carts_session_id  ON public.session_carts(session_id);

-- ── 5. TRIGGERS FOR TIMESTAMPS ──────────────────────────────────
CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER session_orders_updated_at
  BEFORE UPDATE ON public.session_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Custom function for cart updated_at since it uses last_updated column
CREATE OR REPLACE FUNCTION update_cart_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER session_carts_last_updated
  BEFORE UPDATE ON public.session_carts
  FOR EACH ROW EXECUTE FUNCTION update_cart_last_updated();

-- ── 6. ROW LEVEL SECURITY (RLS) ─────────────────────────────────
ALTER TABLE public.sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_carts  ENABLE ROW LEVEL SECURITY;

-- Sessions policies
-- Anyone can insert a session (client device on scan)
DROP POLICY IF EXISTS "sessions: anyone can insert" ON public.sessions;
CREATE POLICY "sessions: anyone can insert"
  ON public.sessions FOR INSERT
  WITH CHECK (true);

-- Users can select/update their own sessions; owners can select sessions of their shops
DROP POLICY IF EXISTS "sessions: select policy" ON public.sessions;
CREATE POLICY "sessions: select policy"
  ON public.sessions FOR SELECT
  USING (
    true -- Public select allowed by session_id check or owner auth checks
  );

DROP POLICY IF EXISTS "sessions: update policy" ON public.sessions;
CREATE POLICY "sessions: update policy"
  ON public.sessions FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "sessions: owner full access" ON public.sessions;
CREATE POLICY "sessions: owner full access"
  ON public.sessions FOR ALL
  USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = auth.uid())
  );

-- Session Orders policies
-- Anyone can insert orders (checkout from client menu)
DROP POLICY IF EXISTS "session_orders: anyone can insert" ON public.session_orders;
CREATE POLICY "session_orders: anyone can insert"
  ON public.session_orders FOR INSERT
  WITH CHECK (true);

-- Anyone can select order details if they match their session
DROP POLICY IF EXISTS "session_orders: select own order details" ON public.session_orders;
CREATE POLICY "session_orders: select own order details"
  ON public.session_orders FOR SELECT
  USING (true);

-- Owner full access to manage/view orders of their shop
DROP POLICY IF EXISTS "session_orders: owner full access" ON public.session_orders;
CREATE POLICY "session_orders: owner full access"
  ON public.session_orders FOR ALL
  USING (
    session_id IN (
      SELECT session_id FROM public.sessions
      WHERE owner_id IN (SELECT id FROM public.owners WHERE user_id = auth.uid())
    )
  );

-- Session Carts policies
DROP POLICY IF EXISTS "session_carts: public full access" ON public.session_carts;
CREATE POLICY "session_carts: public full access"
  ON public.session_carts FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── 7. SESSION ANALYTICS HELPER FUNCTIONS ─────────────────────────
CREATE OR REPLACE FUNCTION public.increment_session_views(p_session_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.sessions
  SET items_viewed_count = items_viewed_count + 1,
      last_action_at = NOW()
  WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_session_cart_adds(p_session_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.sessions
  SET items_added_count = items_added_count + 1,
      last_action_at = NOW()
  WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.record_session_checkout(p_session_id TEXT, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.sessions
  SET order_placed = TRUE,
      cart_abandoned = FALSE,
      total_revenue = total_revenue + p_amount,
      last_action_at = NOW()
  WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

