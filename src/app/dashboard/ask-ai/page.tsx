'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore, useMenuStore, useAnalyticsStore } from '@/store';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function AskAiPage() {
  const { owner } = useAuthStore();
  const { items } = useMenuStore();
  const { data: analyticsData } = useAnalyticsStore();

  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: `Hello ${owner?.name?.split(' ')[0] || 'Partner'}! 👋 I am your **QR-Menu AI Assistant**. I have analyzed your shop setup and stats. Ask me anything, for example:
- *How can I get more scans?*
- *Write a description for my menu items.*
- *Suggest a pricing strategy based on my categories.*
- *Give me a summary of my shop performance.*`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
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

    // Context analysis for simulated responses tailored exactly to their shop
    setTimeout(() => {
      let response = "";
      const query = userMessage.toLowerCase();
      const shopName = owner?.shop_name || "your shop";
      const shopCategory = owner?.shop_category || "General Shop";
      const itemCount = items.length;
      const scansTotal = analyticsData?.totalScans || 0;

      if (query.includes('performance') || query.includes('report') || query.includes('scans') || query.includes('stats') || query.includes('analytics')) {
        response = `📊 **Shop Performance Analysis for ${shopName}**:
- **Setup Health**: You have **${itemCount} active menu items** configured in the **${shopCategory}** category.
- **Scan Stats**: You have recorded **${scansTotal.toLocaleString()} total scans**.
- **Assessment**: ${
          scansTotal < 50
            ? "Your scan volume is in the early stages! I recommend printing your table QR code tents or placing a dynamic poster right at the ordering counter."
            : "Impressive numbers! You have a stable user engagement rate. To push this further, try offering a small QR-only combo discount."
        }`;
      } else if (query.includes('get more') || query.includes('increase') || query.includes('growth') || query.includes('marketing') || query.includes('promote')) {
        response = `🚀 **Growth Action Plan for ${shopName}**:
1. **QR Placement**: Place a high-quality print at the main counter and on every dining table.
2. **Special QR Badge**: Announce a small discount (e.g., "Scan QR to view Special Dishes & get 5% Off").
3. **Use Social Media**: Share your unique digital menu link (\`${owner?.shop_slug ? `qr-menu.com/menu/${owner.shop_slug}` : 'your-link'}\`) on your Instagram bio and WhatsApp Business catalog.
4. **Visual Menus**: Ensure at least 3-4 top items have photos uploaded, as visual menus get 3x higher scan-to-order conversions.`;
      } else if (query.includes('pricing') || query.includes('price') || query.includes('cost') || query.includes('profit')) {
        response = `💰 **Pricing Strategy Recommendations**:
- Since you are operating in **${shopCategory}**, high visual appeal makes a huge difference.
- **Decoy Pricing**: Pair your premium best-seller item alongside a standard item. This naturally pulls orders towards the premium tier.
- **Smart Adjustments**: Try adding a "Value Combo" category. Bundling a popular beverage with a snack generally increases average ticket size by 15-20%!`;
      } else if (query.includes('description') || query.includes('write') || query.includes('menu item') || query.includes('name')) {
        const sampleItem = items[0]?.name || "Special Dish";
        response = `✍️ **AI Menu Copywriter**:
Here is a premium description template you can use for your items (like **${sampleItem}**):
> *"Freshly made to order using premium locally-sourced ingredients. Perfectly balanced flavors crafted to satisfy your cravings. Enjoy it warm! 🌟"*
- **Tip**: Keep descriptions under 120 characters, focusing on sensory words (e.g., *crispy, aromatic, cooling, sweet*).`;
      } else {
        response = `💡 **QR-Menu AI Advisor**:
That is a great question! For a **${shopCategory}** like **${shopName}** with **${itemCount} items**, I recommend focusing on:
1. Keeping prices updated inside **Settings** (since it updates instantly without printing).
2. Promoting your top-rated items with high-resolution images.
3. Checking your **Analytics** page weekly to see peak scanner hours.

Is there a specific menu item description or marketing poster idea you would like me to generate for you?`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-210px)] md:h-[calc(100vh-190px)]">
      {/* Header */}
      <div className="mb-4">
        <h1 className="font-display font-black text-2xl">Ask AI</h1>
        <p className="text-muted text-sm mt-1">Get business insights, custom menu copywriting, and growth tips tailored to your shop.</p>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-surface border border-border rounded-2xl flex flex-col overflow-hidden relative min-h-[300px]">
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
            placeholder="Type a message (e.g. 'How do I get more scans?')..."
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
  );
}
