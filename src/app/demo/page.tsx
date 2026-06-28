'use client';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/utils';
import toast from 'react-hot-toast';

const CAT_ICONS: Record<string, string> = {
  'Hot Drinks': '☕',
  'Cold Drinks': '🧋',
  'Snacks': '🥐',
  'Desserts': '🍰',
};

const DEMO_SHOP = {
  name: 'DIPAK CREATION',
  avatar: '🏪',
  address: 'Sector 21, Gandhinagar',
  hours: '9AM - 9PM',
  description: 'Premium items & accessories. Quality guaranteed.',
};

const DEMO_ITEMS = [
  { id: '1', emoji: '🥐', name: 'dfsdf', description: 'sdfsdf', price: 21, category: 'Hot Drinks', is_veg: true },
  { id: '2', emoji: '✂️', name: 'qwc', description: 'sdsd', price: 23, category: 'Hot Drinks', is_veg: true },
  { id: '3', emoji: '🍵', name: 'Masala Chai', description: 'Fresh ginger, cardamom & tulsi', price: 20, category: 'Hot Drinks', is_veg: true },
  { id: '4', emoji: '☕', name: 'Filter Coffee', description: 'South Indian style decoction', price: 30, category: 'Hot Drinks', is_veg: true },
  { id: '5', emoji: '🧋', name: 'Cold Coffee', description: 'Chilled & creamy with ice cream', price: 60, category: 'Cold Drinks', is_veg: true },
  { id: '6', emoji: '🥪', name: 'Veg Sandwich', description: 'Veggies, chutney & cheese', price: 50, category: 'Snacks', is_veg: true },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

export default function DemoPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  
  // Interactive States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [waiterModalOpen, setWaiterModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [ordersHistoryOpen, setOrdersHistoryOpen] = useState(false);
  const [placedOrders, setPlacedOrders] = useState<any[]>([]);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const categories = Array.from(new Set(DEMO_ITEMS.map((i) => i.category)));
  const primaryColor = '#00e5a0';
  const customFont = 'Plus Jakarta Sans';
  
  const filteredItems = DEMO_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiet = dietFilter === 'all' || (dietFilter === 'veg' && item.is_veg) || (dietFilter === 'non-veg' && !item.is_veg);
    return matchesCategory && matchesSearch && matchesDiet;
  });

  // Cart operations
  const addToCart = (item: typeof DEMO_ITEMS[0]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, emoji: item.emoji }];
    });
    toast.success(`${item.name} added! 🛒`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      return prev.map((i) => {
        if (i.id === id) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleCallWaiter = () => {
    if (!tableNumber.trim()) {
      toast.error('Please enter your table number!');
      return;
    }
    toast.success(`Waiter called to Table ${tableNumber}! 🛎️`);
    setWaiterModalOpen(false);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) {
      toast.error('Please enter table number to place order!');
      return;
    }

    const newOrder = {
      id: `DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
      items: cart.map(i => `${i.quantity}x ${i.name}`).join(', '),
      total: cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
      table: `Table ${tableNumber}`,
      status: 'pending',
      date: 'Just now',
    };

    setPlacedOrders([newOrder, ...placedOrders]);
    setCart([]);
    setCartOpen(false);
    setCheckoutModalOpen(false);
    setOrdersHistoryOpen(true);
    toast.success('Demo Order Placed Successfully! 🍽️');
  };

  return (
    <div className="min-h-screen bg-bg text-[#f0f0f5] pb-24 relative overflow-hidden" style={{ fontFamily: customFont }}>
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: `${primaryColor}08` }} />

      {/* Demo Banner */}
      <div className="bg-accent/10 border-b border-accent/25 text-center py-2 px-4 relative z-50">
        <p className="text-accent text-xs font-bold tracking-wider">
          👀 Live Interactive Demo — <Link href="/auth/signup" className="underline text-accent hover:text-accent/80 font-black">Create your own menu →</Link>
        </p>
      </div>

      {/* Sticky Customer Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-2.5 py-2 sm:px-4 sm:py-3 bg-bg/80 backdrop-blur-md border-b border-border/40">
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-white text-xs sm:text-sm leading-tight flex items-center gap-1.5">
            <span className="text-sm">{DEMO_SHOP.avatar}</span>
            <span className="truncate max-w-[100px] sm:max-w-none">{DEMO_SHOP.name}</span>
          </p>
          <p className="text-[9px] sm:text-[10px] text-muted truncate mt-0.5">📍 {DEMO_SHOP.address}</p>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setWaiterModalOpen(true)}
            className="text-[9px] sm:text-[11px] font-semibold bg-gold/5 border border-gold/25 text-gold px-1.5 py-0.5 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg hover:bg-gold/10 active:scale-95 transition-all cursor-pointer flex items-center gap-1 font-sans"
          >
            🛎️ <span className="hidden xs:inline">Call Waiter</span>
          </button>
          
          <button
            onClick={() => setOrdersHistoryOpen(true)}
            className="text-[9px] sm:text-[11px] font-semibold bg-white/5 border border-border text-white px-1.5 py-0.5 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg hover:border-white/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1 font-sans"
            style={{ borderColor: `${primaryColor}20`, color: primaryColor }}
          >
            📋 <span className="hidden xs:inline">My Orders ({placedOrders.length})</span>
          </button>

          <Link
            href="/"
            className="text-[9px] sm:text-[11px] border border-border text-muted hover:text-white hover:border-white/20 px-1.5 py-0.5 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg transition-all no-underline flex-shrink-0"
          >
            Leave Demo
          </Link>
        </div>
      </nav>

      {/* Main content area */}
      <div className="pt-[56px]">
        
        {/* Shop Hero Card */}
        <div className="relative overflow-hidden border-b border-border/20 bg-surface/30 px-4 py-6 md:py-12 text-center">
          <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(180deg, ${primaryColor}05 0%, transparent 100%)` }} />
          <div className="relative z-10 max-w-xl mx-auto">
            {/* Avatar container */}
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-surface-2 border border-border rounded-xl sm:rounded-2xl flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-3 shadow-card overflow-hidden">
               <span>{DEMO_SHOP.avatar}</span>
            </div>
            <h1 className="font-display font-bold text-lg sm:text-2xl text-white mb-0.5 tracking-tight">{DEMO_SHOP.name}</h1>
            {DEMO_SHOP.address && (
              <p className="text-muted text-[10px] sm:text-xs flex items-center justify-center gap-1 mt-0.5">
                <span>📍</span> {DEMO_SHOP.address}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <div className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold" style={{ color: primaryColor, borderColor: `${primaryColor}20`, backgroundColor: `${primaryColor}10` }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                Open now · {DEMO_SHOP.hours}
              </div>
              <button 
                onClick={() => toast.success('Demo Review page loading...')}
                className="inline-flex items-center gap-1 bg-gold/10 border border-gold/25 text-gold px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold no-underline hover:bg-gold/15 active:scale-95 transition-all cursor-pointer"
                style={{ color: '#eab308', borderColor: '#eab30825', backgroundColor: '#eab30808' }}
              >
                ⭐ Review
              </button>
            </div>
            {DEMO_SHOP.description && <p className="text-muted text-[10px] sm:text-xs mt-2.5 max-w-xs mx-auto leading-relaxed">{DEMO_SHOP.description}</p>}
          </div>
        </div>

        {/* Search Box & Diet Filter */}
        <div className="max-w-xl mx-auto px-4 pt-4 pb-2 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search dishes (e.g., Chai, Coffee)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border focus:border-accent rounded-xl pl-9 pr-9 py-2 text-xs text-[#f0f0f5] placeholder:text-muted/50 outline-none transition-all focus:shadow-glow"
              style={{ caretColor: primaryColor }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-white text-xs bg-transparent border-none cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Diet Segmented Control */}
          <div className="flex bg-surface border border-border/80 rounded-xl p-1 gap-1">
            {[
              { id: 'all', label: 'All Dishes' },
              { id: 'veg', label: 'Veg Only' },
              { id: 'non-veg', label: 'Non-Veg Only' }
            ].map((diet) => {
              const isActive = dietFilter === diet.id;
              let style = {};
              if (isActive) {
                if (diet.id === 'veg') {
                  style = { backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}30` };
                } else if (diet.id === 'non-veg') {
                  style = { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.25)' };
                } else {
                  style = { backgroundColor: 'rgba(255,255,255,0.06)', color: '#ffffff' };
                }
              }
              return (
                <button
                  key={diet.id}
                  onClick={() => setDietFilter(diet.id as any)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer font-sans border flex items-center justify-center gap-1.5",
                    isActive
                      ? "shadow-sm border-white/10"
                      : "bg-transparent border-transparent text-[#8e8ea8] hover:text-white"
                  )}
                  style={style}
                >
                  {diet.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories horizontal scroll */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none max-w-xl mx-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                'px-4 py-2 rounded-full border text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 cursor-pointer font-sans',
                activeCategory === 'all'
                  ? 'border-accent'
                  : 'border-border/60 text-[#8e8ea8] hover:text-white hover:bg-white/5 bg-transparent'
              )}
              style={activeCategory === 'all' ? { backgroundColor: `${primaryColor}15`, borderColor: primaryColor, color: primaryColor } : {}}
            >
              🍽️ All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-full border text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 cursor-pointer font-sans',
                  activeCategory === cat
                    ? 'border-accent'
                    : 'border-border/60 text-[#8e8ea8] hover:text-white hover:bg-white/5 bg-transparent'
                )}
                style={activeCategory === cat ? { backgroundColor: `${primaryColor}15`, borderColor: primaryColor, color: primaryColor } : {}}
              >
                {CAT_ICONS[cat] ?? '📦'} {cat}
              </button>
            ))}
          </div>
        )}

        {/* Item count info */}
        <div className="max-w-xl mx-auto px-4 pt-4 pb-1">
          <p className="text-muted text-xs">{filteredItems.length} items</p>
        </div>

        {/* Menu Items List */}
        <div className="max-w-xl mx-auto px-4 py-3 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 text-muted/40">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="text-sm">No items found</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isVeg = item.is_veg;
              const dotColor = isVeg ? '#22c55e' : '#ef4444';
              const label = isVeg ? 'Veg' : 'Non-Veg';

              return (
                <div key={item.id} className="flex items-center gap-2.5 sm:gap-4 bg-surface/40 border border-border/60 rounded-xl p-2.5 sm:p-4 hover:border-border hover:bg-surface transition-all duration-300">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-surface-2 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 border border-border/50">
                    {item.emoji}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="w-3 h-3 border flex items-center justify-center flex-shrink-0 rounded-[3px]"
                        style={{
                          borderColor: dotColor,
                          opacity: 0.8,
                          padding: '2px',
                        }}
                        title={label}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: dotColor
                          }}
                        />
                      </span>
                      <h3 className="font-bold text-[#f0f0f5] text-xs sm:text-sm leading-snug truncate">{item.name}</h3>
                    </div>
                    {item.description && <p className="text-muted text-[10px] sm:text-xs mt-0.5 line-clamp-1 sm:line-clamp-2 leading-relaxed">{item.description}</p>}
                    <p className="text-muted/50 text-[9px] sm:text-[10px] mt-0.5">{item.category}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 sm:gap-2.5 flex-shrink-0">
                    <div className="font-display font-semibold text-[#f0f0f5] text-xs sm:text-sm flex-shrink-0" style={{ color: primaryColor }}>₹{item.price}</div>
                    <button
                      onClick={() => addToCart(item)}
                      className="btn-primary py-1 px-2 sm:py-1.5 sm:px-3 rounded-lg text-[10px] sm:text-xs font-semibold select-none flex items-center justify-center active:scale-[0.96] transition-all cursor-pointer min-w-[50px] text-center"
                      style={{ backgroundColor: primaryColor, color: '#09090b' }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating launcher */}
      {cart.length > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 hover:scale-105 active:scale-95 font-bold px-6 py-3.5 rounded-full shadow-glow flex items-center gap-3 transition-all cursor-pointer border-none z-50 text-sm"
          style={{ backgroundColor: primaryColor, color: '#09090b' }}
        >
          <span>🛒 View Cart</span>
          <span className="bg-[#09090b] text-accent text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center" style={{ color: primaryColor }}>
            {cart.reduce((acc, i) => acc + i.quantity, 0)}
          </span>
        </button>
      )}

      {/* Slide-in Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          
          <div className="relative w-full max-w-md bg-surface border-l border-border h-full flex flex-col z-10 animate-fade-in">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛒</span>
                <h2 className="font-display font-bold text-lg text-white">Your Demo Cart</h2>
              </div>
              <button onClick={() => setCartOpen(false)} className="text-muted hover:text-white transition-colors text-sm font-bold border-none bg-transparent cursor-pointer">✕</button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-surface-2 border border-border p-3 rounded-xl">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <p className="text-[10px] text-accent mt-0.5" style={{ color: primaryColor }}>₹{item.price}</p>
                  </div>
                  {/* Quantity Actions */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-md bg-white/5 text-white/80 hover:bg-white/10 flex items-center justify-center text-xs cursor-pointer border-none">-</button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-md bg-white/5 text-white/80 hover:bg-white/10 flex items-center justify-center text-xs cursor-pointer border-none">+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-border bg-surface-2 space-y-4 font-sans">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Total amount:</span>
                <span className="font-display font-black text-accent text-lg" style={{ color: primaryColor }}>
                  ₹{cart.reduce((sum, i) => sum + i.price * i.quantity, 0)}
                </span>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(true)}
                className="w-full hover:opacity-95 text-[#060c08] font-black py-3.5 rounded-xl text-xs tracking-wider uppercase transition-all cursor-pointer border-none"
                style={{ backgroundColor: primaryColor }}
              >
                Proceed to Demo Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout / Table number prompt */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setCheckoutModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-surface border border-border rounded-2xl p-6 z-10 text-center">
            <h3 className="font-display font-bold text-white text-lg mb-2">Almost There!</h3>
            <p className="text-muted text-xs mb-4">Please input your table number to complete the demo order setup.</p>
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <input
                type="text"
                placeholder="Table / Spot Number (e.g. 5)"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full bg-surface-2 border border-border focus:border-accent rounded-xl px-4 py-3 text-center font-bold text-sm text-[#f0f0f5] placeholder:text-muted/20 outline-none transition-all"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="flex-1 bg-transparent hover:bg-white/5 border border-border text-muted hover:text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 text-[#060c08] font-bold py-2.5 rounded-xl text-xs cursor-pointer border-none"
                  style={{ backgroundColor: primaryColor }}
                >
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Call Waiter Modal */}
      {waiterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setWaiterModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-surface border border-border rounded-2xl p-6 z-10 text-center">
            <span className="text-4xl block mb-2 animate-bounce">🛎️</span>
            <h3 className="font-display font-bold text-white text-lg mb-1">Call a Waiter</h3>
            <p className="text-muted text-xs mb-4">Enter your table number and our staff will assist you shortly.</p>
            <input
              type="text"
              placeholder="Table Number (e.g. 4)"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full bg-surface-2 border border-border focus:border-accent rounded-xl px-4 py-3 text-center font-bold text-sm text-[#f0f0f5] placeholder:text-muted/20 outline-none transition-all mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setWaiterModalOpen(false)}
                className="flex-1 bg-transparent hover:bg-white/5 border border-border text-muted hover:text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCallWaiter}
                className="flex-1 text-[#060c08] font-bold py-2.5 rounded-xl text-xs cursor-pointer border-none"
                style={{ backgroundColor: primaryColor }}
              >
                Call Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Orders / Drawer */}
      {ordersHistoryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOrdersHistoryOpen(false)} />
          
          <div className="relative w-full max-w-md bg-surface border-l border-border h-full flex flex-col z-10 animate-fade-in">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-white">📋 Placed Orders (Demo)</h2>
              <button onClick={() => setOrdersHistoryOpen(false)} className="text-muted hover:text-white transition-colors text-sm font-bold border-none bg-transparent cursor-pointer">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {placedOrders.length === 0 ? (
                <div className="text-center py-20 text-muted/30">
                  <span className="text-4xl block mb-2">🍽️</span>
                  <p className="text-sm font-bold">No orders placed yet</p>
                  <p className="text-xs text-muted/50 mt-1">Place a demo order from the cart to see it here!</p>
                </div>
              ) : (
                placedOrders.map((order) => (
                  <div key={order.id} className="bg-surface-2 border border-border p-4 rounded-xl space-y-3 font-sans">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-xs text-accent" style={{ color: primaryColor }}>{order.id}</span>
                      <span className="bg-white/5 border border-white/10 text-[10px] font-bold px-2 py-0.5 rounded-full text-white">{order.table}</span>
                    </div>
                    <div className="text-xs text-[#f0f0f5] font-semibold leading-relaxed">
                      {order.items}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-border text-xs">
                      <div>
                        <div className="text-muted/50 text-[9px]">{order.date}</div>
                        <div className="font-bold text-[#f0f0f5] text-sm mt-0.5">₹{order.total}</div>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold border bg-accent/10 text-accent border-accent/20" style={{ color: primaryColor, borderColor: `${primaryColor}20`, backgroundColor: `${primaryColor}10` }}>
                          Paid (Demo)
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold border bg-gold/10 text-gold border-gold/20">
                          Preparing
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
    </div>
  );
}
