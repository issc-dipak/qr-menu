'use client';
import { Navbar } from '@/components/layout/Navbar';

export default function RefundPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-bg text-[#f0f0f5] pt-24 pb-16 px-4 md:px-10 max-w-3xl mx-auto">
        <h1 className="font-display font-black text-3xl md:text-5xl mb-6">Refund Policy</h1>
        <p className="text-xs text-muted mb-8">Last Updated: June 8, 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-muted">
          <p>
            Thank you for subscribing to our plans at **QR-Menu**.
          </p>

          <h2 className="font-display font-bold text-lg text-[#f0f0f5] mt-8">1. Monthly Subscriptions</h2>
          <p>
            We offer a monthly subscription plan for Pro and Business upgrades. Since we use a safe testing sandbox environment and offer a completely **Free Tier** to evaluate the platform before billing, standard subscription payments are non-refundable once processed.
          </p>

          <h2 className="font-display font-bold text-lg text-[#f0f0f5] mt-8">2. Cancellation Policy</h2>
          <p>
            You can cancel your active subscription at any time from your **Dashboard Billing Settings**. Upon cancellation, you will retain access to your premium plan benefits until the end of your current active billing cycle. No further amounts will be charged.
          </p>

          <h2 className="font-display font-bold text-lg text-[#f0f0f5] mt-8">3. Payment Errors</h2>
          <p>
            In the event of duplicate transactions or system connection failures processed during Razorpay settlement, verified duplicate captures will be credited back to your original payment source within 5–7 working days.
          </p>

          <h2 className="font-display font-bold text-lg text-[#f0f0f5] mt-8">4. Contact support</h2>
          <p>
            For subscription verification, billing inquiries, or payment concerns, please write to us at **support@qr-menu.com**.
          </p>
        </div>
      </div>
    </>
  );
}
