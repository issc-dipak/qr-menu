'use client';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function AiChatBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: `Hello! 👋 Need help with QR-Menu? Ask me anything! e.g., "How it works" or "Pricing"`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Hide chatbot on customer menu public views (/menu/[slug])
  if (pathname?.startsWith('/menu')) {
    return null;
  }

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
        response = `📝 **How it works**:
1. Register your shop in 2 min.
2. Add menu dishes, prices, and photos.
3. Download & print your unique QR code!`;
      } else if (query.includes('price') || query.includes('pricing') || query.includes('cost') || query.includes('free')) {
        response = `💳 **Plans**:
- Free: 10 items, 1 QR
- Pro (₹149/mo): Unlimited items, photos, analytics
- Business (₹299/mo): 5 QRs, white-labeling`;
      } else if (query.includes('reprint') || query.includes('change price') || query.includes('update')) {
        response = `🔄 **No Reprinting!**
Once printed, updates publish instantly online. The QR code stays the same forever!`;
      } else {
        response = `💡 **AI Support**:
I can help you build your digital menu. Ask me about features, billing, or free limits! Or click "Get Started" to sign up.`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat window */}
      {isOpen && (
        <div className="w-[320px] sm:w-[360px] h-[450px] bg-surface border border-border rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden mb-4 animate-fade-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-accent to-accent-2 p-4 flex items-center justify-between text-bg">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <div>
                <p className="font-bold text-xs leading-none">QR-Menu Assistant</p>
                <p className="text-[10px] opacity-80 mt-0.5">Online • Ask me anything</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-bg hover:opacity-75 transition-opacity text-sm font-bold border-none bg-transparent cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-bg/40">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-accent text-bg font-semibold rounded-tr-none'
                      : 'bg-surface-2 border border-border text-[#f0f0f5] rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-2 border border-border text-[#f0f0f5] rounded-xl rounded-tl-none px-3 py-2 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-border bg-surface-2 flex gap-1.5">
            <input
              type="text"
              className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-xs text-[#f0f0f5] placeholder:text-muted outline-none focus:border-accent transition-all"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-bg font-bold px-3 py-2 rounded-lg text-xs transition-all border-none cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center text-2xl shadow-[0_4px_20px_rgba(0,229,160,0.3)] hover:scale-105 transition-all cursor-pointer border-none"
        aria-label="Open AI Assistant"
      >
        {isOpen ? '✕' : '✨'}
      </button>
    </div>
  );
}
