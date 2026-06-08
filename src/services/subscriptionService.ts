import { supabase } from '@/lib/supabase';
import type { Subscription } from '@/types/supabase';

export async function createSubscription(data: {
  ownerId: string;
  plan: 'pro' | 'business';
  amount: number;
  razorpayPaymentId: string;
  razorpayOrderId?: string;
}): Promise<Subscription> {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month validity

  // 1. Insert subscription log
  const { data: sub, error: subError } = await supabase
    .from('subscriptions')
    .insert({
      owner_id: data.ownerId,
      plan: data.plan,
      amount: data.amount,
      razorpay_payment_id: data.razorpayPaymentId,
      razorpay_order_id: data.razorpayOrderId ?? null,
      status: 'active',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (subError) throw new Error(subError.message);

  // 2. Update owner plan in owners table
  const { error: ownerError } = await supabase
    .from('owners')
    .update({
      plan: data.plan,
      plan_expires_at: expiresAt.toISOString(),
    })
    .eq('id', data.ownerId);

  if (ownerError) throw new Error(ownerError.message);

  return sub;
}
