'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOwnerBySlug } from '@/services/ownerService';
import { getPublicMenuItems } from '@/services/menuService';
import { recordScan } from '@/services/analyticsService';
import { cn } from '@/utils';
import type { Owner, MenuItem } from '@/types/supabase';
import { useCartStore } from '@/store';
import { CartDrawer } from '@/components/features/menu/CartDrawer';
import toast from 'react-hot-toast';

interface PageProps { params: { slug: string }; }
const CAT_ICONS: Record<string,string> = { 'Hot Drinks':'☕','Cold Drinks':'🧋','Snacks':'🥐','Main Course':'🍛','Desserts':'🍰','Other':'📦' };

export default function CustomerMenuPage({ params }: PageProps) {
  const [owner, setOwner] = useState<Owner | any>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const cart = useCartStore();

  useEffect(() => {
    async function load() {
      const ownerData = await getOwnerBySlug(params.slug);
      if (!ownerData) { setNotFound(true); setLoading(false); return; }
      const [menuItems] = await Promise.all([getPublicMenuItems(ownerData.id), recordScan(ownerData.id)]);
      setOwner(ownerData); setItems(menuItems); setLoading(false);
    }
    load();
  }, [params.slug]);

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const filtered   = activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory);

  if (loading) return (
    <div className="min-h-screen bg-[#0d1a12] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-accent/50 text-sm">Loading menu...</p>
      </div>
    </div>
  );

  if (notFound || !owner) return (
    <div className="min-h-screen bg-[#0d1a12] flex flex-col items-center justify-center text-center px-4">
      <p className="text-5xl mb-4">🔍</p>
      <h1 className="font-display font-black text-2xl text-accent mb-2">Shop not found</h1>
      <p className="text-accent/50 text-sm mb-6">This menu link does not exist.</p>
      <Link href="/" className="text-accent text-sm border border-accent/30 px-4 py-2 rounded-lg hover:bg-accent/10 transition-colors no-underline">Create your own menu →</Link>
    </div>
  );

  // Read theme colors
  const primaryColor = owner.theme_settings?.primaryColor || '#00e5a0';
  const customFont = owner.theme_settings?.fontFamily || 'Syne';

  return (
    <div className="min-h-screen bg-[#0d1a12] pb-24" style={{ fontFamily: customFont }}>
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 py-3 bg-[rgba(13,26,18,0.96)] backdrop-blur-xl border-b border-accent/15">
        <div className="min-w-0 flex-1">
          <p className="font-display font-black text-accent text-sm md:text-base leading-tight truncate" style={{ color: primaryColor }}>{owner.shop_avatar} {owner.shop_name}</p>
          {owner.shop_address && <p className="text-[10px] text-accent/50 truncate">{owner.shop_address}</p>}
        </div>
        <Link href="/auth/login" className="ml-3 text-xs border border-accent/20 text-accent/70 px-3 py-1.5 rounded-lg hover:bg-accent/10 transition-colors no-underline flex-shrink-0">Owner →</Link>
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
              Open Now{owner.shop_hours ? ` · ${owner.shop_hours}` : ''}
            </div>
            {owner.shop_description && <p className="text-accent/40 text-xs mt-3 max-w-xs mx-auto leading-relaxed">{owner.shop_description}</p>}
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
          <p className="text-accent/30 text-xs">{filtered.length} item{filtered.length!==1?'s':''}</p>
        </div>

        <div className="max-w-xl mx-auto px-4 py-3 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-accent/30"><p className="text-4xl mb-3">🍽️</p><p className="text-sm">No items here yet</p></div>
          ) : filtered.map((item) => (
            <div key={item.id} className="flex items-center gap-3 md:gap-4 bg-white/[0.03] border border-accent/10 rounded-2xl p-3.5 md:p-4 hover:border-accent/25 hover:bg-accent/[0.04] transition-all">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover flex-shrink-0 border border-accent/10" />
              ) : (
                <div className="w-14 h-14 md:w-16 md:h-16 bg-accent/8 rounded-xl flex items-center justify-center text-2xl md:text-3xl flex-shrink-0 border border-accent/10">{item.emoji}</div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#f0f0f5] text-sm md:text-base leading-snug">{item.name}</h3>
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
                  + Add
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
            <p className="text-accent/25 text-xs">Powered by <Link href="/" className="text-accent font-bold hover:underline">QR-Menu</Link> · <Link href="/" className="text-accent hover:underline">Create your free menu</Link></p>
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
          <span>🛒 View Cart</span>
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
    </div>
  );
}
