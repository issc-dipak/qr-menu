import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useMenuStore, useAuthStore, usePlanLimit } from '@/store';
import { copyToClipboard } from '@/utils';
import type { MenuItem, LoginFormData, SignupFormData } from '@/types';

// ─── useMenu ──────────────────────────────────────────────────
export function useMenu() {
  const { items, addItem, updateItem, deleteItem } = useMenuStore();
  const { owner } = useAuthStore();
  const { isAtLimit, plan } = usePlanLimit();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const handleAdd = useCallback(
    (data: any) => {
      if (!owner) {
        toast.error('Not authenticated');
        return;
      }
      if (isAtLimit) {
        toast.error(`Limit reached! You can add up to ${plan.maxItems} items on the ${plan.name} plan. Please upgrade to add more.`);
        return;
      }
      addItem(owner.id, data);
      setIsModalOpen(false);
      setEditingItem(null);
    },
    [addItem, owner, isAtLimit, plan]
  );

  const handleUpdate = useCallback(
    (id: string, data: Partial<MenuItem>) => {
      updateItem(id, data);
      setIsModalOpen(false);
      setEditingItem(null);
      toast.success('Item updated!');
    },
    [updateItem]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteItem(id);
      toast.success('Item deleted');
    },
    [deleteItem]
  );

  const openEdit = useCallback((item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  const openAdd = useCallback(() => {
    if (isAtLimit) {
      toast.error(`Limit reached! You can add up to ${plan.maxItems} items on the ${plan.name} plan. Please upgrade to add more.`);
      return;
    }
    setEditingItem(null);
    setIsModalOpen(true);
  }, [isAtLimit, plan]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
  }, []);

  return {
    items: filteredItems,
    totalItems: items.length,
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    isModalOpen,
    editingItem,
    handleAdd,
    handleUpdate,
    handleDelete,
    openEdit,
    openAdd,
    closeModal,
  };
}

// ─── useAuth ──────────────────────────────────────────────────
export function useAuth() {
  const { loginWithEmail: login, loginWithGoogle, signup, logout, isAuthenticated, owner } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (success) toast.success('Welcome back!');
      return success;
    } catch {
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setLoading(true);
    try {
      const success = await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        shopName: data.shopName,
        category: data.category,
      });
      if (success) {
        localStorage.removeItem('owner-orders-history');
        toast.success('Account created!');
      }
      return success;
    } catch {
      toast.error('Signup failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      return true;
    } catch {
      toast.error('Google login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, handleSignup, handleGoogle, logout, loading, isAuthenticated, owner };
}

// ─── useCopyLink ──────────────────────────────────────────────
export function useCopyLink() {
  const handleCopy = useCallback(async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) toast.success('Link copied!');
    else toast.error('Copy failed');
  }, []);
  return { handleCopy };
}

// ─── useDisclosure ────────────────────────────────────────────
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  const open  = useCallback(() => setIsOpen(true),  []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((s) => !s), []);
  return { isOpen, open, close, toggle };
}
