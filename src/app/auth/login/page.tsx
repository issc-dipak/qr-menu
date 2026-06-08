'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Divider } from '@/components/ui/index';
import { useAuth } from '@/hooks';

export default function LoginPage() {
  const router = useRouter();
  const { handleLogin, handleGoogle, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'Email is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    const ok = await handleLogin({ email, password });
    if (ok) router.push('/dashboard/overview');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 bg-gradient-to-br from-[#0a1a12] to-[#0a0f1a] relative overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-accent blur-[100px] opacity-[0.07] -top-24 -right-24" />
        <div className="absolute w-72 h-72 rounded-full bg-accent-2 blur-[80px] opacity-[0.06] -bottom-20 -left-20" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 font-display font-black text-xl mb-12 no-underline text-[#f0f0f5]">
            <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">🔳</span>
            QR-Menu
          </Link>
          <h2 className="font-display font-black text-4xl leading-tight mb-4">
            Create your shop&apos;s<br /><span className="text-accent">digital menu</span><br />in 5 minutes.
          </h2>
          <p className="text-muted text-base leading-relaxed max-w-sm font-light">
            Join thousands of Indian shop owners who went digital with QR-Menu.
          </p>
          <div className="mt-10 space-y-3">
            {['Instant QR code for your shop', 'Update menu in real-time', 'See how many people scan', 'Start completely free'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-muted">
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-xs">✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-[460px] flex-shrink-0 bg-bg border-l border-border flex flex-col justify-center px-10 py-12">
        <div className="mb-8">
          <h3 className="font-display font-black text-2xl mb-1">Welcome back 👋</h3>
          <p className="text-muted text-sm">Sign in to your QR-Menu account</p>
        </div>

        <div className="space-y-4">
          <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
          <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
          <div className="text-right">
            <a href="#" className="text-xs text-accent hover:underline">Forgot password?</a>
          </div>
          <Button fullWidth loading={loading} onClick={onSubmit} size="lg">
            Login to Dashboard →
          </Button>
        </div>

        <Divider label="or" />

        <button
          onClick={handleGoogle}
          className="flex items-center justify-center gap-3 w-full py-3 bg-surface border border-border rounded-xl text-sm font-medium hover:border-accent hover:bg-accent/4 transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.7-6.7C35.7 2.3 30.2 0 24 0 14.7 0 6.8 5.4 2.9 13.3l7.8 6.1C12.5 13 17.9 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h12.4c-.5 2.9-2.2 5.3-4.7 6.9l7.3 5.7c4.3-3.9 6.8-9.7 6.8-16.7z"/>
            <path fill="#FBBC05" d="M10.7 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.7-4.6L2.4 13.3A24 24 0 0 0 0 24c0 3.8.9 7.4 2.4 10.6l8.3-6z"/>
            <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.3-5.7c-2 1.4-4.6 2.2-7.9 2.2-6.1 0-11.3-4.1-13.2-9.6l-8.1 6.3C6.7 42.5 14.8 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-muted text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-accent hover:underline font-medium">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
