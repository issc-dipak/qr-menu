'use client';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store';
import toast from 'react-hot-toast';

export function CartDrawer({
  ownerPhone,
  ownerId,
  themeColor = '#00e5a0',
  razorpayLinkedAccountId,
  platformCommissionPct,
  onClose,
}: {
  ownerPhone: string;
  ownerId: string;
  themeColor?: string;
  razorpayLinkedAccountId?: string | null;
  platformCommissionPct?: number | null;
  onClose: () => void;
}) {
  const { items, tableNumber, setTableNumber, updateQuantity, clearCart, getTotal } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0); // flat or percent reduction
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi'>('en');
  const [instructions, setInstructions] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);

  const t = {
    en: {
      cart: 'Your Cart',
      table: 'Table Number',
      coupon: 'Coupon Code',
      apply: 'Apply',
      total: 'Total Amount',
      checkout: 'Order via WhatsApp 💬',
      empty: 'Your cart is empty',
      tablePlaceholder: 'E.g., Table 4',
      successCoupon: 'Coupon applied successfully! 🎉',
      invalidCoupon: 'Invalid or expired coupon code.',
    },
    hi: {
      cart: 'आपका कार्ट',
      table: 'टेबल नंबर',
      coupon: 'कूपन कोड',
      apply: 'लागू करें',
      total: 'कुल राशि',
      checkout: 'व्हाट्सएप पर आर्डर भेजें 💬',
      empty: 'आपका कार्ट खाली है',
      tablePlaceholder: 'जैसे: टेबल 4',
      successCoupon: 'कूपन सफलतापूर्वक लागू हुआ! 🎉',
      invalidCoupon: 'गलत या अमान्य कूपन कोड।',
    }
  };

  const handleApplyCoupon = () => {
    // Basic mock local coupon logic (e.g. SAVE10 -> 10%, WELCOME50 -> Flat ₹50)
    const upper = couponCode.toUpperCase().trim();
    if (upper === 'SAVE10') {
      const reduction = Math.round(getTotal() * 0.1);
      setDiscount(reduction);
      toast.success(t[selectedLang].successCoupon);
    } else if (upper === 'WELCOME50' && getTotal() >= 150) {
      setDiscount(50);
      toast.success(t[selectedLang].successCoupon);
    } else {
      toast.error(t[selectedLang].invalidCoupon);
      setDiscount(0);
    }
  };

  const finalTotal = Math.max(0, getTotal() - discount);

  const handleCashOrder = async () => {
    if (items.length === 0) return;
    if (!tableNumber.trim()) {
      toast.error(selectedLang === 'en' ? 'Please enter a Table Number.' : 'कृपया टेबल नंबर दर्ज करें।');
      return;
    }

    const toastId = toast.loading(selectedLang === 'en' ? 'Placing cash order...' : 'नकद आर्डर भेजा जा रहा है...');

    try {
      const order = await useCartStore.getState().createOrder({
        table: `Table ${tableNumber.trim()}`,
        items: items.map(i => `${i.quantity}x ${i.name}`).join(', '),
        total: finalTotal,
        paymentMethod: 'cash',
        instructions: instructions.trim() || null,
      });

      if (order) {
        toast.success(
          selectedLang === 'en' 
            ? 'Order placed! Please pay cash at the counter. 🎉' 
            : 'आर्डर दर्ज हो गया! कृपया काउंटर पर नकद भुगतान करें। 🎉', 
          { id: toastId }
        );
        onClose();
      } else {
        toast.dismiss(toastId);
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error('Failed to place cash order:', error);
    }
  };


  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-surface border-l border-border h-full flex flex-col z-10 animate-fade-up">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h2 className="font-display font-black text-lg">{t[selectedLang].cart}</h2>
            <span className="bg-accent/15 text-accent text-xs font-bold px-2 py-0.5 rounded-full">{items.length}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Lang switch */}
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value as 'en' | 'hi')}
              className="bg-surface-2 border border-border rounded-lg text-xs py-1 px-2 text-[#f0f0f5] outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
            <button onClick={onClose} className="text-muted hover:text-white transition-colors text-sm font-bold border-none bg-transparent cursor-pointer">✕</button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-20 text-muted">
              <span className="text-4xl block mb-2">🍽️</span>
              <p className="text-sm">{t[selectedLang].empty}</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-surface-2 border border-border p-3 rounded-xl">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{item.name}</p>
                  <p className="text-[10px] text-accent font-semibold mt-0.5">₹{item.price}</p>
                </div>
                {/* Quantity buttons */}
                <div className="flex items-center gap-2 border border-border bg-bg rounded-lg p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-5 h-5 flex items-center justify-center text-xs hover:bg-surface-2 rounded border-none bg-transparent text-[#f0f0f5] cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-5 h-5 flex items-center justify-center text-xs hover:bg-surface-2 rounded border-none bg-transparent text-[#f0f0f5] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout inputs */}
        {items.length > 0 && (
          <div className="p-4 border-t border-border bg-surface-2/40 space-y-4">
            {/* Table Number */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">{t[selectedLang].table}</label>
              <input
                type="text"
                required
                className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 text-xs text-[#f0f0f5] placeholder:text-muted outline-none focus:border-accent transition-all"
                placeholder={t[selectedLang].tablePlaceholder}
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </div>

            {/* Coupons */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">{t[selectedLang].coupon} (Try: SAVE10)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 text-xs text-[#f0f0f5] placeholder:text-muted outline-none focus:border-accent transition-all uppercase"
                  placeholder="WELCOME50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-bg hover:bg-surface border border-border text-[#f0f0f5] font-semibold text-xs px-4 rounded-xl cursor-pointer"
                >
                  {t[selectedLang].apply}
                </button>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">
                {selectedLang === 'en' ? 'Special Instructions 📝' : 'विशेष निर्देश 📝'}
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={selectedLang === 'en' ? 'E.g., Make it extra spicy, no onions, etc.' : 'जैसे: ज़्यादा तीखा करें, प्याज न डालें, आदि।'}
                className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-2 text-xs text-[#f0f0f5] placeholder:text-muted outline-none focus:border-accent transition-all resize-none h-16"
              />
            </div>

            {/* Split Bill Calculator */}
            <div className="bg-white/[0.02] border border-border/60 p-3 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                    {selectedLang === 'en' ? 'Split Bill 👥' : 'बिल बांटें 👥'}
                  </label>
                  <span className="text-[10px] text-muted">
                    {selectedLang === 'en' ? 'Calculate share per person' : 'प्रति व्यक्ति हिस्सा जोड़ें'}
                  </span>
                </div>
                <div className="flex items-center gap-2 border border-border bg-bg rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setPeopleCount(prev => Math.max(1, prev - 1))}
                    className="w-5 h-5 flex items-center justify-center text-xs hover:bg-surface-2 rounded border-none bg-transparent text-[#f0f0f5] cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{peopleCount}</span>
                  <button
                    type="button"
                    onClick={() => setPeopleCount(prev => prev + 1)}
                    className="w-5 h-5 flex items-center justify-center text-xs hover:bg-surface-2 rounded border-none bg-transparent text-[#f0f0f5] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
              {peopleCount > 1 && (
                <div className="flex justify-between items-center text-xs font-semibold text-accent pt-1.5 border-t border-border/30">
                  <span>{selectedLang === 'en' ? 'Per Person Share:' : 'प्रति व्यक्ति हिस्सा:'}</span>
                  <span>₹{Math.round(finalTotal / peopleCount)}</span>
                </div>
              )}
            </div>

            {/* Price list */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal:</span>
                <span>₹{getTotal()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-danger">
                  <span>Discount:</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-[#f0f0f5] pt-1.5 border-t border-border/50">
                <span>{t[selectedLang].total}:</span>
                <span className="text-accent">₹{finalTotal}</span>
              </div>
            </div>

            {/* Checkout CTAs */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleCashOrder}
                className="w-full bg-[#18181f] border border-border hover:border-accent text-[#f0f0f5] font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {selectedLang === 'en' ? '💵 Pay with Cash / Order at Counter' : '💵 नकद भुगतान / काउंटर पर आर्डर दें'}
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (!tableNumber.trim()) {
                    toast.error(selectedLang === 'en' ? 'Please enter a Table Number.' : 'कृपया टेबल नंबर दर्ज करें।');
                    return;
                  }

                  const loadToast = toast.loading(selectedLang === 'en' ? 'Initializing payment gateway...' : 'भुगतान गेटवे शुरू किया जा रहा है...');
                  
                  try {
                    // 1. Create order with split transfers via server API
                    const orderRes = await fetch('/api/checkout', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        amount: finalTotal,
                        currency: 'INR',
                        linkedAccountId: razorpayLinkedAccountId,
                        commissionPct: platformCommissionPct,
                      }),
                    });

                    const orderData = await orderRes.json();
                    
                    if (!orderRes.ok) {
                      toast.dismiss(loadToast);
                      toast.error(orderData.error || 'Failed to initialize payment split');
                      return;
                    }

                    // 2. Load Razorpay script dynamically
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.async = true;
                    script.onload = () => {
                      toast.dismiss(loadToast);
                      const options = {
                        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SrDXSG4NHA1pdu',
                        amount: orderData.amount,
                        currency: orderData.currency,
                        name: 'QR-Menu Checkout',
                        description: `Order Payment for Table ${tableNumber || 'N/A'}`,
                        order_id: orderData.id,
                        handler: async function (response: any) {
                          toast.success(`Payment Successful! ID: ${response.razorpay_payment_id} 🎉`);
                          
                          try {
                             await useCartStore.getState().createOrder({
                               table: `Table ${tableNumber.trim()}`,
                               items: items.map(i => `${i.quantity}x ${i.name}`).join(', '),
                               total: finalTotal,
                               paymentId: response.razorpay_payment_id,
                               paymentMethod: 'online',
                               instructions: instructions.trim() || null,
                             });
                             onClose();
                           } catch (err) {
                             console.error('Failed to create online order:', err);
                           }
                        },
                        prefill: {
                          name: 'Guest Customer',
                          email: 'guest@qr-menu.com'
                        },
                        theme: {
                          color: themeColor
                        }
                      };
                      const rzp = new (window as any).Razorpay(options);
                      rzp.open();
                    };
                    
                    script.onerror = () => {
                      toast.dismiss(loadToast);
                      toast.error('Failed to load Razorpay SDK');
                    };

                    document.body.appendChild(script);
                  } catch (err: any) {
                    toast.dismiss(loadToast);
                    toast.error(err.message || 'Payment setup failed');
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 border-none transition-colors cursor-pointer"
              >
                💳 Pay Now Online (Razorpay)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
