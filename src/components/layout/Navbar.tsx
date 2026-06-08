'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { cn } from '@/utils';

export function Navbar() {
  const { isAuthenticated } = useAuthStore();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 md:px-10 py-3.5 bg-bg/90 backdrop-blur-2xl border-b border-border">
      <Link href="/" className="flex items-center gap-2 font-display font-black text-lg text-[#f0f0f5] no-underline">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center text-sm flex-shrink-0">🔳</span>
        QR-Menu
      </Link>

      {/* Desktop links */}
      <ul className="hidden md:flex items-center gap-6 list-none">
        {[
          ['/#how','How It Works'],
          ['/#features','Features'],
          ['/#pricing','Pricing']
        ].map(([href,label])=>(
          <li key={href}>
            <Link href={href} className="text-muted text-sm font-medium hover:text-[#f0f0f5] transition-colors cursor-pointer no-underline">
              {label}
            </Link>
          </li>
        ))}
        <li>
          {isAuthenticated
            ? <Link href="/dashboard/overview" className="btn-primary text-sm no-underline">Dashboard →</Link>
            : <Link href="/auth/login" className="btn-primary text-sm no-underline">Get Started Free →</Link>
          }
        </li>
      </ul>

      {/* Mobile hamburger */}
      <button onClick={() => setOpen(!open)} className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer border-none bg-transparent" aria-label="Menu">
        <span className={cn('w-5 h-0.5 bg-[#f0f0f5] transition-all', open && 'rotate-45 translate-y-2')} />
        <span className={cn('w-5 h-0.5 bg-[#f0f0f5] transition-all', open && 'opacity-0')} />
        <span className={cn('w-5 h-0.5 bg-[#f0f0f5] transition-all', open && '-rotate-45 -translate-y-2')} />
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-bg border-b border-border px-4 py-4 flex flex-col gap-3">
          {[
            ['/#how','How It Works'],
            ['/#features','Features'],
            ['/#pricing','Pricing']
          ].map(([href,label])=>(
            <Link key={href} href={href} onClick={()=>setOpen(false)} className="text-muted text-sm font-medium py-2 border-b border-border/50 cursor-pointer no-underline">
              {label}
            </Link>
          ))}
          {isAuthenticated
            ? <Link href="/dashboard/overview" className="btn-primary text-sm no-underline w-full justify-center mt-1">Dashboard →</Link>
            : <Link href="/auth/login" className="btn-primary text-sm no-underline w-full justify-center mt-1">Get Started Free →</Link>
          }
        </div>
      )}
    </nav>
  );
}
