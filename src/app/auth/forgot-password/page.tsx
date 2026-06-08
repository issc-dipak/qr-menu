'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { resetPassword } from '@/services/authService';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
      toast.success('Password reset link sent! ✉️');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset link');
      setError(err.message || 'Something went wrong');
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
            Recover your<br /><span className="text-accent">account password</span><br />securely.
          </h2>
          <p className="text-muted text-base leading-relaxed max-w-sm font-light">
            We will send a secure link to reset your password and get you back on track.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-[460px] flex-shrink-0 bg-bg border-l border-border flex flex-col justify-center px-10 py-12">
        <div className="mb-8">
          <h3 className="font-display font-black text-2xl mb-1">Reset Password 🔒</h3>
          <p className="text-muted text-sm">Enter your registered email below to receive the reset link</p>
        </div>

        {success ? (
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-5 text-center">
            <span className="text-3xl block mb-2">✉️</span>
            <h4 className="font-bold text-accent mb-1">Check your inbox</h4>
            <p className="text-xs text-muted leading-relaxed">
              We have sent a password reset link to <strong className="text-[#f0f0f5]">{email}</strong>. Please click the link to configure a new password.
            </p>
            <Link href="/auth/login" className="inline-block mt-4 text-xs font-semibold text-accent hover:underline">
              ← Back to Login
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              error={error}
            />
            <Button fullWidth loading={loading} onClick={onSubmit} size="lg">
              Send Reset Link →
            </Button>
            <div className="text-center mt-4">
              <Link href="/auth/login" className="text-xs text-muted hover:text-[#f0f0f5] hover:underline">
                ← Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
