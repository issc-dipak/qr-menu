import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createNewSession,
  getActiveSession,
  clearSession,
  updateSession,
  generateSessionId,
} from '../lib/sessionManager';

// Mock sessionStorage for Node environment test execution
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
});

describe('QRMenu Session Manager Service', () => {
  beforeEach(() => {
    sessionStorageMock.clear();
    vi.restoreAllMocks();
  });

  describe('1. Session Creation Tests', () => {
    it('should initialize a session with an empty cart and empty orderHistory', () => {
      const session = createNewSession('test-shop-slug');
      expect(session).toBeDefined();
      expect(session.shopSlug).toBe('test-shop-slug');
      expect(session.cart).toEqual([]);
      expect(session.orderHistory).toEqual([]);
    });

    it('should generate a unique sessionId for each execution', () => {
      const sessionA = createNewSession('test-shop-slug');
      const sessionB = createNewSession('test-shop-slug');
      expect(sessionA.sessionId).not.toBe(sessionB.sessionId);
      expect(sessionA.sessionId).toBeDefined();
    });

    it('should set an expiration date exactly 24 hours in the future', () => {
      const now = Date.now();
      const session = createNewSession('test-shop-slug');
      const expiresAt = new Date(session.expiresAt).getTime();
      const targetExpiry = now + 24 * 60 * 60 * 1000;
      
      // Allow minor delta for runtime execution
      expect(expiresAt - targetExpiry).toBeLessThan(1000);
    });
  });

  describe('2. Add to Cart & Update Tests', () => {
    it('should allow modifying cart items and persist them in storage', () => {
      const session = createNewSession('test-shop-slug');
      const mockCartItem = { id: 'dish-1', name: 'Samosa', price: 30, emoji: '🥪', quantity: 1 };
      
      const updated = updateSession(session.sessionId, { cart: [mockCartItem] });
      
      expect(updated).not.toBeNull();
      expect(updated?.cart).toHaveLength(1);
      expect(updated?.cart[0].name).toBe('Samosa');
      
      // Verify sessionStorage contains correct data
      const storedData = getActiveSession(session.sessionId);
      expect(storedData?.cart).toEqual([mockCartItem]);
    });
  });

  describe('3. Session Expiration Verification', () => {
    it('should return null and clean storage if expiresAt has passed', () => {
      const session = createNewSession('test-shop-slug');
      
      // Manually set expiration date to 1 minute ago
      const expiredTime = new Date(Date.now() - 60 * 1000).toISOString();
      const expiredSession = { ...session, expiresAt: expiredTime };
      
      sessionStorage.setItem(`qrmenu_session_${session.sessionId}`, JSON.stringify(expiredSession));

      const activeSession = getActiveSession(session.sessionId);
      
      expect(activeSession).toBeNull();
      expect(sessionStorage.getItem(`qrmenu_session_${session.sessionId}`)).toBeNull();
    });
  });

  describe('4. Session Separation & Data Isolation', () => {
    it('should separate carts and session ids for different client instances', () => {
      const sessionA = createNewSession('shop-slug-a');
      const sessionB = createNewSession('shop-slug-a');

      const itemA = { id: 'dish-1', name: 'Filter Coffee', price: 60, emoji: '☕', quantity: 1 };
      const itemB = { id: 'dish-2', name: 'Lassi', price: 70, emoji: '🥤', quantity: 2 };

      updateSession(sessionA.sessionId, { cart: [itemA] });
      updateSession(sessionB.sessionId, { cart: [itemB] });

      const finalA = getActiveSession(sessionA.sessionId);
      const finalB = getActiveSession(sessionB.sessionId);

      expect(finalA?.cart[0].name).toBe('Filter Coffee');
      expect(finalB?.cart[0].name).toBe('Lassi');
      expect(finalA?.cart[0].name).not.toBe(finalB?.cart[0].name);
    });
  });
});
