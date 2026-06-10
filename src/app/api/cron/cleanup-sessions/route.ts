import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET handler for Vercel Cron session cleanup.
 * Deletes all sessions where expires_at is less than the current time.
 * Cascades to delete corresponding session_carts and session_orders.
 */
export async function GET(request: Request) {
  // Vercel Cron sends an Authorization: Bearer <CRON_SECRET> header
  const authHeader = request.headers.get('authorization');
  const isProduction = process.env.NODE_ENV === 'production';
  const cronSecret = process.env.CRON_SECRET;

  if (isProduction && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const nowStr = new Date().toISOString();

    // Delete sessions that have expired
    const { error, count } = await (supabase as any)
      .from('sessions')
      .delete({ count: 'exact' })
      .lt('expires_at', nowStr);

    if (error) {
      console.error('Error running Supabase session cleanup query:', error);
      throw error;
    }

    console.log(`[Cron Job] Cleanup completed. Removed ${count || 0} expired sessions.`);

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up ${count || 0} expired sessions.`,
      deletedCount: count || 0
    });
  } catch (error: any) {
    console.error('[Cron Job] Cleanup failed with error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
