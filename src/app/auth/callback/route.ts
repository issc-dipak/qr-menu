import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get('code');
  const next  = searchParams.get('next') ?? '/dashboard/overview';

  if (code) {
    const supabase = createSupabaseServerClient() as any;
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Check if owner profile exists; create if not (first Google login)
      const { data: existing } = await supabase
        .from('owners')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existing) {
        const shopName = user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'My Shop';
        const slug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        await supabase.from('owners').insert({
          user_id:      user.id,
          name:         user.user_metadata?.full_name ?? shopName,
          email:        user.email ?? '',
          shop_name:    shopName,
          shop_slug:    `${slug}-${Date.now().toString(36)}`,
          shop_category:'Other',
          shop_avatar:  '🏪',
          plan:         'free',
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
}
