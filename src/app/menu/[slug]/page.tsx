'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOwnerBySlug } from '@/services/ownerService';
import { getPublicMenuItems } from '@/services/menuService';
import { recordScan, recordSessionStart, recordItemViewed } from '@/services/analyticsService';
import { cn } from '@/utils';
import type { Owner, MenuItem } from '@/types/supabase';
import { useCartStore } from '@/store';
import { CartDrawer } from '@/components/features/menu/CartDrawer';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase';
import { getActiveCustomerSession } from '@/services/customerAuthService';
import toast from 'react-hot-toast';

interface PageProps { params: { slug: string }; }
const CAT_ICONS: Record<string,string> = { 'Hot Drinks':'☕','Cold Drinks':'🧋','Snacks':'🥐','Main Course':'🍛','Desserts':'🍰','Other':'📦' };

export default function CustomerMenuPage({ params }: PageProps) {
  const router = useRouter();
  const { t } = useTranslation('customer');

  const [owner, setOwner] = useState<Owner | any>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersHistoryOpen, setOrdersHistoryOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [waiterModalOpen, setWaiterModalOpen] = useState(false);
  const [tableInput, setTableInput] = useState('');
  const [waiterCallLoading, setWaiterCallLoading] = useState(false);

  const cart = useCartStore();

  useEffect(() => {
    if (cart.tableNumber) {
      setTableInput(cart.tableNumber);
    }
  }, [cart.tableNumber]);

  const handleCallWaiter = async () => {
    if (!tableInput.trim()) {
      toast.error(t.enterTable);
      return;
    }
    
    setWaiterCallLoading(true);
    const toastId = toast.loading(`${t.calling}`);
    try {
      const { error } = await supabase.from('waiter_calls').insert({
        owner_id: owner.id,
        table_number: `Table ${tableInput.trim()}`,
        status: 'pending',
      });
      
      if (error) throw error;
      
      toast.success(t.waiterCalled, { id: toastId });
      setWaiterModalOpen(false);
    } catch (err: any) {
      console.error('Call waiter failed:', err);
      toast.error(err.message || 'Failed to call waiter.', { id: toastId });
    } finally {
      setWaiterCallLoading(false);
    }
  };

  useEffect(() => {
    if (ordersHistoryOpen) {
      setCustomerOrders(cart.orderHistory);
    }
  }, [ordersHistoryOpen, cart.orderHistory]);

  useEffect(() => {
    async function load() {
      // 1. Check for active customer session
      const activeCustomer = await getActiveCustomerSession();
      if (!activeCustomer) {
        router.push(`/menu/${params.slug}/login`);
        return;
      }
      cart.setCustomer(activeCustomer);

      const ownerData = await getOwnerBySlug(params.slug);
      if (!ownerData) { setNotFound(true); setLoading(false); return; }

      // Get sid and table from URL
      let urlSid = null;
      let urlTable = null;
      if (typeof window !== 'undefined') {
        const urlParams = new URL(window.location.href).searchParams;
        urlSid = urlParams.get('sid');
        urlTable = urlParams.get('table');
      }

      // Initialize session
      const session = await cart.initializeSession(params.slug, urlSid);

      // Record session start and first view in database analytics
      await recordSessionStart(session.sessionId, params.slug, ownerData.id);
      await recordItemViewed(session.sessionId);

      if (urlTable) {
        cart.setTableNumber(urlTable);
        setTableInput(urlTable);
      }

      // Update URL with session ID
      if (typeof window !== 'undefined') {
        const nextParams = new URLSearchParams(window.location.search);
        nextParams.set('sid', session.sessionId);
        if (urlTable) {
          nextParams.set('table', urlTable);
        }
        const newUrl = `${window.location.pathname}?${nextParams.toString()}`;
        window.history.replaceState(null, '', newUrl);
      }

      // Subscribe to real-time status updates of customer's orders
      const channelName = `customer-orders-${session.sessionId}-${Math.random().toString(36).substring(2, 6)}`;
      const orderSub = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'session_orders',
            filter: `session_id=eq.${session.sessionId}`
          },
          (payload) => {
            // Sync store order history
            cart.syncOrderHistory();

            // Play notification bell
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-200.wav');
              audio.volume = 0.4;
              audio.play().catch(e => console.log('Audio playback pending interaction:', e));
            } catch (err) {
              console.error('Audio play failed:', err);
            }

            // Toast status update
            const updatedOrder = payload.new as any;
            toast.success(
              `${t.orderUpdated}: ${updatedOrder.status.toUpperCase()}! 🔔`,
              {
                duration: 6000,
                position: 'top-center',
                icon: '🔔',
              }
            );
          }
        )
        .subscribe();

      const [menuItems] = await Promise.all([getPublicMenuItems(ownerData.id), recordScan(ownerData.id)]);
      setOwner(ownerData); 
      setItems(menuItems); 
      setLoading(false);

      return () => {
        supabase.removeChannel(orderSub);
      };
    }
    const cleanUpFnPromise = load();

    return () => {
      cleanUpFnPromise.then((cleanUp) => {
        if (typeof cleanUp === 'function') {
          cleanUp();
        }
      });
    };
  }, [params.slug]);

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const filtered = items.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDiet = true;
    if (dietFilter === 'veg') {
      matchesDiet = (item as any).is_veg !== false;
    } else if (dietFilter === 'non-veg') {
      matchesDiet = (item as any).is_veg === false;
    }
    
    return matchesCategory && matchesSearch && matchesDiet;
  });

  if (loading) return (
    <div className="min-h-screen bg-[#0d1a12] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-accent/50 text-sm">{t.loadingMenu}</p>
      </div>
    </div>
  );

  if (notFound || !owner) return (
    <div className="min-h-screen bg-[#0d1a12] flex flex-col items-center justify-center text-center px-4">
      <p className="text-5xl mb-4">🔍</p>
      <h1 className="font-display font-black text-2xl text-accent mb-2">{t.shopNotFound}</h1>
      <p className="text-accent/50 text-sm mb-6">{t.shopNotFoundSub}</p>
      <Link href="/" className="text-accent text-sm border border-accent/30 px-4 py-2 rounded-lg hover:bg-accent/10 transition-colors no-underline">{t.createMenu}</Link>
    </div>
  );

  // Read theme colors
  const primaryColor = owner.theme_settings?.primaryColor || '#00e5a0';
  let customFont = owner.theme_settings?.fontFamily || 'Plus Jakarta Sans';
  if (customFont === 'Syne') customFont = 'Plus Jakarta Sans';

  return (
    <div className="min-h-screen bg-[#0d1a12] pb-24" style={{ fontFamily: customFont }}>
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 py-3 bg-[rgba(13,26,18,0.96)] backdrop-blur-xl border-b border-accent/15">
        <div className="min-w-0 flex-1">
          <p className="font-display font-black text-accent text-sm md:text-base leading-tight truncate" style={{ color: primaryColor }}>{owner.shop_avatar} {owner.shop_name}</p>
          {owner.shop_address && <p className="text-[10px] text-accent/50 truncate">{owner.shop_address}</p>}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language switcher for customer */}
          <LanguageSwitcher mode="customer" variant="pill" primaryColor={primaryColor} />

          {owner?.plan === 'business' && (
            <button
              onClick={() => setWaiterModalOpen(true)}
              className="text-xs bg-gold/10 border border-gold/20 text-gold px-3 py-1.5 rounded-lg hover:bg-gold/20 transition-all cursor-pointer flex items-center gap-1 font-sans font-bold"
            >
              🛎️ {t.callWaiter}
            </button>
          )}
          <button
            onClick={() => setOrdersHistoryOpen(true)}
            className="text-xs bg-accent/10 border border-accent/20 text-accent px-3 py-1.5 rounded-lg hover:bg-accent/20 transition-all cursor-pointer flex items-center gap-1 font-sans font-bold"
            style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
          >
            📋 {t.myOrders}
          </button>
          {cart.isAuthenticated && cart.customer ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] text-accent/70 font-sans font-bold hidden sm:inline bg-accent/5 px-2 py-1 rounded border border-accent/10" style={{ color: primaryColor, borderColor: `${primaryColor}20` }}>
                👤 {cart.customer.mobileNumber}
              </span>
              <button
                onClick={() => cart.logout().then(() => router.push(`/menu/${params.slug}/login`))}
                className="text-[10px] sm:text-xs border border-danger/25 text-danger bg-danger/5 px-2.5 py-1.5 rounded-lg hover:bg-danger/15 transition-all cursor-pointer font-bold font-sans"
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="ml-1 text-xs border border-accent/20 text-accent/70 px-3 py-1.5 rounded-lg hover:bg-accent/10 transition-colors no-underline flex-shrink-0">{t.ownerLink}</Link>
          )}
        </div>
      </nav>

      <div className="pt-[56px]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0a1f12] to-[#061510] px-4 py-10 md:py-14 text-center">
          <div className="absolute w-72 h-72 rounded-full bg-accent blur-[90px] opacity-[0.06] -top-24 left-1/2 -translate-x-1/2 pointer-events-none" style={{ backgroundColor: primaryColor }} />
          <div className="relative z-10">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl mx-auto mb-4">{owner.shop_avatar}</div>
            <h1 className="font-display font-black text-xl md:text-2xl text-accent mb-1 leading-tight" style={{ color: primaryColor }}>{owner.shop_name}</h1>
            {owner.shop_address && <p className="text-accent/50 text-xs md:text-sm">{owner.shop_address}</p>}
            <div className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent px-3 py-1.5 rounded-full text-xs font-bold mt-3" style={{ color: primaryColor, borderColor: `${primaryColor}30` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              {t.openNow}{owner.shop_hours ? ` · ${owner.shop_hours}` : ''}
            </div>
            {owner.shop_description && <p className="text-accent/40 text-xs mt-3 max-w-xs mx-auto leading-relaxed">{owner.shop_description}</p>}
          </div>
        </div>

        {/* Search Box & Diet Filter */}
        <div className="max-w-xl mx-auto px-4 pt-6 pb-2 space-y-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-accent/40 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-accent/10 focus:border-accent rounded-xl pl-10 pr-10 py-3 text-xs text-[#f0f0f5] placeholder:text-accent/30 outline-none transition-all"
              style={{ caretColor: primaryColor }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-accent/40 hover:text-accent text-xs bg-transparent border-none cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Diet Segmented Control */}
          <div className="flex bg-white/[0.02] border border-accent/10 rounded-xl p-1 gap-1">
            <button
              onClick={() => setDietFilter('all')}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-sans border-none",
                dietFilter === 'all'
                  ? "bg-white/[0.07] text-white"
                  : "bg-transparent text-accent/40 hover:text-accent/70"
              )}
            >
              {t.allDishes}
            </button>
            <button
              onClick={() => setDietFilter('veg')}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-sans border-none flex items-center justify-center gap-1",
                dietFilter === 'veg'
                  ? "bg-accent/15 text-accent border border-accent/20"
                  : "bg-transparent text-accent/40 hover:text-accent/70"
              )}
              style={dietFilter === 'veg' ? { backgroundColor: `${primaryColor}20`, color: primaryColor, borderColor: `${primaryColor}30` } : {}}
            >
              {t.vegOnly}
            </button>
            <button
              onClick={() => setDietFilter('non-veg')}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-sans border-none flex items-center justify-center gap-1",
                dietFilter === 'non-veg'
                  ? "bg-danger/15 text-danger border border-danger/20"
                  : "bg-transparent text-accent/40 hover:text-accent/70"
              )}
            >
              {t.nonVegOnly}
            </button>
          </div>
        </div>

        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-accent/10 scrollbar-none">
            <button onClick={() => setActiveCategory('all')} className={cn('px-3.5 py-2 rounded-full border text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer font-sans', activeCategory==='all' ? 'bg-accent/15 border-accent text-accent':'border-accent/20 text-accent/50 hover:bg-accent/5 bg-transparent')} style={activeCategory==='all' ? { backgroundColor: `${primaryColor}20`, borderColor: primaryColor, color: primaryColor } : {}}>🍽️ All</button>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={cn('px-3.5 py-2 rounded-full border text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer font-sans', activeCategory===cat ? 'bg-accent/15 border-accent text-accent':'border-accent/20 text-accent/50 hover:bg-accent/5 bg-transparent')} style={activeCategory===cat ? { backgroundColor: `${primaryColor}20`, borderColor: primaryColor, color: primaryColor } : {}}>
                {CAT_ICONS[cat]??'📦'} {cat}
              </button>
            ))}
          </div>
        )}

        <div className="max-w-xl mx-auto px-4 pt-3 pb-1">
          <p className="text-accent/30 text-xs">{filtered.length} {filtered.length !== 1 ? t.items : t.item}</p>
        </div>

        <div className="max-w-xl mx-auto px-4 py-3 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-accent/30"><p className="text-4xl mb-3">🍽️</p><p className="text-sm">{t.noItems}</p></div>
          ) : filtered.map((item) => (
            <div key={item.id} className="flex items-center gap-3 md:gap-4 bg-white/[0.03] border border-accent/10 rounded-2xl p-3.5 md:p-4 hover:border-accent/25 hover:bg-accent/[0.04] transition-all">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover flex-shrink-0 border border-accent/10" />
              ) : (
                <div className="w-14 h-14 md:w-16 md:h-16 bg-accent/8 rounded-xl flex items-center justify-center text-2xl md:text-3xl flex-shrink-0 border border-accent/10">{item.emoji}</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span 
                    className="w-3.5 h-3.5 border flex items-center justify-center flex-shrink-0" 
                    style={{ 
                      borderColor: (item as any).is_veg !== false ? '#00e5a0' : '#ea4335',
                      padding: '1px'
                    }}
                    title={(item as any).is_veg !== false ? 'Veg' : 'Non-Veg'}
                  >
                    <span 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ 
                        backgroundColor: (item as any).is_veg !== false ? '#00e5a0' : '#ea4335' 
                      }} 
                    />
                  </span>
                  <h3 className="font-bold text-[#f0f0f5] text-sm md:text-base leading-snug truncate">{item.name}</h3>
                </div>
                {item.description && <p className="text-white/35 text-xs mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>}
                <p className="text-accent/40 text-[10px] mt-1">{item.category}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="font-display font-black text-accent text-lg md:text-xl flex-shrink-0" style={{ color: primaryColor }}>₹{item.price}</div>
                <button
                  onClick={() => {
                    cart.addItem({ id: item.id, name: item.name, price: Number(item.price), emoji: item.emoji });
                    toast.success(`${item.name} added to cart! 🛒`);
                  }}
                  className="bg-accent/10 border border-accent/20 hover:bg-accent text-accent hover:text-bg text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                  style={{ borderColor: `${primaryColor}30`, color: primaryColor }}
                >
                  {t.addToCart}
                </button>
              </div>
            </div>
          ))}
        </div>

        {owner.plan === 'business' ? (
          <div className="text-center py-8 px-4 border-t border-accent/10">
            <p className="text-accent/30 text-xs">{owner.shop_name} © {new Date().getFullYear()}</p>
          </div>
        ) : (
          <div className="text-center py-8 px-4 border-t border-accent/10">
            <p className="text-accent/25 text-xs">{t.poweredBy} <Link href="/" className="text-accent font-bold hover:underline">QR-Menu</Link> · <Link href="/" className="text-accent hover:underline">{t.createFree}</Link></p>
          </div>
        )}
      </div>

      {/* Floating Cart Launcher Button */}
      {cart.items.length > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-accent hover:bg-accent/90 text-bg font-black px-6 py-3.5 rounded-full shadow-[0_4px_25px_rgba(0,229,160,0.3)] flex items-center gap-3 transition-transform hover:scale-105 cursor-pointer border-none z-50 text-sm"
          style={{ backgroundColor: primaryColor }}
        >
          <span>🛒 {t.viewCart}</span>
          <span className="bg-bg text-accent text-xs font-black w-5 h-5 rounded-full flex items-center justify-center" style={{ color: primaryColor }}>
            {cart.items.reduce((acc, i) => acc + i.quantity, 0)}
          </span>
        </button>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          ownerPhone={owner.shop_phone || '919999999999'}
          ownerId={owner.id}
          themeColor={primaryColor}
          razorpayLinkedAccountId={owner.razorpay_linked_account_id}
          platformCommissionPct={owner.platform_commission_pct}
          onClose={() => setCartOpen(false)}
        />
      )}

      {/* Customer Orders History Drawer */}
      {ordersHistoryOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOrdersHistoryOpen(false)} />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-[#0d1a12] border-l border-accent/10 h-full flex flex-col z-10 animate-fade-up" style={{ fontFamily: customFont }}>
            {/* Header */}
            <div className="p-4 border-b border-accent/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h2 className="font-display font-black text-lg text-accent" style={{ color: primaryColor }}>{t.myOrders}</h2>
                <span className="bg-accent/15 text-accent text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: primaryColor, backgroundColor: `${primaryColor}15` }}>
                  {customerOrders.length}
                </span>
              </div>
              <button onClick={() => setOrdersHistoryOpen(false)} className="text-accent/50 hover:text-accent transition-colors text-sm font-bold border-none bg-transparent cursor-pointer">✕</button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {customerOrders.length === 0 ? (
                <div className="text-center py-20 text-accent/30">
                  <span className="text-4xl block mb-2">🍽️</span>
                  <p className="text-sm">{t.noOrdersYet}</p>
                  <p className="text-[10px] text-accent/20 mt-1">{t.noOrdersHint}</p>
                </div>
              ) : (
                customerOrders.map((order: any) => (
                  <div key={order.id} className="bg-white/[0.02] border border-accent/10 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-xs text-accent" style={{ color: primaryColor }}>
                        {order.id.includes('-') && order.id.length > 15 ? `#${order.id.split('-')[0]}` : order.id}
                      </span>
                      <span className="bg-accent-2/10 text-accent-2 text-[10px] font-bold px-2 py-0.5 rounded-full">{order.table}</span>
                    </div>

                    <div className="text-xs text-[#f0f0f5] font-medium leading-relaxed">
                      {order.items}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-accent/10 text-xs">
                      <div>
                        <div className="text-accent/40 text-[9px]">{order.date}</div>
                        <div className="font-black text-sm text-[#f0f0f5] mt-0.5">₹{order.total}</div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold capitalize border ${
                          order.paymentStatus === 'paid'
                            ? 'bg-accent/10 text-accent border-accent/20'
                            : 'bg-gold/10 text-gold border-gold/20'
                        }`} style={order.paymentStatus === 'paid' ? { color: primaryColor, borderColor: `${primaryColor}20`, backgroundColor: `${primaryColor}10` } : {}}>
                          {order.paymentStatus === 'paid' ? t.paid : t.unpaid}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold capitalize border ${
                          order.status === 'completed'
                            ? 'bg-accent/10 text-accent border-accent/20'
                            : order.status === 'cancelled'
                            ? 'bg-danger/10 text-danger border-danger/20'
                            : 'bg-gold/10 text-gold border-gold/20'
                        }`} style={order.status === 'completed' ? { color: primaryColor, borderColor: `${primaryColor}20`, backgroundColor: `${primaryColor}10` } : {}}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Call Waiter Modal */}
      {waiterModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setWaiterModalOpen(false)} />

          {/* Modal Content */}
          <div className="relative w-full max-w-sm bg-[#0d1a12] border border-accent/15 rounded-2xl p-6 z-10 shadow-2xl animate-fade-up" style={{ fontFamily: customFont }}>
            <button
              onClick={() => setWaiterModalOpen(false)}
              className="absolute top-4 right-4 text-accent/50 hover:text-accent font-bold border-none bg-transparent cursor-pointer text-sm"
            >
              ✕
            </button>

            <div className="text-center space-y-4">
              <span className="text-4xl block animate-bounce">🛎️</span>
              <h3 className="font-display font-black text-lg text-accent" style={{ color: primaryColor }}>{t.callWaiterTitle}</h3>
              <p className="text-xs text-accent/60 leading-relaxed">
                {t.callWaiterDesc}
              </p>

              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  placeholder={t.tablePlaceholder}
                  value={tableInput}
                  onChange={(e) => setTableInput(e.target.value)}
                  className="w-full bg-white/[0.03] border border-accent/10 focus:border-accent rounded-xl px-4 py-3 text-center font-bold text-sm text-[#f0f0f5] placeholder:text-accent/20 outline-none transition-all"
                  style={{ caretColor: primaryColor }}
                />

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWaiterModalOpen(false)}
                    className="flex-1 bg-transparent hover:bg-white/[0.03] border border-accent/10 hover:border-accent/30 text-accent/70 hover:text-accent font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={handleCallWaiter}
                    disabled={waiterCallLoading}
                    className="flex-1 font-bold py-2.5 rounded-xl text-xs text-bg hover:opacity-90 transition-all cursor-pointer border-none"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {waiterCallLoading ? t.calling : t.callNow}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
