'use client';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/utils';

const CAT_ICONS: Record<string, string> = {
  'Hot Drinks': '☕',
  'Cold Drinks': '🧋',
  'Snacks': '🥐',
  'Main Course': '🍛',
  'Desserts': '🍰',
  'Other': '📦',
};

const DEMO_SHOP = {
  name: 'Dipak Chai Corner',
  avatar: '☕',
  address: 'Sector 21, Gandhinagar',
  hours: '7 AM – 10 PM',
  description: 'Premium chai, snacks & more. Fresh ingredients daily.',
  plan: 'pro',
};

const DEMO_ITEMS = [
  { id: '1', emoji: '🍵', name: 'Masala Chai', description: 'Fresh ginger, cardamom & tulsi', price: 20, category: 'Hot Drinks', status: 'active' as const, image_url: null },
  { id: '2', emoji: '☕', name: 'Filter Coffee', description: 'South Indian style decoction', price: 30, category: 'Hot Drinks', status: 'active' as const, image_url: null },
  { id: '3', emoji: '🫖', name: 'Green Tea', description: 'Refreshing & healthy', price: 25, category: 'Hot Drinks', status: 'active' as const, image_url: null },
  { id: '4', emoji: '🧋', name: 'Cold Coffee', description: 'Chilled & creamy with ice cream', price: 60, category: 'Cold Drinks', status: 'active' as const, image_url: null },
  { id: '5', emoji: '🍋', name: 'Nimbu Pani', description: 'Fresh lemon, mint & black salt', price: 20, category: 'Cold Drinks', status: 'active' as const, image_url: null },
  { id: '6', emoji: '🥤', name: 'Mango Lassi', description: 'Thick, sweet & fresh', price: 45, category: 'Cold Drinks', status: 'active' as const, image_url: null },
  { id: '7', emoji: '🥐', name: 'Butter Toast', description: 'Toasted with jam & butter', price: 25, category: 'Snacks', status: 'active' as const, image_url: null },
  { id: '8', emoji: '🥪', name: 'Veg Sandwich', description: 'Veggies, chutney & cheese', price: 50, category: 'Snacks', status: 'active' as const, image_url: null },
  { id: '9', emoji: '🥜', name: 'Samosa (2 pcs)', description: 'Crispy with tamarind chutney', price: 20, category: 'Snacks', status: 'active' as const, image_url: null },
  { id: '10', emoji: '🍩', name: 'Gulab Jamun', description: 'Soft, syrupy & warm', price: 30, category: 'Desserts', status: 'active' as const, image_url: null },
];

export default function DemoPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = Array.from(new Set(DEMO_ITEMS.map((i) => i.category)));
  const filtered = activeCategory === 'all' ? DEMO_ITEMS : DEMO_ITEMS.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0d1a12]">
      {/* Demo Banner */}
      <div className="bg-accent/10 border-b border-accent/20 text-center py-2 px-4">
        <p className="text-accent text-xs font-bold tracking-wider">
          👀 This is a Live Demo — <Link href="/auth/signup" className="underline text-accent hover:text-accent/80">Create your own free menu →</Link>
        </p>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[rgba(13,26,18,0.96)] backdrop-blur-xl border-b border-accent/15">
        <div className="min-w-0 flex-1">
          <p className="font-display font-black text-accent text-sm md:text-base leading-tight truncate">
            {DEMO_SHOP.avatar} {DEMO_SHOP.name}
          </p>
          <p className="text-[10px] text-accent/50 truncate">{DEMO_SHOP.address}</p>
        </div>
        <Link href="/auth/login" className="ml-3 text-xs border border-accent/20 text-accent/70 px-3 py-1.5 rounded-lg hover:bg-accent/10 transition-colors no-underline flex-shrink-0">
          Owner →
        </Link>
      </nav>

      <div>
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0a1f12] to-[#061510] px-4 py-10 md:py-14 text-center">
          <div className="absolute w-72 h-72 rounded-full bg-[#00e5a0] blur-[90px] opacity-[0.06] -top-24 left-1/2 -translate-x-1/2 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl mx-auto mb-4">
              {DEMO_SHOP.avatar}
            </div>
            <h1 className="font-display font-black text-xl md:text-2xl text-accent mb-1 leading-tight">{DEMO_SHOP.name}</h1>
            <p className="text-accent/50 text-xs md:text-sm">{DEMO_SHOP.address}</p>
            <div className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent px-3 py-1.5 rounded-full text-xs font-bold mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Open Now · {DEMO_SHOP.hours}
            </div>
            <p className="text-accent/40 text-xs mt-3 max-w-xs mx-auto leading-relaxed">{DEMO_SHOP.description}</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-accent/10 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-3.5 py-2 rounded-full border text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer font-sans',
              activeCategory === 'all' ? 'bg-accent/15 border-accent text-accent' : 'border-accent/20 text-accent/50 hover:bg-accent/5 bg-transparent'
            )}
          >
            🍽️ All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3.5 py-2 rounded-full border text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer font-sans',
                activeCategory === cat ? 'bg-accent/15 border-accent text-accent' : 'border-accent/20 text-accent/50 hover:bg-accent/5 bg-transparent'
              )}
            >
              {CAT_ICONS[cat] ?? '📦'} {cat}
            </button>
          ))}
        </div>

        {/* Item count */}
        <div className="max-w-xl mx-auto px-4 pt-3 pb-1">
          <p className="text-accent/30 text-xs">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Menu Items */}
        <div className="max-w-xl mx-auto px-4 py-3 space-y-3 pb-12">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 md:gap-4 bg-white/[0.03] border border-accent/10 rounded-2xl p-3.5 md:p-4 hover:border-accent/25 hover:bg-accent/[0.04] transition-all"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 bg-accent/8 rounded-xl flex items-center justify-center text-2xl md:text-3xl flex-shrink-0 border border-accent/10">
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#f0f0f5] text-sm md:text-base leading-snug">{item.name}</h3>
                <p className="text-white/35 text-xs mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>
                <p className="text-accent/40 text-[10px] mt-1">{item.category}</p>
              </div>
              <div className="font-display font-black text-accent text-lg md:text-xl flex-shrink-0">₹{item.price}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center py-8 px-4 border-t border-accent/10">
          <p className="text-accent/25 text-xs mb-3">
            Powered by <Link href="/" className="text-accent font-bold hover:underline">QR-Menu</Link>
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-accent text-[#0a0f0a] text-xs font-black px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity no-underline"
          >
            🚀 Create your free menu like this →
          </Link>
        </div>
      </div>
    </div>
  );
}
