'use client';
import { Navbar } from '@/components/layout/Navbar';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    formData.append("access_key", "338b605e-2aee-45e7-bbb9-2a1583bb73f1");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Message sent successfully to mail! ✉️');
          formElement.reset();
        } else {
          toast.error(data.message || 'Failed to send message. Please try again.');
        }
      } else {
        toast.error('Server error. Please try again later.');
      }
    } catch (err) {
      toast.error('An error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-bg text-[#f0f0f5] pt-24 pb-16 px-4 md:px-10 max-w-3xl mx-auto flex flex-col justify-center">
        <div className="text-center mb-8">
          <span className="section-tag">Support</span>
          <h1 className="font-display font-black text-3xl md:text-5xl mb-3">Contact Us</h1>
          <p className="text-muted text-sm max-w-md mx-auto">Have queries or facing technical difficulties? Fill out the form below to receive answers on your mail.</p>
        </div>

        <div className="grid md:grid-cols-[1fr_260px] gap-8">
          <form onSubmit={handleSubmit} className="bg-surface border border-border p-6 rounded-card space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-[#f0f0f5] placeholder:text-muted outline-none focus:border-accent transition-all"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                required
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-[#f0f0f5] placeholder:text-muted outline-none focus:border-accent transition-all"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Message</label>
              <textarea
                name="message"
                required
                rows={4}
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-[#f0f0f5] placeholder:text-muted outline-none focus:border-accent transition-all resize-none"
                placeholder="Type your message..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl font-bold transition-all border-none cursor-pointer"
            >
              {loading ? 'Sending to Mail...' : 'Send Message ✉️'}
            </button>
          </form>

          <div className="space-y-6">
            <div className="bg-surface border border-border p-5 rounded-card">
              <p className="text-xs font-bold text-accent uppercase tracking-wider mb-2">📍 Address</p>
              <p className="text-xs text-muted leading-relaxed">
                QR-Menu Office,<br />
                Shivaji Nagar, Pune,<br />
                Maharashtra, India 🇮🇳
              </p>
            </div>
            <div className="bg-surface border border-border p-5 rounded-card">
              <p className="text-xs font-bold text-accent-2 uppercase tracking-wider mb-2">✉️ Email Support</p>
              <p className="text-xs text-muted leading-relaxed">
                dipakpatil8589@gmail.com
              </p>
            </div>
            <div className="bg-surface border border-border p-5 rounded-card">
              <p className="text-xs font-bold text-gold uppercase tracking-wider mb-2">⚡ Quick Help</p>
              <p className="text-xs text-muted leading-relaxed">
                For prompt replies, try our floating **AI Assistant** at the bottom right of the page!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
