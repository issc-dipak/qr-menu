import { supabase } from '@/lib/supabase';
import { slugify } from '@/utils';
import type { Owner } from '@/types/supabase';

// ─── SIGN UP WITH EMAIL ───────────────────────────────────────
export async function signUpWithEmail(data: {
  email: string;
  password: string;
  name: string;
  shopName: string;
  category: string;
}) {
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { name: data.name, shop_name: data.shopName },
    },
  });

  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error('User creation failed');

  // 2. Create owner profile
  const slug = await generateUniqueSlug(data.shopName);

  const { data: owner, error: ownerError } = await supabase
    .from('owners')
    .insert({
      user_id:      authData.user.id,
      name:         data.name,
      email:        data.email,
      shop_name:    data.shopName,
      shop_slug:    slug,
      shop_category:data.category,
      shop_avatar:  '🏪',
      plan:         'free',
    })
    .select()
    .single();

  if (ownerError) throw new Error(ownerError.message);
  return { user: authData.user, owner };
}

// ─── SIGN IN WITH EMAIL ───────────────────────────────────────
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

// ─── SIGN IN WITH GOOGLE ──────────────────────────────────────
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });
  if (error) throw new Error(error.message);
  return data;
}

// ─── SIGN OUT ─────────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

// ─── GET CURRENT USER + OWNER ─────────────────────────────────
export async function getCurrentOwner(): Promise<Owner | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  return data;
}

// ─── FORGOT PASSWORD ──────────────────────────────────────────
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
  });
  if (error) throw new Error(error.message);
}

// ─── UPDATE PASSWORD ──────────────────────────────────────────
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

// ─── HELPER: unique slug ──────────────────────────────────────
async function generateUniqueSlug(shopName: string): Promise<string> {
  const base = slugify(shopName);
  let slug   = base;
  let i      = 1;

  while (true) {
    const { data } = await supabase
      .from('owners')
      .select('id')
      .eq('shop_slug', slug)
      .maybeSingle();

    if (!data) return slug;
    slug = `${base}-${i++}`;
  }
}
