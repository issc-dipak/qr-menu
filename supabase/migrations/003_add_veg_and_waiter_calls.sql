-- ================================================================
-- Supabase Migration - Add Veg/Non-Veg & Waiter Calls
-- ================================================================

-- ── 1. ADD VEG FIELD TO MENU ITEMS ──────────────────────────────
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS is_veg BOOLEAN DEFAULT TRUE;

-- ── 2. WAITER CALLS TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.waiter_calls (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id     UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_waiter_calls_owner_id ON public.waiter_calls(owner_id);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_status   ON public.waiter_calls(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.waiter_calls ENABLE ROW LEVEL SECURITY;

-- ── 3. POLICIES FOR WAITER CALLS ─────────────────────────────────

DROP POLICY IF EXISTS "waiter_calls: owner full access" ON public.waiter_calls;
CREATE POLICY "waiter_calls: owner full access"
  ON public.waiter_calls FOR ALL
  USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "waiter_calls: anyone can insert" ON public.waiter_calls;
CREATE POLICY "waiter_calls: anyone can insert"
  ON public.waiter_calls FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "waiter_calls: public select" ON public.waiter_calls;
CREATE POLICY "waiter_calls: public select"
  ON public.waiter_calls FOR SELECT
  USING (true);
