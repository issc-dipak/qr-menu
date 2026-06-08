-- ================================================================
-- DukaanQR — Complete Database Schema
-- Run this in Supabase SQL Editor
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. OWNERS ────────────────────────────────────────────────
CREATE TABLE public.owners (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  shop_name        TEXT NOT NULL,
  shop_slug        TEXT NOT NULL UNIQUE,
  shop_category    TEXT NOT NULL DEFAULT 'Other',
  shop_address     TEXT,
  shop_description TEXT,
  shop_hours       TEXT DEFAULT '9 AM - 9 PM',
  shop_phone       TEXT,
  shop_avatar      TEXT NOT NULL DEFAULT '🏪',
  plan             TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','business')),
  plan_expires_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. MENU ITEMS ─────────────────────────────────────────────
CREATE TABLE public.menu_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  emoji       TEXT NOT NULL DEFAULT '🍽️',
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category    TEXT NOT NULL DEFAULT 'Other',
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','draft')),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. QR SCANS ───────────────────────────────────────────────
CREATE TABLE public.qr_scans (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id   UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent TEXT,
  ip_hash    TEXT
);

-- ── 4. SUBSCRIPTIONS ──────────────────────────────────────────
CREATE TABLE public.subscriptions (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id             UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  razorpay_payment_id  TEXT,
  razorpay_order_id    TEXT,
  plan                 TEXT NOT NULL CHECK (plan IN ('pro','business')),
  amount               NUMERIC(10,2) NOT NULL,
  status               TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','expired')),
  starts_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at           TIMESTAMPTZ NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- INDEXES (for performance)
-- ================================================================
CREATE INDEX idx_menu_items_owner_id    ON public.menu_items(owner_id);
CREATE INDEX idx_menu_items_status      ON public.menu_items(status);
CREATE INDEX idx_qr_scans_owner_id      ON public.qr_scans(owner_id);
CREATE INDEX idx_qr_scans_scanned_at    ON public.qr_scans(scanned_at);
CREATE INDEX idx_owners_user_id         ON public.owners(user_id);
CREATE INDEX idx_owners_slug            ON public.owners(shop_slug);
CREATE INDEX idx_subscriptions_owner_id ON public.subscriptions(owner_id);

-- ================================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER owners_updated_at
  BEFORE UPDATE ON public.owners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- ANALYTICS VIEW
-- ================================================================
CREATE OR REPLACE VIEW public.owner_analytics AS
SELECT
  owner_id,
  COUNT(*)                                                                    AS total_scans,
  COUNT(*) FILTER (WHERE scanned_at >= NOW() - INTERVAL '1 day')             AS today_scans,
  COUNT(*) FILTER (WHERE scanned_at >= NOW() - INTERVAL '7 days')            AS week_scans,
  COUNT(*) FILTER (WHERE scanned_at >= NOW() - INTERVAL '30 days')           AS month_scans
FROM public.qr_scans
GROUP BY owner_id;

-- ================================================================
-- DAILY SCANS FUNCTION (for charts)
-- ================================================================
CREATE OR REPLACE FUNCTION get_daily_scans(p_owner_id UUID, p_days INTEGER DEFAULT 7)
RETURNS TABLE(day TEXT, scans BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(gs.day::DATE, 'Dy') AS day,
    COUNT(qs.id)::BIGINT         AS scans
  FROM generate_series(
    NOW() - ((p_days - 1) || ' days')::INTERVAL,
    NOW(),
    '1 day'::INTERVAL
  ) AS gs(day)
  LEFT JOIN public.qr_scans qs
    ON qs.owner_id = p_owner_id
    AND DATE(qs.scanned_at) = DATE(gs.day)
  GROUP BY gs.day
  ORDER BY gs.day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================
ALTER TABLE public.owners       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- OWNERS policies
CREATE POLICY "owners: select own"
  ON public.owners FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "owners: insert own"
  ON public.owners FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owners: update own"
  ON public.owners FOR UPDATE
  USING (auth.uid() = user_id);

-- MENU ITEMS policies
CREATE POLICY "menu_items: owner full access"
  ON public.menu_items FOR ALL
  USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = auth.uid())
  );

CREATE POLICY "menu_items: public read active"
  ON public.menu_items FOR SELECT
  USING (status = 'active');

-- QR SCANS policies
CREATE POLICY "qr_scans: owner can read"
  ON public.qr_scans FOR SELECT
  USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = auth.uid())
  );

CREATE POLICY "qr_scans: anyone can insert"
  ON public.qr_scans FOR INSERT
  WITH CHECK (true);

-- SUBSCRIPTIONS policies
CREATE POLICY "subscriptions: owner can read"
  ON public.subscriptions FOR SELECT
  USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = auth.uid())
  );

-- Public read for customer menu (no auth needed)
CREATE POLICY "owners: public read for menu"
  ON public.owners FOR SELECT
  USING (true);

-- ================================================================
-- STORAGE BUCKET (for item photos)
-- ================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true);

CREATE POLICY "menu-images: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-images');

CREATE POLICY "menu-images: owner upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'menu-images'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "menu-images: owner delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'menu-images'
    AND auth.uid() IS NOT NULL
  );
