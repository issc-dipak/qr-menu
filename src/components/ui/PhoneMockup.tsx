'use client';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  description: string;
  category: string;
  isVeg: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Masala Chai', price: 20, emoji: '🍵', description: 'Fresh ginger, cardamom & tulsi', category: 'Hot Drinks', isVeg: true },
  { id: '2', name: 'Filter Coffee', price: 30, emoji: '☕', description: 'South Indian style decoction', category: 'Hot Drinks', isVeg: true },
  { id: '3', name: 'Cold Coffee', price: 60, emoji: '🧋', description: 'Chilled & creamy with ice cream', category: 'Cold Drinks', isVeg: true },
  { id: '4', name: 'Butter Toast', price: 25, emoji: '🥐', description: 'Toasted with jam & butter', category: 'Snacks', isVeg: true },
  { id: '5', name: 'Veg Sandwich', price: 50, emoji: '🥪', description: 'Veggies, chutney & cheese', category: 'Snacks', isVeg: true },
  { id: '6', name: 'Samosa (2 pcs)', price: 20, emoji: '🥟', description: 'Crispy with tamarind chutney', category: 'Snacks', isVeg: true },
  { id: '7', name: 'Gulab Jamun', price: 30, emoji: '🍩', description: 'Soft, syrupy & warm', category: 'Desserts', isVeg: true },
  { id: '8', name: 'Mango Lassi', price: 45, emoji: '🥭', description: 'Thick, sweet & fresh mango pulp', category: 'Cold Drinks', isVeg: true },
];

interface PhoneMockupProps {
  shopName?: string;
  themeColor?: string;
}

export function PhoneMockup({ shopName = 'Dipak Chai Corner', themeColor = '#00e5a0' }: PhoneMockupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [addedItems, setAddedItems] = useState<Record<string, number>>({});
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-rotate items every 2.8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MENU_ITEMS.length);
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  // Simulate adding active item to cart on highlight
  useEffect(() => {
    const currentItem = MENU_ITEMS[currentIndex];
    
    const addTimer = setTimeout(() => {
      setAddedItems((prev) => {
        const currentQty = prev[currentItem.id] || 0;
        const newQty = currentQty + 1;
        
        if (newQty > 3) {
          // Reset cart occasionally to keep it fresh
          setCartCount(1);
          setCartTotal(currentItem.price);
          return { [currentItem.id]: 1 };
        }

        setCartCount((c) => c + 1);
        setCartTotal((t) => t + currentItem.price);
        return {
          ...prev,
          [currentItem.id]: newQty,
        };
      });
    }, 900);

    return () => clearTimeout(addTimer);
  }, [currentIndex]);

  // Smooth scroll active item into view (locally inside container only, preventing browser page jump)
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[currentIndex] as HTMLElement;
      if (activeEl) {
        const container = listRef.current;
        // Calculate scroll top position relative to container
        const targetScrollTop = activeEl.offsetTop - (container.clientHeight - activeEl.clientHeight) / 2;
        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex]);

  return (
    <div 
      className="w-[230px] sm:w-[270px] h-[430px] sm:h-[500px] bg-surface rounded-[30px] sm:rounded-[36px] border-[3px] shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden mx-auto flex flex-col relative transition-all duration-300"
      style={{ borderColor: `${themeColor}40` }}
    >
      {/* Speaker/Camera Notch */}
      <div className="absolute top-0 inset-x-0 z-30 pointer-events-none">
        <div className="h-5 bg-bg rounded-b-[18px] w-[90px] mx-auto flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-surface-2/45 ml-4" />
          <div className="w-8 h-1 rounded-full bg-surface-2/45 ml-2" />
        </div>
      </div>

      {/* Screen Layout */}
      <div className="flex-1 flex flex-col pt-7 bg-[#0d1a12] text-white overflow-hidden relative text-left">
        
        {/* App Navbar */}
        <div 
          className="px-3 py-2 bg-[rgba(13,26,18,0.96)] border-b flex items-center justify-between"
          style={{ borderColor: `${themeColor}25` }}
        >
          <div className="min-w-0 flex-1">
            <h4 
              className="font-display font-black text-[11px] md:text-xs truncate transition-colors duration-300"
              style={{ color: themeColor }}
            >
              🏪 {shopName}
            </h4>
            <p className="text-[8px] text-white/50 truncate">Sector 21, Gandhinagar · Open</p>
          </div>
          <span 
            className="text-[8px] px-1.5 py-0.5 rounded font-bold font-sans transition-all"
            style={{ color: themeColor, backgroundColor: `${themeColor}15` }}
          >
            Table 04
          </span>
        </div>

        {/* Scrollable Items List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto px-3 py-2 pb-16 divide-y divide-white/10 scrollbar-none"
        >
          {MENU_ITEMS.map((item, idx) => {
            const isActive = idx === currentIndex;
            const quantity = addedItems[item.id] || 0;

            return (
              <div
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "flex items-start justify-between gap-3 py-3 transition-all duration-300 cursor-pointer relative -mx-1 px-1 rounded-lg",
                  isActive && "bg-white/[0.04] scale-[1.01]"
                )}
                style={isActive ? { boxShadow: `inset 0 0 0 1px ${themeColor}15` } : {}}
              >
                {/* Glow bar for active item */}
                {isActive && (
                  <div 
                    className="absolute left-0 top-1 bottom-1 w-[2.5px] rounded-r animate-pulse" 
                    style={{ backgroundColor: themeColor }}
                  />
                )}

                {/* Left side: Info */}
                <div className="flex-1 min-w-0 pr-1.5 text-left">
                  <div className="flex items-center gap-1 mb-0.5">
                    {item.isVeg && (
                      <span className="w-2.5 h-2.5 border border-emerald-500 flex items-center justify-center p-[1.5px] flex-shrink-0 rounded-[2px]">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      </span>
                    )}
                    <p 
                      className="text-[10px] md:text-xs font-bold truncate transition-colors duration-300"
                      style={isActive ? { color: themeColor } : { color: 'rgba(255,255,255,0.9)' }}
                    >
                      {item.name}
                    </p>
                  </div>
                  <p className="text-white/40 text-[8px] md:text-[9px] mt-0.5 leading-normal line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="font-semibold text-white text-[9px] md:text-[10px]">
                      ₹{item.price}
                    </span>
                    <span className="text-white/20 text-[8px]">·</span>
                    <span className="text-white/40 text-[8px] font-medium">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Right side: Image & Floating Add Button */}
                <div className="relative flex-shrink-0 flex flex-col items-center">
                  <div 
                    className="w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center text-xl md:text-2xl flex-shrink-0 transition-all duration-300 border"
                    style={isActive 
                      ? { backgroundColor: `${themeColor}12`, borderColor: `${themeColor}30` } 
                      : { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }
                    }
                  >
                    {item.emoji}
                  </div>

                  {/* Simulated Floating Add Button */}
                  <div className="absolute -bottom-1.5 flex items-center justify-center">
                    {quantity > 0 ? (
                      <div 
                        className="flex items-center gap-1 text-black rounded px-1.5 py-0.5 text-[8px] font-black animate-fade-in shadow-sm border border-black/10 select-none"
                        style={{ backgroundColor: themeColor }}
                      >
                        <span>-</span>
                        <span className="text-[9px]">{quantity}</span>
                        <span className={cn(isActive && "scale-110 transition-transform duration-200")}>+</span>
                      </div>
                    ) : (
                      <button 
                        className="text-[8px] font-bold px-2 py-0.5 rounded shadow-sm border transition-all duration-300 select-none"
                        style={isActive 
                          ? { backgroundColor: themeColor, borderColor: themeColor, color: '#000000', fontWeight: '900', transform: 'scale(1.03)' } 
                          : { borderColor: `${themeColor}30`, color: themeColor, backgroundColor: `${themeColor}05` }
                        }
                      >
                        + ADD
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Cart Bar Simulation */}
        <div 
          className={cn(
            "absolute bottom-2 inset-x-3 text-black px-3 py-2 rounded-xl flex items-center justify-between shadow-lg transition-all duration-500 z-20 transform",
            cartCount > 0 ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
          )}
          style={{ backgroundColor: themeColor }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs">🛒</span>
            <div className="leading-none text-left">
              <p className="text-[10px] font-black">{cartCount} Item{cartCount > 1 ? 's' : ''}</p>
              <p className="text-[8px] opacity-75">Added to order</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-display font-black text-xs">₹{cartTotal}</span>
            <span className="text-[9px] bg-black/10 px-1.5 py-0.5 rounded font-bold">View Cart</span>
          </div>
        </div>

      </div>
    </div>
  );
}
