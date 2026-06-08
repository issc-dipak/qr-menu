'use client';
import { useEffect } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuthStore, useMenuStore, useAnalyticsStore } from '@/store';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { owner, isAuthenticated, initialize, loading: authLoading } = useAuthStore();
  const { fetchItems } = useMenuStore();
  const { fetchAnalytics } = useAnalyticsStore();
  const router = useRouter();

  // Initialize auth session on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Redirect if not authenticated after initialization
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch data as soon as owner is resolved
  useEffect(() => {
    if (owner?.id) {
      fetchItems(owner.id);
      fetchAnalytics(owner.id);
    }
  }, [owner?.id, fetchItems, fetchAnalytics]);

  if (authLoading || (!owner && !isAuthenticated)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg text-[#f0f0f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent"></div>
          <span className="text-sm text-muted">Securing session...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardHeader />
      <div className="flex pt-[60px] min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-[220px] p-4 md:p-6 lg:p-8 min-h-screen bg-bg transition-all duration-300">
          {children}
        </main>
      </div>
    </>
  );
}
