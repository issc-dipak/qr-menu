'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/index';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useAuthStore, useLangStore } from '@/store';
import { SHOP_CATEGORIES, LANGUAGES } from '@/constants';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils';
import toast from 'react-hot-toast';
import type { LangCode } from '@/i18n/translations';

type Tab = 'profile' | 'shop' | 'theme' | 'notifications' | 'language' | 'danger';

export default function SettingsPage() {
  const { owner, updateOwner } = useAuthStore();
  const { ownerLang, setOwnerLang } = useLangStore();
  const { t } = useTranslation('owner');
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [notifs, setNotifs] = useState({ daily: true, weekly: true, product: false, marketing: true });
  const [themeForm, setThemeForm] = useState<{ primaryColor: string; fontFamily: string; layout: 'grid' | 'list' }>({ primaryColor: '#00e5a0', fontFamily: 'Syne', layout: 'grid' });

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile',       label: t.tabProfile,       icon: '👤' },
    { id: 'shop',          label: t.tabShop,           icon: '🏪' },
    { id: 'theme',         label: t.tabTheme,          icon: '🎨' },
    { id: 'notifications', label: t.tabNotifications,  icon: '🔔' },
    { id: 'language',      label: t.tabLanguage,       icon: '🌐' },
    { id: 'danger',        label: t.tabDanger,         icon: '⚠️' },
  ];

  const CAT_OPTIONS = SHOP_CATEGORIES.map((c) => ({ value: c, label: c }));

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
        <h1 className="font-display font-black text-2xl">{t.settingsTitle}</h1>
        <p className="text-muted text-sm mt-1">{t.settingsSubtitle}</p>
      </div>

      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        {/* Tab Nav */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto flex-nowrap scrollbar-none pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all border-none font-sans text-left cursor-pointer w-auto lg:w-full flex-shrink-0',
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
              <h3 className="font-display font-bold mb-1">{t.profileTitle}</h3>
              <p className="text-muted text-sm mb-5">{t.profileSubtitle}</p>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center text-3xl flex-shrink-0">
                  👨
                </div>
                <Button variant="ghost" size="sm">{t.changePhoto}</Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label={t.labelFullName} value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                  <Input label={t.labelEmail} type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                </div>
                <Input label={t.labelPhone} value={profileForm.shop_phone} onChange={(e) => setProfileForm({ ...profileForm, shop_phone: e.target.value })} />
                <Button size="sm" onClick={saveProfile}>{t.saveChanges}</Button>
              </div>
            </div>
          )}

          {/* ── SHOP ── */}
          {activeTab === 'shop' && (
            <div className="card">
              <h3 className="font-display font-bold mb-1">{t.shopTitle}</h3>
              <p className="text-muted text-sm mb-5">{t.shopSubtitle}</p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label={t.labelShopName} value={shopForm.shop_name} onChange={(e) => setShopForm({ ...shopForm, shop_name: e.target.value })} />
                  <Select label={t.labelCategory} options={CAT_OPTIONS} value={shopForm.shop_category} onChange={(e) => setShopForm({ ...shopForm, shop_category: e.target.value })} />
                </div>
                <Input label={t.labelAddress} value={shopForm.shop_address} onChange={(e) => setShopForm({ ...shopForm, shop_address: e.target.value })} placeholder={t.placeholderAddress} />
                <Textarea label={t.labelDescription} value={shopForm.shop_description} onChange={(e) => setShopForm({ ...shopForm, shop_description: e.target.value })} placeholder={t.placeholderDescription} />
                <Input label={t.labelHours} value={shopForm.shop_hours} onChange={(e) => setShopForm({ ...shopForm, shop_hours: e.target.value })} placeholder={t.placeholderHours} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label={t.labelRazorpay} value={shopForm.razorpay_linked_account_id} onChange={(e) => setShopForm({ ...shopForm, razorpay_linked_account_id: e.target.value })} placeholder={t.placeholderRazorpay} />
                  <Input label={t.labelCommission} value={String(shopForm.platform_commission_pct)} disabled placeholder="2.00" />
                </div>
                <Button size="sm" onClick={saveShop}>{t.saveChanges}</Button>
              </div>
            </div>
          )}

          {/* ── THEME ── */}
          {activeTab === 'theme' && (
            <div className="card">
              <h3 className="font-display font-bold mb-1">{t.themeTitle}</h3>
              <p className="text-muted text-sm mb-5">{t.themeSubtitle}</p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">{t.labelPrimaryColor}</label>
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
                    label={t.labelFont}
                    options={[
                      { value: 'Syne', label: t.fontModern },
                      { value: 'DM Sans', label: t.fontClean },
                      { value: 'sans-serif', label: t.fontStandard },
                    ]}
                    value={themeForm.fontFamily}
                    onChange={(e) => setThemeForm({ ...themeForm, fontFamily: e.target.value })}
                  />

                  <Select
                    label={t.labelLayout}
                    options={[
                      { value: 'grid', label: t.layoutGrid },
                      { value: 'list', label: t.layoutList },
                    ]}
                    value={themeForm.layout}
                    onChange={(e) => setThemeForm({ ...themeForm, layout: e.target.value as 'grid' | 'list' })}
                  />
                </div>

                <div className="pt-2">
                  <Button size="sm" onClick={saveTheme}>{t.saveTheme}</Button>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'notifications' && (
            <div className="card">
              <h3 className="font-display font-bold mb-1">{t.notifTitle}</h3>
              <p className="text-muted text-sm mb-5">{t.notifSubtitle}</p>

              <div className="divide-y divide-border">
                {[
                  { key: 'daily',     title: t.notifDaily,     sub: t.notifDailySub },
                  { key: 'weekly',    title: t.notifWeekly,    sub: t.notifWeeklySub },
                  { key: 'product',   title: t.notifProduct,   sub: t.notifProductSub },
                  { key: 'marketing', title: t.notifMarketing, sub: t.notifMarketingSub },
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
                {t.savePreferences}
              </Button>
            </div>
          )}

          {/* ── LANGUAGE ── */}
          {activeTab === 'language' && (
            <div className="card">
              <h3 className="font-display font-bold mb-1">{t.languageTitle}</h3>
              <p className="text-muted text-sm mb-6">{t.languageSubtitle}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setOwnerLang(lang.code as LangCode);
                      toast.success(t.languageSaved);
                    }}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer font-sans',
                      ownerLang === lang.code
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-surface-2 text-muted hover:border-accent/40 hover:text-[#f0f0f5]'
                    )}
                  >
                    <span className="text-3xl">{lang.flag}</span>
                    <div>
                      <p className={cn('font-bold text-sm', ownerLang === lang.code ? 'text-accent' : 'text-[#f0f0f5]')}>
                        {lang.nativeLabel}
                      </p>
                      <p className="text-xs text-muted">{lang.label}</p>
                    </div>
                    {ownerLang === lang.code && (
                      <span className="ml-auto text-accent text-lg">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <p className="text-muted text-xs mt-5 leading-relaxed">
                ℹ️ This changes the dashboard language only. Your customers can switch language separately on the menu page.
              </p>
            </div>
          )}

          {/* ── DANGER ZONE ── */}
          {activeTab === 'danger' && (
            <div className="bg-danger/5 border border-danger/20 rounded-card p-6">
              <h3 className="font-display font-bold text-danger mb-1">{t.dangerTitle}</h3>
              <p className="text-danger/60 text-sm mb-6">{t.dangerSubtitle}</p>

              <div className="space-y-4">
                {[
                  { title: t.resetMenu,      sub: t.resetMenuSub,      action: () => toast.error('⚠️ This would delete all items') },
                  { title: t.deleteAccount,  sub: t.deleteAccountSub,  action: () => toast.error('⚠️ Account deletion requires email confirmation') },
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
