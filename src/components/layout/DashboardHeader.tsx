'use client';
import Link from 'next/link';
import { useAuthStore, useUIStore } from '@/store';

export function DashboardHeader() {
  const { owner } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 md:px-6 h-[60px] bg-bg/90 backdrop-blur-2xl border-b border-border">
      <div className="flex items-center gap-3">
        {/* Mobile sidebar toggle */}
        <button onClick={toggleSidebar} className="lg:hidden p-1.5 text-muted hover:text-[#f0f0f5] cursor-pointer border-none bg-transparent flex items-center justify-center" aria-label="Toggle sidebar">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/" className="flex items-center gap-2 font-display font-black text-base text-[#f0f0f5] no-underline">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center text-xs flex-shrink-0">🔳</span>
          <span className="hidden sm:block">QR-Menu</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted hidden md:block truncate max-w-[160px]">
          {owner?.shop_avatar} {owner?.shop_name}
        </span>
        <Link href={owner?.shop_slug ? `/menu/${owner.shop_slug}` : '#'} target="_blank" className="btn-ghost text-xs px-3 py-1.5 rounded-lg no-underline">
          <span className="hidden sm:inline">👁 Preview</span>
          <span className="sm:hidden">👁</span>
        </Link>
      </div>
    </header>
  );
}
