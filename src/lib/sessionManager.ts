/**
 * QRMenu Session Management Service
 * Handles generating, retrieving, expiring, and clearing customer sessions in sessionStorage.
 */

export interface CartItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  quantity: number;
}

export interface Order {
  id: string;
  table: string;
  items: string; // e.g. "1x Filter Coffee, 1x Samosa"
  total: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid';
  instructions?: string | null;
}

export interface SessionData {
  sessionId: string;
  shopSlug: string;
  cart: CartItem[];
  orderHistory: Order[];
  createdAt: string;
  expiresAt: string;
}

const SESSION_PREFIX = 'qrmenu_session_';
const ACTIVE_SESSION_KEY = 'qrmenu_active_session_id';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Checks if window and sessionStorage are available (SSR safety)
 */
const isBrowser = (): boolean => typeof window !== 'undefined';

/**
 * Generate a unique session ID using standard crypto.randomUUID (zero dependencies)
 */
export function generateSessionId(): string {
  if (isBrowser() && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback if randomUUID is unavailable
  return 'sec_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * Create a brand new session for a specific shop slug
 */
export function createNewSession(shopSlug: string): SessionData {
  const sessionId = generateSessionId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_MS);

  const sessionData: SessionData = {
    sessionId,
    shopSlug,
    cart: [],
    orderHistory: [],
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  if (isBrowser()) {
    try {
      sessionStorage.setItem(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(sessionData));
      sessionStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
    } catch (error) {
      console.error('Failed to save session data in sessionStorage:', error);
    }
  }

  return sessionData;
}

/**
 * Retrieve the active session ID
 */
export function getActiveSessionId(): string | null {
  if (!isBrowser()) return null;
  return sessionStorage.getItem(ACTIVE_SESSION_KEY);
}

/**
 * Get active session data, checking for validity/expiry
 */
export function getActiveSession(sessionId: string): SessionData | null {
  if (!isBrowser()) return null;

  try {
    const rawData = sessionStorage.getItem(`${SESSION_PREFIX}${sessionId}`);
    if (!rawData) return null;

    const data: SessionData = JSON.parse(rawData);
    const now = new Date();
    const expiresAt = new Date(data.expiresAt);

    // If session has expired, clear it and return null
    if (now > expiresAt) {
      clearSession(sessionId);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error reading session data for ID: ${sessionId}`, error);
    return null;
  }
}

/**
 * Updates session data in sessionStorage
 */
export function updateSession(sessionId: string, updates: Partial<SessionData>): SessionData | null {
  if (!isBrowser()) return null;

  try {
    const currentSession = getActiveSession(sessionId);
    if (!currentSession) return null;

    const updatedSession = { ...currentSession, ...updates };
    sessionStorage.setItem(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(updatedSession));
    return updatedSession;
  } catch (error) {
    console.error(`Failed to update session data for ID: ${sessionId}`, error);
    return null;
  }
}

/**
 * Clear the session data from sessionStorage
 */
export function clearSession(sessionId: string): void {
  if (!isBrowser()) return;

  try {
    sessionStorage.removeItem(`${SESSION_PREFIX}${sessionId}`);
    const activeId = sessionStorage.getItem(ACTIVE_SESSION_KEY);
    if (activeId === sessionId) {
      sessionStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  } catch (error) {
    console.error(`Failed to clear session data for ID: ${sessionId}`, error);
  }
}
