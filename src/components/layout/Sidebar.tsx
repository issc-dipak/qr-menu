'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, useUIStore } from '@/store';
import { DASHBOARD_NAV, PLANS } from '@/constants';
import { cn } from '@/utils';

export function Sidebar() {
  const pathname  = usePathname();
  const { owner, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const plan      = PLANS.find((p) => p.id === owner?.plan) ?? PLANS[0];
  const itemCount = 8;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed top-[60px] left-0 bottom-0 w-[220px] bg-surface border-r border-border flex flex-col z-40 overflow-y-auto transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0'
      )}>
        <div className="flex-1 p-2.5 space-y-0.5">
          <p className="text-[9px] font-bold tracking-widest uppercase text-muted px-3 py-2">Main</p>

          {DASHBOARD_NAV.slice(0,6).map((item) => (
            <Link
              key={item.href} href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn('sidebar-item', pathname === item.href && 'active')}
            >
              <span className="w-5 text-center text-base">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
              {item.label === 'Menu Items' && (
                <span className="ml-auto bg-accent text-bg text-[9px] font-bold px-1.5 py-0.5 rounded-full">{itemCount}</span>
              )}
            </Link>
          ))}

          <p className="text-[9px] font-bold tracking-widest uppercase text-muted px-3 py-2 mt-3">Account</p>

          {DASHBOARD_NAV.slice(6).map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              className={cn('sidebar-item', pathname === item.href && 'active')}>
              <span className="w-5 text-center text-base">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}

          <Link href="/menu/sharma-chai-corner" target="_blank" className="sidebar-item">
            <span className="w-5 text-center text-base">👁</span>
            <span className="text-sm">Preview Menu</span>
          </Link>

          <button onClick={logout} className="sidebar-item text-danger hover:bg-danger/10 hover:text-danger mt-1 w-full">
            <span className="w-5 text-center text-base">🚪</span>
            <span className="text-sm">Logout</span>
          </button>
        </div>

        {/* Plan badge */}
        <div className="p-3">
          <div className="bg-accent/5 border border-accent/15 rounded-xl p-3">
            <p className="text-[9px] font-bold text-accent tracking-widest uppercase mb-1">{plan.name} PLAN</p>
            <p className="text-xs text-muted mb-2">{itemCount}/{plan.maxItems === Infinity ? '∞' : plan.maxItems} items</p>
            <div className="bg-surface-2 rounded h-1.5 mb-3">
              <div className="h-1.5 rounded bg-gradient-to-r from-accent to-accent-2 transition-all"
                style={{ width: plan.maxItems === Infinity ? '10%' : `${(itemCount/plan.maxItems)*100}%` }} />
            </div>
            {owner?.plan === 'free' && (
              <Link href="/dashboard/billing" className="btn-primary w-full text-xs py-2 rounded-lg flex items-center justify-center no-underline">
                Upgrade ⚡
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
