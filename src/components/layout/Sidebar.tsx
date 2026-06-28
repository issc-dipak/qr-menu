'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, useUIStore } from '@/store';
import { DASHBOARD_NAV, PLANS } from '@/constants';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  QrCode,
  TrendingUp,
  Users,
  Sparkles,
  Settings as SettingsIcon,
  CreditCard,
  Eye,
  LogOut
} from 'lucide-react';

// Map DASHBOARD_NAV href → translation key
const NAV_LABEL_KEYS: Record<string, string> = {
  '/dashboard/overview':   'overview',
  '/dashboard/menu':       'menuItems',
  '/dashboard/orders':     'orders',
  '/dashboard/qr':         'qrCode',
  '/dashboard/analytics':  'analytics',
  '/dashboard/sessions':   'sessions',
  '/dashboard/ask-ai':     'askAi',
  '/dashboard/settings':   'settings',
  '/dashboard/billing':    'billing',
};

const NAV_ICONS: Record<string, any> = {
  '/dashboard/overview': LayoutDashboard,
  '/dashboard/menu': UtensilsCrossed,
  '/dashboard/orders': ClipboardList,
  '/dashboard/qr': QrCode,
  '/dashboard/analytics': TrendingUp,
  '/dashboard/sessions': Users,
  '/dashboard/ask-ai': Sparkles,
  '/dashboard/settings': SettingsIcon,
  '/dashboard/billing': CreditCard,
};

export function Sidebar() {
  const pathname  = usePathname();
  const { owner, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { t } = useTranslation('owner');
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
        <div className="flex-1 p-3 space-y-1">
          <p className="text-[9px] font-bold tracking-widest uppercase text-muted/60 px-3 py-2">{t.main}</p>

          {DASHBOARD_NAV.slice(0,6).map((item) => {
            const labelKey = NAV_LABEL_KEYS[item.href];
            const label = labelKey ? String((t as any)[labelKey]) : item.label;
            const Icon = NAV_ICONS[item.href];
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn('sidebar-item group', isActive && 'active')}
              >
                {Icon ? (
                  <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-accent' : 'text-muted group-hover:text-[#f0f0f5]')} />
                ) : (
                  <span className="w-4 text-center text-base">{item.icon}</span>
                )}
                <span className="text-sm">{label}</span>
                {item.label === 'Menu Items' && (
                  <span className="ml-auto bg-accent/15 text-accent border border-accent/20 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{itemCount}</span>
                )}
              </Link>
            );
          })}

          <p className="text-[9px] font-bold tracking-widest uppercase text-muted/60 px-3 py-2 mt-3">{t.account}</p>

          {DASHBOARD_NAV.slice(6).map((item) => {
            const labelKey = NAV_LABEL_KEYS[item.href];
            const label = labelKey ? String((t as any)[labelKey]) : item.label;
            const Icon = NAV_ICONS[item.href];
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={cn('sidebar-item group', isActive && 'active')}>
                {Icon ? (
                  <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-accent' : 'text-muted group-hover:text-[#f0f0f5]')} />
                ) : (
                  <span className="w-4 text-center text-base">{item.icon}</span>
                )}
                <span className="text-sm">{label}</span>
              </Link>
            );
          })}

          <Link href="/menu/sharma-chai-corner" target="_blank" className="sidebar-item group">
            <Eye className="w-4 h-4 text-muted group-hover:text-[#f0f0f5] transition-colors" />
            <span className="text-sm">{t.previewMenu}</span>
          </Link>

          <button onClick={logout} className="sidebar-item text-danger hover:bg-danger/10 hover:text-danger mt-1 w-full group">
            <LogOut className="w-4 h-4 text-danger/80 group-hover:text-danger transition-colors" />
            <span className="text-sm">{t.logout}</span>
          </button>
        </div>

        {/* Language switcher */}
        <div className="px-2.5 pb-1">
          <LanguageSwitcher mode="owner" variant="compact" />
        </div>

        {/* Plan badge */}
        <div className="p-3">
          <div className="bg-white/[0.02] border border-border rounded-xl p-3">
            <p className="text-[9px] font-bold text-accent tracking-widest uppercase mb-1">{plan.name} {t.plan?.toUpperCase()}</p>
            <p className="text-xs text-muted mb-2">{itemCount}/{plan.maxItems === Infinity ? '∞' : plan.maxItems} {t.items}</p>
            <div className="bg-surface-3 rounded h-1.5 mb-3">
              <div className="h-1.5 rounded bg-gradient-to-r from-accent to-accent-3 transition-all"
                style={{ width: plan.maxItems === Infinity ? '10%' : `${(itemCount/plan.maxItems)*100}%` }} />
            </div>
            {owner?.plan === 'free' && (
              <Link href="/dashboard/billing" onClick={() => setSidebarOpen(false)} className="btn-primary w-full text-xs py-2 rounded-lg flex items-center justify-center no-underline">
                {t.upgrade}
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
