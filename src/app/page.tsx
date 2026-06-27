'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { PLANS } from '@/constants';
import { formatCurrency, cn } from '@/utils';
import { PhoneMockup } from '@/components/ui/PhoneMockup';

export default function HomePage() {
  const [shopName, setShopName] = useState('Dipak Chai Corner');
  const [themeColor, setThemeColor] = useState('#00e5a0');
  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 md:pt-32 pb-16 relative overflow-hidden">
        <div className="absolute w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full bg-accent blur-[100px] opacity-[0.08] -top-48 -left-36 pointer-events-none" />
        <div className="absolute w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-accent-2 blur-[90px] opacity-[0.07] -bottom-36 -right-24 pointer-events-none" />

        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/25 text-accent px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 md:mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse flex-shrink-0" />
          Now Live — 5 Shops Using QR-Menu
        </div>

        <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.04] tracking-tight max-w-4xl animate-fade-up">
          Your Shop&apos;s Digital Menu,{' '}
          <span className="gradient-text">Ready in 5 Minutes</span>
        </h1>

        <p className="text-muted text-base md:text-lg max-w-sm md:max-w-lg mx-auto mt-5 mb-8 font-light leading-relaxed animate-fade-up" style={{ animationDelay: '150ms' }}>
          No printing. No hassle. Create a beautiful QR menu — customers scan and see everything instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10 w-full max-w-sm sm:max-w-none">
          <Link href="/auth/signup" className="btn-primary text-sm md:text-base px-6 md:px-8 py-3 md:py-3.5 rounded-xl shadow-glow no-underline justify-center">
            Start Free — No Credit Card 🚀
          </Link>
          <Link href="/menu/dipak-creation" target="_blank" className="btn-ghost text-sm md:text-base px-6 md:px-8 py-3 md:py-3.5 rounded-xl no-underline justify-center">
            See Live Demo →
          </Link>
        </div>

        {/* Interactive Customizer & Phone Mockup */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-center mt-6 w-full max-w-4xl mx-auto">
          {/* Customizer Panel */}
          <div className="w-full max-w-sm p-6 bg-surface-2/30 border border-border/60 rounded-2xl shadow-xl flex flex-col gap-5 text-left backdrop-blur-sm animate-fade-up" style={{ animationDelay: '250ms' }}>
            <div>
              <p className="text-accent text-xs font-bold tracking-wider uppercase mb-1" style={{ color: themeColor }}>
                ⚡ Try it Live
              </p>
              <h3 className="font-display font-bold text-lg text-white">Customize Your Menu</h3>
              <p className="text-muted text-xs leading-relaxed mt-1">See how your digital menu will look to your customers instantly. Type your cafe name or change colors!</p>
            </div>

            <div className="h-px bg-border/40" />

            {/* Shop Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-white/80 uppercase tracking-wider">Cafe / Shop Name</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value || 'Dipak Chai Corner')}
                placeholder="e.g. Dipak Chai Corner"
                maxLength={22}
                className="bg-surface-2 border border-border text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none transition-all focus:border-accent"
                style={{ borderColor: themeColor }}
              />
            </div>

            {/* Color Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-white/80 uppercase tracking-wider">Brand Theme Color</label>
              <div className="flex gap-2.5 items-center mt-1">
                {[
                  { name: 'Emerald', hex: '#00e5a0' },
                  { name: 'Warm Gold', hex: '#f59e0b' },
                  { name: 'Spicy Red', hex: '#ef4444' },
                  { name: 'Lounge Blue', hex: '#3b82f6' },
                  { name: 'Amethyst Purple', hex: '#8b5cf6' },
                ].map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setThemeColor(color.hex)}
                    className={cn(
                      "w-7 h-7 rounded-full border transition-all cursor-pointer relative",
                      themeColor === color.hex ? "border-white scale-110 shadow-glow" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="flex-shrink-0 animate-fade-up" style={{ animationDelay: '350ms' }}>
            <PhoneMockup shopName={shopName} themeColor={themeColor} />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border-y border-border bg-surface">
        {[
          { n: '5 Cr+', l: 'Small Businesses in India' },
          { n: '5 Min', l: 'Setup Time' },
          { n: '₹0', l: 'To Get Started' },
          { n: '5', l: 'Shops Already Using' },
        ].map((s) => (
          <div key={s.l} className="text-center py-6 px-3 bg-surface">
            <p className="font-display font-black text-2xl md:text-3xl gradient-text">{s.n}</p>
            <p className="text-muted text-xs md:text-sm mt-1">{s.l}</p>
          </div>
        ))}
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        <span className="section-tag">How It Works</span>
        <h2 className="font-display font-black text-3xl md:text-5xl mb-3">Simple &amp; Seamless Lifecycle</h2>
        <p className="text-muted text-sm md:text-base max-w-md leading-relaxed font-light mb-10 md:mb-14">
          From printing QR codes to receiving real-time orders, here is how the magic happens.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { n: '01', icon: '📝', title: 'Setup Your Menu', desc: 'Quickly type menu items, set prices, add Veg/Non-Veg tags, and upload mouth-watering photos.' },
            { n: '02', icon: '🔳', title: 'Print Table QR Codes', desc: 'Download custom QR codes mapped to your tables or counters. Place them on tables for instant scanning.' },
            { n: '03', icon: '🔒', title: 'Scan & Secure Session', desc: 'Customers scan QR to start a private 24-hour session. Carts and orders stay completely isolated.' },
            { n: '04', icon: '🛎️', title: 'Ordering & Waiter Call', desc: 'Customers add items to cart, place orders instantly, or call the waiter directly with a single click.' },
            { n: '05', icon: '🔔', title: 'Live Alerts & Chimes', desc: 'Get real-time sound notifications on your dashboard when orders come in. Customers see live status updates.' },
            { n: '06', icon: '📊', title: 'Track Table Analytics', desc: 'Monitor active sessions, order conversion, popular dishes, and overall revenue from your panel.' },
          ].map((step) => (
            <div key={step.n} className="bg-surface border border-border rounded-card p-6 md:p-8 hover:border-accent/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="font-display font-black text-4xl md:text-5xl text-accent/10 leading-none mb-3">{step.n}</p>
              <p className="text-2xl md:text-3xl mb-3">{step.icon}</p>
              <h3 className="font-display font-bold text-base md:text-lg mb-2">{step.title}</h3>
              <p className="text-muted text-xs md:text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
          <span className="section-tag">Features</span>
          <h2 className="font-display font-black text-3xl md:text-5xl mb-10 md:mb-14">Everything You Need.<br />Nothing You Don&apos;t.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border rounded-2xl overflow-hidden">
            {[
              { icon: '🔳', bg: 'bg-accent/10', title: 'Instant QR Code', desc: 'Get unique QR codes for your shop or individual tables automatically on signup.' },
              { icon: '📱', bg: 'bg-accent-2/10', title: 'Mobile-First Design', desc: 'Beautiful, responsive digital menu page that loads instantly in any browser. No app install.' },
              { icon: '✏️', bg: 'bg-accent-3/10', title: 'Real-Time Price Sync', desc: 'Update prices, mark items as out of stock, or apply discounts. Changes reflect instantly.' },
              { icon: '🔒', bg: 'bg-purple-500/10', title: 'Isolated Sessions', desc: 'Secure 24-hour session per customer scan. Ensures private carts and order histories.' },
              { icon: '🔔', bg: 'bg-gold/10', title: 'Live Alerts & Sounds', desc: 'Real-time push orders with auditory bell notifications on dashboard, and live status chimes for customers.' },
              { icon: '🛎️', bg: 'bg-rose-500/10', title: 'Waiter Calling System', desc: 'Let customers request service or call the waiter to their exact table number with one simple click.' },
              { icon: '📊', bg: 'bg-accent/10', title: 'Scan & Session Funnel', desc: 'Deep dive into table engagement, conversion rates, busy hours, and average user session duration.' },
              { icon: '🖼️', bg: 'bg-accent-2/10', title: 'Photo & Veg/Non-Veg Tags', desc: 'Add engaging food photos and color-coded tags (Veg/Non-Veg/Best Seller) to increase checkouts.' },
              { icon: '🔗', bg: 'bg-accent-3/10', title: 'Social Bio Link', desc: 'Get a permanent link to share on WhatsApp Business status, Instagram bio, or Google Maps.' },
            ].map((f) => (
              <div key={f.title} className="bg-surface p-6 md:p-8 hover:bg-surface-2 transition-colors">
                <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl ${f.bg} flex items-center justify-center text-lg md:text-xl mb-4 md:mb-5`}>{f.icon}</div>
                <h3 className="font-display font-bold text-sm md:text-base mb-2">{f.title}</h3>
                <p className="text-muted text-xs md:text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        <span className="section-tag">Pricing</span>
        <h2 className="font-display font-black text-3xl md:text-5xl mb-3">Simple, Honest Pricing.</h2>
        <p className="text-muted text-sm md:text-base max-w-md font-light mb-10 md:mb-14">Start free. Upgrade when ready. Cancel anytime.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-start">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`bg-surface border rounded-card-lg p-6 md:p-8 relative transition-transform hover:-translate-y-1 ${plan.id === 'pro' ? 'border-accent shadow-[0_0_40px_rgba(0,229,160,0.12)]' : 'border-border'}`}>
              {plan.id === 'pro' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-bg text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase whitespace-nowrap">
                  ⚡ Most Popular
                </span>
              )}
              <p className="font-display font-bold mb-3">{plan.name}</p>
              <p className={`font-display font-black text-3xl md:text-4xl leading-none mb-1 ${plan.id === 'pro' ? 'text-accent' : plan.id === 'business' ? 'text-accent-2' : ''}`}>
                {plan.price === 0 ? '₹0' : formatCurrency(plan.price)}<span className="text-sm font-normal text-muted"> / month</span>
              </p>
              <p className="text-muted text-xs md:text-sm mb-5">
                {plan.id === 'free' ? 'Perfect to try it out' : plan.id === 'pro' ? 'For growing businesses' : 'For serious businesses'}
              </p>
              <hr className="border-border mb-4" />
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f.label} className={`flex items-center gap-2 text-xs md:text-sm ${f.included ? 'text-muted' : 'text-muted/40'}`}>
                    <span className={f.included ? 'text-accent' : 'text-danger'}>{f.included ? '✓' : '✕'}</span>{f.label}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className={`w-full flex items-center justify-center py-2.5 md:py-3 rounded-xl font-semibold text-sm no-underline transition-all ${plan.id === 'pro' ? 'btn-primary shadow-glow' : plan.id === 'business' ? 'border border-accent-2 text-accent-2 hover:bg-accent-2/5' : 'btn-ghost'}`}>
                {plan.id === 'free' ? 'Get Started Free' : plan.id === 'pro' ? 'Start Pro' : 'Go Business'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <div className="bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
          <span className="section-tag">Testimonials</span>
          <h2 className="font-display font-black text-3xl md:text-5xl mb-10 md:mb-14">Shop Owners Love It</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {[
              {
                q: '"Earlier I had to reprint menus every time prices changed. Now I just update online and QR works instantly!"',
                name: 'Dipak Patil',
                biz: 'Dipak Chai Corner, Gandhinagar',
                av: '👨'
              },
              {
                q: '"My restaurant looks so professional now. Customers love scanning the QR and seeing our full menu with photos!"',
                name: 'Sagar Patil',
                biz: 'Sagar Dhaba, Pune',
                av: '👨‍🍳'
              },
              {
                q: '"Setup was done in less than 10 minutes. Now 200+ people scan our menu daily. Best decision ever!"',
                name: 'Nilesh Jadhav',
                biz: 'Nilesh Fast Food, Nashik',
                av: '👨'
              },
              {
                q: '"I manage multiple locations and the Business plan lets me have separate QR codes for each. Super convenient!"',
                name: 'Kunal Kamod',
                biz: 'Kamod Tiffin Center, Ahmedabad',
                av: '👨‍💼'
              },
              {
                q: '"Analytics show me exactly which items are most popular. I removed slow sellers and my profits went up!"',
                name: 'Pankaj Jadhav',
                biz: 'Jadhav Snacks Corner, Kolhapur',
                av: '👨'
              },
              {
                q: '"As a salon owner, updating my service list and prices is now so easy. Clients always have the latest info."',
                name: 'Radhika Patil',
                biz: 'Radhika Beauty Studio, Solapur',
                av: '👩'
              },
            ].map((t) => (
              <div key={t.name} className="bg-bg border border-border rounded-card p-5 md:p-6 hover:border-accent/30 transition-colors">
                <p className="text-gold text-sm mb-3">★★★★★</p>
                <p className="text-muted text-xs md:text-sm leading-relaxed italic mb-5">{t.q}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center text-base md:text-lg flex-shrink-0">{t.av}</div>
                  <div>
                    <p className="font-semibold text-xs md:text-sm">{t.name}</p>
                    <p className="text-muted text-[10px] md:text-xs">{t.biz}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <section id="faq" className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <span className="section-tag">FAQ</span>
        <h2 className="font-display font-black text-3xl md:text-5xl mb-10">Questions? We Got You.</h2>
        <div className="space-y-3">
          {[
            { q: 'Do customers need to download an app?', a: 'No! Customers just scan the QR with their phone camera — no app download needed. Opens directly in browser.' },
            { q: 'What if I want to change prices?', a: 'Login, update the price, save. Updates instantly. Your QR code stays the same forever — no reprinting needed.' },
            { q: 'Can I use it for any type of shop?', a: 'Absolutely! Restaurants, salons, boutiques, tuition centers, electricians — any business with products or services.' },
            { q: 'Is the free plan really free?', a: 'Yes! Free plan is completely free — no credit card required. 10 menu items, 1 QR code, forever.' },
          ].map((faq) => (
            <details key={faq.q} className="border border-border rounded-xl overflow-hidden group">
              <summary className="flex items-center justify-between p-4 md:p-5 cursor-pointer bg-surface hover:bg-surface-2 transition-colors text-sm md:text-base font-medium list-none">
                {faq.q}
                <span className="text-accent text-xs ml-3 flex-shrink-0 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="px-4 md:px-5 pb-4 md:pb-5 text-muted text-xs md:text-sm leading-relaxed bg-surface-2">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="text-center py-16 md:py-24 px-4 bg-gradient-to-br from-accent/5 to-accent-2/5 border-b border-accent/20">
        <span className="section-tag">Get Started Today</span>
        <h2 className="font-display font-black text-3xl md:text-5xl mb-4">
          Your Shop Deserves a <span className="gradient-text">Digital Menu.</span>
        </h2>
        <p className="text-muted max-w-xs md:max-w-md mx-auto mb-8 md:mb-10 font-light leading-relaxed text-sm md:text-base">
          Join shop owners who stopped printing menus.
        </p>
        <Link href="/auth/signup" className="btn-primary text-base md:text-lg px-8 md:px-10 py-3.5 md:py-4 rounded-xl shadow-glow-lg no-underline">
          Create Your Free Menu Now →
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-surface border-t border-border px-4 md:px-12 pt-10 md:pt-12 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 md:mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 font-display font-black text-base mb-3">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center text-xs">🔳</span>
                QR-Menu
              </div>
              <p className="text-muted text-xs leading-relaxed max-w-[200px]">Digital menus for every Indian shop. Simple, fast, always up-to-date.</p>
            </div>
            {[
              {
                title: 'Product',
                links: [
                  { label: 'How It Works', href: '#how' },
                  { label: 'Features', href: '#features' },
                  { label: 'Pricing', href: '#pricing' }
                ]
              },
              {
                title: 'Support',
                links: [
                  { label: 'FAQ', href: '#faq' },
                  { label: 'Contact Us', href: '/contact' },
                  { label: 'WhatsApp Support', href: 'https://wa.me/919999999999' }
                ]
              },
              {
                title: 'Legal',
                links: [
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Refund Policy', href: '/refund' }
                ]
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[10px] font-bold tracking-widest uppercase text-muted mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith('/') ? (
                        <Link href={l.href} className="text-muted text-xs hover:text-[#f0f0f5] transition-colors no-underline">
                          {l.label}
                        </Link>
                      ) : (
                        <a href={l.href} className="text-muted text-xs hover:text-[#f0f0f5] transition-colors">
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-muted text-xs">© 2026 QR-Menu. Made with ❤️ in India 🇮🇳</p>
            <p className="text-accent text-xs font-bold">Every Shop, Go Digital!</p>
          </div>
        </div>
      </footer>
    </>
  );
}
