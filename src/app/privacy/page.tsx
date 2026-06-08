'use client';
import { Navbar } from '@/components/layout/Navbar';

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-bg text-[#f0f0f5] pt-24 pb-16 px-4 md:px-10 max-w-3xl mx-auto">
        <h1 className="font-display font-black text-3xl md:text-5xl mb-6">Privacy Policy</h1>
        <p className="text-xs text-muted mb-8">Last Updated: June 8, 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-muted">
          <p>
            At **QR-Menu**, accessible from our website, one of our main priorities is the privacy of our visitors and shop owners. This Privacy Policy document contains types of information that is collected and recorded by QR-Menu and how we use it.
          </p>

          <h2 className="font-display font-bold text-lg text-[#f0f0f5] mt-8">1. Information We Collect</h2>
          <p>
            When you register for an account, we may ask for your contact information, including items such as your name, shop name, email address, phone number, and category options.
          </p>

          <h2 className="font-display font-bold text-lg text-[#f0f0f5] mt-8">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide, operate, and maintain our digital menu platform</li>
            <li>Improve, personalize, and expand our menu designs and services</li>
            <li>Understand and analyze how you and your scanners use our menu platform</li>
            <li>Process your Razorpay subscriptions and billing requests</li>
          </ul>

          <h2 className="font-display font-bold text-lg text-[#f0f0f5] mt-8">3. Security</h2>
          <p>
            We use secure database encryption protocols (through Supabase) to ensure your account credentials, billing links, and subscriber tokens are safe.
          </p>

          <h2 className="font-display font-bold text-lg text-[#f0f0f5] mt-8">4. Contact Us</h2>
          <p>
            If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at **support@qr-menu.com**.
          </p>
        </div>
      </div>
    </>
  );
}
