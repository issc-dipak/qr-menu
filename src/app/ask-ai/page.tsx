'use client';
import { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';

export default function PublicAskAiPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: `Hello! Welcome to **QR-Menu AI Assistant**! 🌟 I am here to help you learn about how a digital QR menu can grow your business. Ask me anything, for example:
- *What is QR-Menu and how does it work?*
- *How much does it cost?*
- *Will I need to print new QR codes every time I change my prices?*
- *How can a digital menu increase my sales?*`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    setTimeout(() => {
      let response = "";
      const query = userMessage.toLowerCase();

      if (query.includes('how it works') || query.includes('work') || query.includes('how to use')) {
        response = `📝 **How QR-Menu Works**:
1. **Create Account**: Register your shop in under 2 minutes.
2. **Add Menu Items**: Upload dishes, services, prices, and photos.
3. **Download QR Code**: Instantly generate and print your shop's unique QR code.
4. **Scan & View**: Customers scan the QR code using their phone camera and instantly view your menu on their browser (no app download required!).`;
      } else if (query.includes('price') || query.includes('pricing') || query.includes('cost') || query.includes('free') || query.includes('plan')) {
        response = `💳 **Simple, Honest Pricing Plans**:
- **Free Plan (₹0)**: Up to 10 menu items, 1 QR code, and a shareable link. No credit card required!
- **Pro Plan (₹149/mo)**: Unlimited items, 1 QR code, analytics dashboard, and photo uploads.
- **Business Plan (₹299/mo)**: Unlimited items, 5 QR codes (perfect for separate tables), premium designs, advanced analytics, and custom white-label branding.`;
      } else if (query.includes('change price') || query.includes('reprint') || query.includes('update')) {
        response = `🔄 **Real-Time Instant Updates**:
No! You **never** have to reprint your QR code. Once you print and paste the QR code at your shop, you can change prices, add dishes, or mark items as "Out of stock" instantly from your dashboard. The QR code stays exactly the same!`;
      } else if (query.includes('benefit') || query.includes('sales') || query.includes('increase') || query.includes('why use')) {
        response = `📈 **Key Benefits of Using a Digital QR Menu**:
1. **Save Printing Costs**: Stop paying ₹500–1,000 every time you update your menu list or prices.
2. **Attract with Photos**: Menus with high-quality photos increase order values by up to 30%.
3. **No App Required**: Customers scan and view instantly in their standard phone browser.
4. **Instant Updates**: Turn items on/off or change prices in real-time.`;
      } else {
        response = `💡 **QR-Menu Helper**:
I'd love to help you configure your shop! QR-Menu is a modern SaaS platform designed to digitize local restaurants, cafes, food trucks, salons, and retail shops.

Feel free to ask about our **features**, **free plan limits**, or **how it helps you save printing costs**! You can also click "Get Started Free" at the top right to build your menu right now.`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
      setLoading(false);
    }, 900);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-bg text-[#f0f0f5] flex flex-col justify-between pt-24 pb-8 px-4 md:px-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-block text-xs font-bold bg-accent/10 border border-accent/20 text-accent px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            Ask AI ✨
          </span>
          <h1 className="font-display font-black text-3xl md:text-5xl leading-none">
            Have Questions about <span className="gradient-text">QR-Menu?</span>
          </h1>
          <p className="text-muted text-sm md:text-base mt-2 max-w-md mx-auto">
            Get instant answers about our features, setup process, and pricing.
          </p>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-surface border border-border rounded-2xl flex flex-col overflow-hidden relative min-h-[400px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-accent text-bg font-medium rounded-tr-none'
                      : 'bg-surface-2 border border-border text-[#f0f0f5] rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-2 border border-border text-[#f0f0f5] rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-4 border-t border-border bg-bg/50 flex gap-2">
            <input
              type="text"
              className="flex-1 bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-[#f0f0f5] placeholder:text-muted outline-none focus:border-accent transition-all"
              placeholder="Ask anything about QR-Menu (e.g. 'How much does it cost?')..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              Send ⚡
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
