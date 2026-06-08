'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/index';
import { useAuthStore } from '@/store';
import { SHOP_CATEGORIES } from '@/constants';
import { cn } from '@/utils';
import toast from 'react-hot-toast';

type Tab = 'profile' | 'shop' | 'theme' | 'notifications' | 'danger';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'profile',       label: 'Profile',       icon: '👤' },
  { id: 'shop',          label: 'Shop Info',      icon: '🏪' },
  { id: 'theme',         label: 'Menu Theme',     icon: '🎨' },
  { id: 'notifications', label: 'Notifications',  icon: '🔔' },
  { id: 'danger',        label: 'Danger Zone',    icon: '⚠️' },
];

const CAT_OPTIONS = SHOP_CATEGORIES.map((c) => ({ value: c, label: c }));

export default function SettingsPage() {
  const { owner, updateOwner } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [notifs, setNotifs] = useState({ daily: true, weekly: true, product: false, marketing: true });
  const [themeForm, setThemeForm] = useState<{ primaryColor: string; fontFamily: string; layout: 'grid' | 'list' }>({ primaryColor: '#00e5a0', fontFamily: 'Syne', layout: 'grid' });

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    shop_phone: '',
  });

  const [shopForm, setShopForm] = useState({
    shop_name: '',
    shop_category: '',
    shop_address: '',
    shop_description: '',
    shop_hours: '',
    razorpay_linked_account_id: '',
    platform_commission_pct: 2.00,
  });

  useEffect(() => {
    if (owner) {
      setProfileForm({
        name: owner.name || '',
        email: owner.email || '',
        shop_phone: owner.shop_phone || '',
      });
      setShopForm({
        shop_name: owner.shop_name || '',
        shop_category: owner.shop_category || '',
        shop_address: owner.shop_address || '',
        shop_description: owner.shop_description || '',
        shop_hours: owner.shop_hours || '',
        razorpay_linked_account_id: owner.razorpay_linked_account_id || '',
        platform_commission_pct: owner.platform_commission_pct || 2.00,
      });
      if (owner.theme_settings) {
        setThemeForm({
          primaryColor: owner.theme_settings.primaryColor || '#00e5a0',
          fontFamily: owner.theme_settings.fontFamily || 'Syne',
          layout: owner.theme_settings.layout || 'grid',
        });
      }
    }
  }, [owner]);

  const saveProfile = async () => {
    const success = await updateOwner(profileForm);
    if (success) toast.success('Profile updated! ✅');
  };

  const saveShop = async () => {
    const success = await updateOwner(shopForm);
    if (success) toast.success('Shop details updated! ✅');
  };

  const saveTheme = async () => {
    const success = await updateOwner({ theme_settings: themeForm });
    if (success) toast.success('Theme settings saved! 🎨');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-black text-2xl">Settings</h1>
        <p className="text-muted text-sm mt-1">Manage your account & shop details</p>
      </div>

      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        {/* Tab Nav */}
        <nav className="flex lg:flex-col gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all border-none font-sans text-left cursor-pointer w-full',
                activeTab === tab.id
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'bg-transparent text-muted hover:bg-white/4 hover:text-[#f0f0f5]'
              )}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="space-y-5">

          {/* ── PROFILE ── */}
          {activeTab === 'profile' && (
            <div className="card">
              <h3 className="font-display font-bold mb-1">Profile Information</h3>
              <p className="text-muted text-sm mb-5">Update your personal details</p>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center text-3xl flex-shrink-0">
                  👨
                </div>
                <Button variant="ghost" size="sm">Change Photo</Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Full Name" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                  <Input label="Email" type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                </div>
                <Input label="Phone" value={profileForm.shop_phone} onChange={(e) => setProfileForm({ ...profileForm, shop_phone: e.target.value })} />
                <Button size="sm" onClick={saveProfile}>Save Changes</Button>
              </div>
            </div>
          )}

          {/* ── SHOP ── */}
          {activeTab === 'shop' && (
            <div className="card">
              <h3 className="font-display font-bold mb-1">Shop Information</h3>
              <p className="text-muted text-sm mb-5">This appears on your customer menu</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Shop Name" value={shopForm.shop_name} onChange={(e) => setShopForm({ ...shopForm, shop_name: e.target.value })} />
                  <Select label="Category" options={CAT_OPTIONS} value={shopForm.shop_category} onChange={(e) => setShopForm({ ...shopForm, shop_category: e.target.value })} />
                </div>
                <Input label="Address" value={shopForm.shop_address} onChange={(e) => setShopForm({ ...shopForm, shop_address: e.target.value })} placeholder="Sector 14, Delhi" />
                <Textarea label="Description" value={shopForm.shop_description} onChange={(e) => setShopForm({ ...shopForm, shop_description: e.target.value })} placeholder="Tell customers about your shop..." />
                <Input label="Opening Hours" value={shopForm.shop_hours} onChange={(e) => setShopForm({ ...shopForm, shop_hours: e.target.value })} placeholder="7 AM – 10 PM" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Razorpay Linked Account ID" value={shopForm.razorpay_linked_account_id} onChange={(e) => setShopForm({ ...shopForm, razorpay_linked_account_id: e.target.value })} placeholder="E.g., acc_N9hE4t78XopQW" />
                  <Input label="Platform Commission (%)" value={String(shopForm.platform_commission_pct)} disabled placeholder="2.00" />
                </div>
                <Button size="sm" onClick={saveShop}>Save Changes</Button>
              </div>
            </div>
          )}
          {/* ── THEME ── */}
          {activeTab === 'theme' && (
            <div className="card">
              <h3 className="font-display font-bold mb-1">Menu Theme Customizer</h3>
              <p className="text-muted text-sm mb-5">Personalize the styling and layouts of your public QR menu</p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Primary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        className="w-10 h-10 border border-border bg-transparent rounded-lg cursor-pointer"
                        value={themeForm.primaryColor}
                        onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                      />
                      <input
                        type="text"
                        className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-[#f0f0f5] outline-none"
                        value={themeForm.primaryColor}
                        onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                      />
                    </div>
                  </div>

                  <Select
                    label="Typography Font"
                    options={[
                      { value: 'Syne', label: 'Syne (Modern Bold)' },
                      { value: 'DM Sans', label: 'DM Sans (Clean)' },
                      { value: 'sans-serif', label: 'Sans-Serif (Standard)' },
                    ]}
                    value={themeForm.fontFamily}
                    onChange={(e) => setThemeForm({ ...themeForm, fontFamily: e.target.value })}
                  />

                  <Select
                    label="Menu Layout"
                    options={[
                      { value: 'grid', label: 'Grid Cards (2-cols)' },
                      { value: 'list', label: 'List Style (Compact)' },
                    ]}
                    value={themeForm.layout}
                    onChange={(e) => setThemeForm({ ...themeForm, layout: e.target.value as 'grid' | 'list' })}
                  />
                </div>

                <div className="pt-2">
                  <Button size="sm" onClick={saveTheme}>Save Theme Settings 🎨</Button>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'notifications' && (
            <div className="card">
              <h3 className="font-display font-bold mb-1">Notification Settings</h3>
              <p className="text-muted text-sm mb-5">Choose what updates you receive</p>

              <div className="divide-y divide-border">
                {[
                  { key: 'daily',     title: 'Daily Scan Summary',   sub: 'Get a daily report of how many people scanned' },
                  { key: 'weekly',    title: 'Weekly Analytics',      sub: 'Weekly summary every Monday morning' },
                  { key: 'product',   title: 'Product Updates',       sub: 'New features and improvements' },
                  { key: 'marketing', title: 'Marketing Tips',        sub: 'Tips to get more customers' },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted mt-0.5">{n.sub}</p>
                    </div>
                    <Toggle
                      checked={notifs[n.key as keyof typeof notifs]}
                      onChange={(v) => setNotifs((s) => ({ ...s, [n.key]: v }))}
                    />
                  </div>
                ))}
              </div>

              <Button size="sm" className="mt-4" onClick={() => toast.success('Notification preferences saved! ✅')}>
                Save Preferences
              </Button>
            </div>
          )}

          {/* ── DANGER ZONE ── */}
          {activeTab === 'danger' && (
            <div className="bg-danger/5 border border-danger/20 rounded-card p-6">
              <h3 className="font-display font-bold text-danger mb-1">⚠️ Danger Zone</h3>
              <p className="text-danger/60 text-sm mb-6">These actions are permanent and cannot be undone.</p>

              <div className="space-y-4">
                {[
                  { title: 'Reset Menu',      sub: 'Delete all menu items permanently',          action: () => toast.error('⚠️ This would delete all items') },
                  { title: 'Delete Account',  sub: 'Permanently delete your account and all data', action: () => toast.error('⚠️ Account deletion requires email confirmation') },
                ].map((d) => (
                  <div key={d.title} className="flex items-center justify-between flex-wrap gap-3 py-3 border-b border-danger/10 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{d.title}</p>
                      <p className="text-xs text-muted mt-0.5">{d.sub}</p>
                    </div>
                    <Button variant="danger" size="sm" onClick={d.action}>{d.title}</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
