'use client';
import { Badge } from '@/components/ui/index';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store';
import { PLANS } from '@/constants';
import { useTranslation } from '@/hooks/useTranslation';
import { formatCurrency } from '@/utils';
import { cn } from '@/utils';
import toast from 'react-hot-toast';
import { createSubscription } from '@/services/subscriptionService';
import { Check, X, CreditCard } from 'lucide-react';

export default function BillingPage() {
  const { owner } = useAuthStore();
  const { t } = useTranslation('owner');
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
        color: '#6366f1',
      },
    };

    toast.dismiss('billing-toast');
    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-accent" /> {t.billingTitle}
        </h1>
        <p className="text-muted text-sm mt-1">{t.billingSubtitle}</p>
      </div>

      {/* Current Plan Banner */}
      <div className="card mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider">{t.currentPlan}</p>
          <div className="flex items-center gap-3">
            <p className="font-display font-bold text-2xl text-white">{currentPlan.name} {t.plan}</p>
            <Badge variant="green">{t.active}</Badge>
          </div>
          <p className="text-muted text-sm mt-2 font-medium">
            {currentPlan.maxItems === Infinity ? t.unlimited : `${t.upTo} ${currentPlan.maxItems}`} {t.menuItemsCount} · {currentPlan.maxQrCodes} QR
          </p>
        </div>
        {owner?.plan === 'free' && (
          <Button onClick={() => handleUpgrade('pro', 149)}>
            {t.upgradeToPro}
          </Button>
        )}
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === (owner?.plan ?? 'free');
          const planDesc = plan.id === 'free' ? t.planFree : plan.id === 'pro' ? t.planPro : t.planBusiness;
          return (
            <div
              key={plan.id}
              className={cn(
                'bg-surface border rounded-card-lg p-7 relative transition-all duration-300 hover:border-border-2 hover:bg-surface-2',
                plan.id === 'pro' ? 'border-accent shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-border',
                isCurrent && 'ring-1 ring-accent/30'
              )}
            >
              {plan.id === 'pro' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase whitespace-nowrap shadow-sm">
                  {t.recommended}
                </span>
              )}

              <p className="font-display font-bold text-lg text-white mb-2">{plan.name}</p>
              <p className="font-display font-bold text-3xl leading-none text-white mb-1.5">
                {plan.price === 0 ? '₹0' : formatCurrency(plan.price)}
                <span className="text-sm font-normal text-muted">{t.perMonth}</span>
              </p>
              <p className="text-muted text-xs mb-5 font-medium">{planDesc}</p>

              <hr className="border-border mb-5" />

              <ul className="space-y-3.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f.label} className={cn('flex items-start gap-2.5 text-xs font-medium', f.included ? 'text-muted' : 'text-muted/40')}>
                    {f.included ? (
                      <Check className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-danger flex-shrink-0 mt-0.5" />
                    )}
                    <span className="leading-tight">{f.label}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button disabled className="w-full py-2.5 rounded-xl border border-border text-muted text-xs font-semibold opacity-50 cursor-not-allowed bg-transparent">
                  {t.currentPlanBtn}
                </button>
              ) : (
                <Button
                  fullWidth
                  variant={plan.id === 'pro' ? 'primary' : 'ghost'}
                  onClick={() => handleUpgrade(plan.id as 'pro' | 'business', plan.price)}
                  className={plan.id === 'business' ? 'border-accent-2 text-accent-2 hover:bg-accent-2/5' : ''}
                >
                  {plan.id === 'free' ? t.downgrade : `${t.upgradeTo} ${plan.name}`}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="card mt-6">
        <h3 className="font-display font-semibold text-white tracking-tight mb-4">{t.billingFaq}</h3>
        <div className="space-y-4">
          {[
            { q: t.faqCancelQ,  a: t.faqCancelA  },
            { q: t.faqPaymentQ, a: t.faqPaymentA },
            { q: t.faqQrQ,      a: t.faqQrA      },
          ].map((faq) => (
            <div key={faq.q} className="border-b border-border/50 last:border-0 pb-4 last:pb-0">
              <p className="font-semibold text-sm mb-1 text-[#f0f0f5]">{faq.q}</p>
              <p className="text-muted text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
