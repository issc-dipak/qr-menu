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
