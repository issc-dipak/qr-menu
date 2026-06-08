'use client';
import { Navbar } from '@/components/layout/Navbar';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-bg text-[#f0f0f5] pt-24 pb-16 px-4 md:px-10 max-w-3xl mx-auto">
        <h1 className="font-display font-black text-3xl md:text-5xl mb-6">Terms of Service</h1>
        <p className="text-xs text-muted mb-8">Last Updated: June 8, 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-muted">
          <p>
            Welcome to **QR-Menu**! These terms and conditions outline the rules and regulations for the use of our website and services.
          </p>

          <h2 className="font-display font-bold text-lg text-[#f0f0f5] mt-8">1. Intellectual Property Rights</h2>
          <p>
            Other than the content you own (such as your menu item titles, prices, descriptions, and uploaded photos), QR-Menu and its licensors own all the intellectual property rights and materials contained in this website.
          </p>

          <h2 className="font-display font-bold text-lg text-[#f0f0f5] mt-8">2. Restrictions</h2>
          <p>
            You are specifically restricted from all of the following:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Using this website in any way that is or may be damaging to this website;</li>
            <li>Using this website contrary to applicable local laws and regulations;</li>
            <li>Engaging in any data mining, data harvesting, or data extracting in relation to this website.</li>
          </ul>

          <h2 className="font-display font-bold text-lg text-[#f0f0f5] mt-8">3. Subscriptions</h2>
          <p>
            Some parts of the service are billed on a subscription basis using **Razorpay**. You will be billed in advance on a recurring monthly cycle depending on the tier (Pro or Business) you choose.
          </p>

          <h2 className="font-display font-bold text-lg text-[#f0f0f5] mt-8">4. Limitation of Liability</h2>
          <p>
            In no event shall QR-Menu, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this digital menu platform.
          </p>
        </div>
      </div>
    </>
  );
}
