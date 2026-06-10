import { supabase } from '@/lib/supabase';

// ─── RECORD A SCAN (called when customer visits menu) ─────────
export async function recordScan(ownerId: string): Promise<void> {
  const userAgent = navigator?.userAgent ?? null;

  await supabase.from('qr_scans').insert({
    owner_id:   ownerId,
    user_agent: userAgent,
  });
  // Note: we silently ignore errors here — scan tracking is non-critical
}

// ─── GET ANALYTICS SUMMARY ────────────────────────────────────
export async function getAnalyticsSummary(ownerId: string) {
  const { data, error } = await supabase
    .from('owner_analytics')
    .select('*')
    .eq('owner_id', ownerId)
    .single();

  if (error) {
    // Return zeros if no scans yet
    return { total_scans: 0, today_scans: 0, week_scans: 0, month_scans: 0 };
  }
  return data;
}

// ─── GET DAILY SCANS (for chart) ──────────────────────────────
export async function getDailyScans(
  ownerId: string,
  days: number = 7
): Promise<{ day: string; scans: number }[]> {
  const { data, error } = await supabase.rpc('get_daily_scans', {
    p_owner_id: ownerId,
    p_days:     days,
  });

  if (error) {
    // Return empty chart data
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return { day: d.toLocaleDateString('en', { weekday: 'short' }), scans: 0 };
    });
  }

  return (data ?? []).map((r: { day: string; scans: number }) => ({
    day:   r.day,
    scans: Number(r.scans),
  }));
}

// ─── GET PEAK HOURS ───────────────────────────────────────────
export async function getPeakHours(ownerId: string) {
  const { data, error } = await supabase
    .from('qr_scans')
    .select('scanned_at')
    .eq('owner_id', ownerId)
    .gte('scanned_at', new Date(Date.now() - 30 * 86400000).toISOString());

  if (error || !data?.length) {
    return [
      { label: '8–10 AM',  percentage: 0 },
      { label: '12–2 PM',  percentage: 0 },
      { label: '4–6 PM',   percentage: 0 },
      { label: '7–9 PM',   percentage: 0 },
      { label: 'Other',    percentage: 0 },
    ];
  }

  const buckets = { '8-10': 0, '12-14': 0, '16-18': 0, '19-21': 0, other: 0 };
  data.forEach(({ scanned_at }) => {
    const h = new Date(scanned_at).getHours();
    if (h >= 8  && h < 10)  buckets['8-10']++;
    else if (h >= 12 && h < 14) buckets['12-14']++;
    else if (h >= 16 && h < 18) buckets['16-18']++;
    else if (h >= 19 && h < 21) buckets['19-21']++;
    else buckets.other++;
  });

  const total = data.length || 1;
  return [
    { label: '8–10 AM',  percentage: Math.round((buckets['8-10']  / total) * 100) },
    { label: '12–2 PM',  percentage: Math.round((buckets['12-14'] / total) * 100) },
    { label: '4–6 PM',   percentage: Math.round((buckets['16-18'] / total) * 100) },
    { label: '7–9 PM',   percentage: Math.round((buckets['19-21'] / total) * 100) },
    { label: 'Other',    percentage: Math.round((buckets.other    / total) * 100) },
  ];
}

/**
 * Inserts or updates the session record in Supabase to track visitor entry
 */
export async function recordSessionStart(
  sessionId: string,
  shopSlug: string,
  ownerId: string,
  deviceInfo?: string,
  ipHash?: string
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await (supabase as any).from('sessions').upsert({
      session_id: sessionId,
      owner_id: ownerId,
      shop_slug: shopSlug,
      expires_at: expiresAt,
      device_info: deviceInfo || (typeof navigator !== 'undefined' ? navigator.userAgent : null),
      ip_hash: ipHash || null,
    }, { onConflict: 'session_id' });
  } catch (error) {
    console.error('Failed to record session start:', error);
  }
}

/**
 * Increments the page/item views counter for the active session
 */
export async function recordItemViewed(sessionId: string): Promise<void> {
  try {
    await (supabase as any).rpc('increment_session_views', { p_session_id: sessionId });
  } catch (error) {
    console.error('Failed to record item view:', error);
  }
}

/**
 * Increments the cart additions counter for the active session
 */
export async function recordAddToCart(sessionId: string): Promise<void> {
  try {
    await (supabase as any).rpc('increment_session_cart_adds', { p_session_id: sessionId });
  } catch (error) {
    console.error('Failed to record cart addition:', error);
  }
}

/**
 * Marks session as having placed an order and adds to session total revenue
 */
export async function recordCheckout(sessionId: string, total: number): Promise<void> {
  try {
    await (supabase as any).rpc('record_session_checkout', { p_session_id: sessionId, p_amount: total });
  } catch (error) {
    console.error('Failed to record checkout:', error);
  }
}

/**
 * Fetches metrics for a single session
 */
export async function getSessionMetrics(sessionId: string) {
  const { data, error } = await (supabase as any)
    .from('sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error) {
    console.error('Failed to fetch session metrics:', error);
    return null;
  }
  return data;
}

/**
 * Fetches all session metrics for a shop to display in the owner dashboard
 */
export async function getShopSessionAnalytics(ownerId: string) {
  const { data, error } = await (supabase as any)
    .from('sessions')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch shop session analytics:', error);
    return [];
  }
  return data;
}

