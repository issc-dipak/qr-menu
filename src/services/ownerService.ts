import { supabase } from '@/lib/supabase';
import type { Owner } from '@/types/supabase';

// ─── GET OWNER BY SLUG (public — for customer menu) ──────────
export async function getOwnerBySlug(slug: string): Promise<Owner | null> {
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .eq('shop_slug', slug)
    .single();

  if (error) return null;
  return data;
}

// ─── GET OWNER BY USER ID ─────────────────────────────────────
export async function getOwnerByUserId(userId: string): Promise<Owner | null> {
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data;
}

// ─── UPDATE OWNER PROFILE ─────────────────────────────────────
export async function updateOwnerProfile(
  ownerId: string,
  updates: Partial<Owner>
): Promise<Owner> {
  const { data, error } = await supabase
    .from('owners')
    .update(updates)
    .eq('id', ownerId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─── UPDATE PLAN ──────────────────────────────────────────────
export async function updateOwnerPlan(
  ownerId: string,
  plan: 'free' | 'pro' | 'business',
  expiresAt?: string
): Promise<void> {
  const { error } = await supabase
    .from('owners')
    .update({ plan, plan_expires_at: expiresAt ?? null })
    .eq('id', ownerId);

  if (error) throw new Error(error.message);
}

// ─── CHECK SLUG AVAILABLE ─────────────────────────────────────
export async function isSlugAvailable(slug: string): Promise<boolean> {
  const { data } = await supabase
    .from('owners')
    .select('id')
    .eq('shop_slug', slug)
    .maybeSingle();

  return !data;
}

// ─── UPLOAD SHOP AVATAR IMAGE ─────────────────────────────────
export async function uploadShopAvatar(
  ownerId: string,
  file: File
): Promise<string> {
  const ext  = file.name.split('.').pop();
  const path = `${ownerId}/avatar_${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('menu-images')
    .upload(path, file, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from('menu-images').getPublicUrl(path);
  return data.publicUrl;
}
