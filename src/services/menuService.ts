import { supabase } from '@/lib/supabase';
import type { MenuItem } from '@/types/supabase';

// ─── GET ALL ITEMS FOR OWNER (dashboard) ─────────────────────
export async function getMenuItems(ownerId: string): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('owner_id', ownerId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ─── GET PUBLIC ITEMS (customer menu — active only) ───────────
export async function getPublicMenuItems(ownerId: string): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('status', 'active')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ─── ADD ITEM ─────────────────────────────────────────────────
export async function addMenuItem(
  ownerId: string,
  item: {
    emoji: string;
    name: string;
    description?: string | null;
    price: number;
    category: string;
    status?: 'active' | 'draft';
    image_url?: string | null;
  }
): Promise<MenuItem> {
  // Get current max sort_order
  const { data: existing } = await supabase
    .from('menu_items')
    .select('sort_order')
    .eq('owner_id', ownerId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = (existing?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from('menu_items')
    .insert({ owner_id: ownerId, ...item, sort_order })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─── UPDATE ITEM ──────────────────────────────────────────────
export async function updateMenuItem(
  itemId: string,
  updates: Partial<Pick<MenuItem,
    | 'emoji' | 'name' | 'description'
    | 'price' | 'category' | 'status' | 'image_url'
  >>
): Promise<MenuItem> {
  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─── DELETE ITEM ──────────────────────────────────────────────
export async function deleteMenuItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', itemId);

  if (error) throw new Error(error.message);
}

// ─── TOGGLE STATUS ────────────────────────────────────────────
export async function toggleMenuItemStatus(
  itemId: string,
  currentStatus: 'active' | 'draft'
): Promise<MenuItem> {
  const newStatus = currentStatus === 'active' ? 'draft' : 'active';
  return updateMenuItem(itemId, { status: newStatus });
}

// ─── REORDER ITEMS ────────────────────────────────────────────
export async function reorderMenuItems(
  items: { id: string; sort_order: number }[]
): Promise<void> {
  const updates = items.map(({ id, sort_order }) =>
    supabase.from('menu_items').update({ sort_order }).eq('id', id)
  );
  await Promise.all(updates);
}

// ─── UPLOAD ITEM IMAGE ────────────────────────────────────────
export async function uploadMenuItemImage(
  ownerId: string,
  itemId: string,
  file: File
): Promise<string> {
  const ext  = file.name.split('.').pop();
  const path = `${ownerId}/${itemId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('menu-images')
    .upload(path, file, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from('menu-images').getPublicUrl(path);
  return data.publicUrl;
}

// ─── DELETE ITEM IMAGE ────────────────────────────────────────
export async function deleteMenuItemImage(
  ownerId: string,
  itemId: string,
  ext: string
): Promise<void> {
  const { error } = await supabase.storage
    .from('menu-images')
    .remove([`${ownerId}/${itemId}.${ext}`]);

  if (error) throw new Error(error.message);
}

// ─── COUNT ITEMS (for plan limit check) ───────────────────────
export async function getMenuItemCount(ownerId: string): Promise<number> {
  const { count, error } = await supabase
    .from('menu_items')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', ownerId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}
