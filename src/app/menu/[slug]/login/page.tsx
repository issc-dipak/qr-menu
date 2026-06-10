'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getOwnerBySlug } from '@/services/ownerService';
import { loginWithMobile } from '@/services/customerAuthService';
import { useCartStore } from '@/store';
import toast from 'react-hot-toast';

interface PageProps {
  params: { slug: string };
}

export default function CustomerLoginPage({ params }: PageProps) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [shopName, setShopName] = useState('QR-Menu');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const cart = useCartStore();

  useEffect(() => {
    async function loadShop() {
      try {
        const ownerData = await getOwnerBySlug(params.slug);
        if (ownerData) {
          setShopName(ownerData.shop_name);
        }
      } catch (err) {
        console.warn('Failed to load shop details:', err);
      }
    }
    loadShop();
  }, [params.slug]);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(val);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Logging you in...');
    try {
      const customerProfile = await loginWithMobile(mobileNumber);
      cart.setCustomer(customerProfile);
      toast.success(`Welcome to ${shopName}! 🚀`, { id: toastId });
      router.push(`/menu/${params.slug}`);
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1a12] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute w-72 h-72 rounded-full bg-accent blur-[120px] opacity-[0.07] -top-24 left-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute w-64 h-64 rounded-full bg-accent-2 blur-[100px] opacity-[0.05] -bottom-24 left-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="w-full max-w-sm bg-white/[0.03] border border-accent/15 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 text-center">
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-3xl mx-auto mb-4">
          📱
        </div>
        
        <h1 className="font-display font-black text-xl text-[#f0f0f5] leading-tight">
          Welcome to <span className="text-accent">{shopName}</span>
        </h1>
        <p className="text-muted text-xs mt-1.5 mb-8">
          Please enter your mobile number to view the menu and place orders.
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="text-left">
            <label htmlFor="mobile" className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Mobile Number
            </label>
            <div className="flex items-center bg-white/[0.02] border border-border hover:border-accent/40 focus-within:border-accent/80 rounded-xl px-3.5 py-3 gap-2 transition-all">
              <span className="text-muted text-sm font-sans font-bold select-none">+91</span>
              <input
                id="mobile"
                type="tel"
                value={mobileNumber}
                onChange={handleMobileChange}
                placeholder="98765 43210"
                className="bg-transparent outline-none text-sm flex-1 text-[#f0f0f5] placeholder:text-white/20 font-sans tracking-wide"
                disabled={loading}
                autoFocus
              />
            </div>
            <p className="text-[10px] text-muted/60 mt-1.5">
              Enter 10 digits. No country code, spaces, or letters.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || mobileNumber.length !== 10}
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:pointer-events-none text-bg font-black py-3.5 rounded-xl transition-all shadow-glow text-sm cursor-pointer border-none flex items-center justify-center font-display"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-bg" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              'Enter Menu 🚀'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
