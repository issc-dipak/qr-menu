import { supabase } from '@/lib/supabase';

export interface CustomerProfile {
  customerId: string;
  mobileNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt: string;
  lastLogin?: string;
  totalOrders: number;
  loyaltyPoints: number;
  lastOrderDate?: string;
}

const SESSION_STORAGE_KEY = 'qrmenu_customer_session';

/**
 * Validates a mobile number is exactly 10 digits
 */
export function validateMobileNumber(mobile: string): boolean {
  const cleanNum = mobile.replace(/\D/g, '');
  return cleanNum.length === 10;
}

/**
 * Log in a customer directly using their 10-digit mobile number.
 * Registers them in the 'customers' table if they do not exist.
 * Starts a 30-day session in 'customer_sessions'.
 */
export async function loginWithMobile(mobileNumber: string): Promise<CustomerProfile> {
  const cleanMobile = mobileNumber.replace(/\D/g, '');
  if (cleanMobile.length !== 10) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }

  try {
    // 1. Check if customer already exists in the database
    let { data: customer, error: fetchError } = await (supabase as any)
      .from('customers')
      .select('*')
      .eq('mobile_number', cleanMobile)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "Row not found"
      throw fetchError;
    }

    const now = new Date().toISOString();

    if (!customer) {
      // 2. Register new customer
      const newCustomerId = crypto.randomUUID();
      const { data: newCustomer, error: insertError } = await (supabase as any)
        .from('customers')
        .insert({
          customer_id: newCustomerId,
          mobile_number: cleanMobile,
          last_login: now,
          total_orders: 0,
          loyalty_points: 0,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      customer = newCustomer;
    } else {
      // 3. Update existing customer last login
      const { data: updatedCustomer, error: updateError } = await (supabase as any)
        .from('customers')
        .update({ last_login: now })
        .eq('customer_id', customer.customer_id)
        .select()
        .single();

      if (updateError) throw updateError;
      customer = updatedCustomer;
    }

    // 4. Create customer session (valid for 30 days)
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const deviceInfo = typeof navigator !== 'undefined' ? navigator.userAgent : null;

    const { error: sessionError } = await (supabase as any)
      .from('customer_sessions')
      .insert({
        session_id: sessionToken,
        customer_id: customer.customer_id,
        expires_at: expiresAt,
        device_info: deviceInfo,
      });

    if (sessionError) throw sessionError;

    // 5. Save session token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionToken);
    }

    return {
      customerId: customer.customer_id,
      mobileNumber: customer.mobile_number,
      firstName: customer.first_name || undefined,
      lastName: customer.last_name || undefined,
      email: customer.email || undefined,
      createdAt: customer.created_at,
      lastLogin: customer.last_login,
      totalOrders: customer.total_orders,
      loyaltyPoints: customer.loyalty_points,
      lastOrderDate: customer.last_order_date || undefined,
    };
  } catch (err: any) {
    console.error('Failed to log in with mobile:', err);
    throw new Error(err.message || 'Login failed. Please try again.');
  }
}

/**
 * Returns the currently active customer session if valid
 */
export async function getActiveCustomerSession(): Promise<CustomerProfile | null> {
  if (typeof window === 'undefined') return null;

  const sessionToken = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionToken) return null;

  try {
    // 1. Fetch session from database
    const { data: session, error: sessionError } = await (supabase as any)
      .from('customer_sessions')
      .select('*')
      .eq('session_id', sessionToken)
      .single();

    if (sessionError || !session) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    // 2. Expiry check
    if (new Date(session.expires_at).getTime() < Date.now()) {
      // Session expired, clean up
      await (supabase as any).from('customer_sessions').delete().eq('session_id', sessionToken);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    // 3. Fetch customer profile
    const { data: customer, error: customerError } = await (supabase as any)
      .from('customers')
      .select('*')
      .eq('customer_id', session.customer_id)
      .single();

    if (customerError || !customer) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return {
      customerId: customer.customer_id,
      mobileNumber: customer.mobile_number,
      firstName: customer.first_name || undefined,
      lastName: customer.last_name || undefined,
      email: customer.email || undefined,
      createdAt: customer.created_at,
      lastLogin: customer.last_login,
      totalOrders: customer.total_orders,
      loyaltyPoints: customer.loyalty_points,
      lastOrderDate: customer.last_order_date || undefined,
    };
  } catch (err) {
    console.error('Error restoring customer session:', err);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

/**
 * Logs out the active customer session
 */
export async function logoutCustomer(): Promise<void> {
  if (typeof window === 'undefined') return;

  const sessionToken = localStorage.getItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(SESSION_STORAGE_KEY);

  if (sessionToken) {
    try {
      await (supabase as any).from('customer_sessions').delete().eq('session_id', sessionToken);
    } catch (err) {
      console.error('Failed to clean up customer session on logout:', err);
    }
  }
}
