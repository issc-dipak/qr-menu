import { supabase } from '@/lib/supabase';

export interface DBOrderInsert {
  items: any[];
  total: number;
  paymentId?: string | null;
  paymentMethod?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  deliveryAddress: string;
}

/**
 * Saves a new customer order into the session_orders table in Supabase
 */
export async function saveOrderToDatabase(sessionId: string, orderData: DBOrderInsert) {
  try {
    const { data, error } = await (supabase as any)
      .from('session_orders')
      .insert({
        session_id: sessionId,
        items: orderData.items,
        total: orderData.total,
        payment_id: orderData.paymentId,
        payment_method: orderData.paymentMethod || 'cash',
        status: orderData.status || 'pending',
        delivery_address: orderData.deliveryAddress,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting order in Supabase:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('saveOrderToDatabase failed:', error);
    throw error;
  }
}

/**
 * Fetches order history for a specific customer session
 */
export async function fetchOrderHistoryBySessionId(sessionId: string) {
  try {
    const { data, error } = await (supabase as any)
      .from('session_orders')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching order history for session:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('fetchOrderHistoryBySessionId failed:', error);
    throw error;
  }
}

/**
 * Updates the status of an existing order (e.g. pending -> completed)
 */
export async function updateOrderStatus(orderId: string, status: 'pending' | 'completed' | 'cancelled') {
  try {
    const { data, error } = await (supabase as any)
      .from('session_orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('updateOrderStatus failed:', error);
    throw error;
  }
}

/**
 * Updates the payment status/ID of an existing order
 */
export async function updateOrderPayment(orderId: string, paymentStatus: 'paid' | 'unpaid', paymentId?: string | null) {
  try {
    const { data, error } = await (supabase as any)
      .from('session_orders')
      .update({
        payment_id: paymentId,
        // Since we don't have a direct payment_status column in session_orders, we can store status as paid
        // or check if payment_id is present. The RLS or columns can represent paid.
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order payment status:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('updateOrderPayment failed:', error);
    throw error;
  }
}

/**
 * Retrieves all session orders for a specific shop owner (owner view)
 */
export async function getShopOrders(ownerId: string) {
  try {
    // 1. Fetch sessions for this owner
    const { data: sessions, error: sessionsError } = await (supabase as any)
      .from('sessions')
      .select('session_id')
      .eq('owner_id', ownerId);

    if (sessionsError) {
      console.error('Error fetching shop sessions for orders:', sessionsError);
      throw sessionsError;
    }

    if (!sessions || sessions.length === 0) {
      return [];
    }

    const sessionIds = sessions.map((s: any) => s.session_id);

    // 2. Fetch orders matching those session IDs
    const { data: orders, error: ordersError } = await (supabase as any)
      .from('session_orders')
      .select('*')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching session orders for owner:', ordersError);
      throw ordersError;
    }

    return orders;
  } catch (error) {
    console.error('getShopOrders failed:', error);
    throw error;
  }
}
