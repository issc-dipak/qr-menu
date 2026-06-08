'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  tableNumber: string;
  setTableNumber: (table: string) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: '',
      setTableNumber: (tableNumber) => set({ tableNumber }),
      addItem: (newItem) => {
        const currentItems = get().items;
        const exists = currentItems.find((item) => item.id === newItem.id);
        if (exists) {
          set({
            items: currentItems.map((item) =>
              item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          });
        } else {
          set({ items: [...currentItems, { ...newItem, quantity: 1 }] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
        } else {
          set({
            items: get().items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          });
        }
      },
      clearCart: () => set({ items: [], tableNumber: '' }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'qr-menu-cart',
    }
  )
);
