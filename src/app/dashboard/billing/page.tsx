'use client';
import { Badge } from '@/components/ui/index';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store';
import { PLANS } from '@/constants';
import { formatCurrency } from '@/utils';
import { cn } from '@/utils';
import toast from 'react-hot-toast';
import { createSubscription } from '@/services/subscriptionService';

export default function BillingPage() {
  const { owner } = useAuthStore();
  const currentPlan = PLANS.find((p) => p.id === (owner?.plan ?? 'free')) ?? PLANS[0];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (planId: 'pro' | 'business', price: number) => {
    if (!owner) {
      toast.error('Please log in first');
      return;
    }

    toast.loading('Initializing checkout...', { id: 'billing-toast' });

    const res = await loadRazorpayScript();
    if (!res) {
      toast.error('Failed to load Razorpay SDK. Please check your connection.', { id: 'billing-toast' });
      return;
    }

    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxxxx';

    const options = {
      key: key,
      amount: price * 100, // in paise
      currency: 'INR',
      name: 'QR-Menu',
      description: `Upgrade to ${planId.toUpperCase()} Plan`,
      handler: async function (response: any) {
        toast.loading('Processing subscription...', { id: 'billing-toast' });
        try {
          await createSubscription({
            ownerId: owner.id,
            plan: planId,
            amount: price,
            razorpayPaymentId: response.razorpay_payment_id,
          });
          // Update the owner state in local store
          useAuthStore.getState().setOwner({
            ...owner,
            plan: planId,
          });
          toast.success(`Success! Upgraded to ${planId.toUpperCase()} 🎉`, { id: 'billing-toast' });
        } catch (err) {
          toast.error('Failed to save subscription details.', { id: 'billing-toast' });
        }
      },
      prefill: {
        name: owner.name,
        email: owner.email,
        contact: owner.shop_phone || '',
      },
      theme: {
        color: '#00e5a0',
      },
    };

    toast.dismiss('billing-toast');
    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-black text-2xl">Billing & Plans</h1>
        <p className="text-muted text-sm mt-1">Manage your subscription</p>
      </div>

      {/* Current Plan Banner */}
      <div className="card mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs text-muted mb-1 uppercase tracking-wider">Current Plan</p>
          <div className="flex items-center gap-3">
            <p className="font-display font-black text-2xl">{currentPlan.name} Plan</p>
            <Badge variant="green">Active</Badge>
          </div>
          <p className="text-muted text-sm mt-1">
            {currentPlan.maxItems === Infinity ? 'Unlimited' : `Up to ${currentPlan.maxItems}`} menu items · {currentPlan.maxQrCodes} QR code
          </p>
        </div>
        {owner?.plan === 'free' && (
          <Button onClick={() => handleUpgrade('pro', 149)}>
            Upgrade to Pro ⚡
          </Button>
        )}
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === (owner?.plan ?? 'free');
          return (
            <div
              key={plan.id}
              className={cn(
                'bg-surface border rounded-card-lg p-7 relative transition-transform hover:-translate-y-1',
                plan.id === 'pro' ? 'border-accent shadow-[0_0_40px_rgba(0,229,160,0.1)]' : 'border-border',
                isCurrent && 'ring-1 ring-accent/30'
              )}
            >
              {plan.id === 'pro' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-bg text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase whitespace-nowrap">
                  ⚡ Recommended
                </span>
              )}

              <p className="font-display font-bold mb-3">{plan.name}</p>
              <p className={cn(
                'font-display font-black text-4xl leading-none mb-1',
                plan.id === 'pro' ? 'text-accent' : plan.id === 'business' ? 'text-accent-2' : ''
              )}>
                {plan.price === 0 ? '₹0' : formatCurrency(plan.price)}
                <span className="text-sm font-normal text-muted"> /mo</span>
              </p>
              <p className="text-muted text-sm mb-5">
                {plan.id === 'free' ? 'To try it out' : plan.id === 'pro' ? 'For growing shops' : 'For multi-location shops'}
              </p>

              <hr className="border-border mb-5" />

              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f.label} className={cn('flex items-center gap-2 text-sm', f.included ? 'text-muted' : 'text-muted/40')}>
                    <span className={f.included ? 'text-accent' : 'text-danger'}>{f.included ? '✓' : '✕'}</span>
                    {f.label}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button disabled className="w-full py-3 rounded-xl border border-border text-muted text-sm opacity-50 cursor-not-allowed">
                  Current Plan
                </button>
              ) : (
                <Button
                  fullWidth
                  variant={plan.id === 'pro' ? 'primary' : 'ghost'}
                  onClick={() => handleUpgrade(plan.id as 'pro' | 'business', plan.price)}
                  className={plan.id === 'business' ? 'border-accent-2 text-accent-2 hover:bg-accent-2/5' : ''}
                >
                  {plan.id === 'free' ? 'Downgrade' : `Upgrade to ${plan.name}`}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="card mt-6">
        <h3 className="font-display font-bold mb-4">Billing FAQ</h3>
        <div className="space-y-4">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes! Cancel anytime from your dashboard. No questions asked.' },
            { q: 'What payment methods are accepted?', a: 'UPI, Credit/Debit Cards, Net Banking via Razorpay.' },
            { q: 'Will my QR code change if I upgrade?', a: 'No! Your QR code stays the same forever, regardless of plan.' },
          ].map((faq) => (
            <div key={faq.q} className="border-b border-border/50 last:border-0 pb-4 last:pb-0">
              <p className="font-medium text-sm mb-1">{faq.q}</p>
              <p className="text-muted text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
