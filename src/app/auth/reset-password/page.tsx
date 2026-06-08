'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updatePassword } from '@/services/authService';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!password) {
      e.password = 'Password is required';
    } else if (password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await updatePassword(password);
      toast.success('Password updated successfully! Key changed. 🔑');
      router.push('/auth/login');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
      setErrors({ form: err.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
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
            Setup your<br /><span className="text-accent">new password</span><br />instantly.
          </h2>
          <p className="text-muted text-base leading-relaxed max-w-sm font-light">
            Once saved, you can log in immediately using your new password.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-[460px] flex-shrink-0 bg-bg border-l border-border flex flex-col justify-center px-10 py-12">
        <div className="mb-8">
          <h3 className="font-display font-black text-2xl mb-1">Create New Password 🔑</h3>
          <p className="text-muted text-sm">Please choose a strong password for your account</p>
        </div>

        <div className="space-y-4">
          {errors.form && (
            <div className="bg-danger/10 border border-danger/20 rounded-xl p-3 text-xs text-danger text-center">
              {errors.form}
            </div>
          )}

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            error={errors.confirmPassword}
          />

          <Button fullWidth loading={loading} onClick={onSubmit} size="lg">
            Save New Password
          </Button>

          <div className="text-center mt-4">
            <Link href="/auth/login" className="text-xs text-muted hover:text-[#f0f0f5] hover:underline">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
