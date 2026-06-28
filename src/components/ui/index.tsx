'use client';
import { type ReactNode, useEffect } from 'react';
import { cn } from '@/utils';

// ─── CARD ─────────────────────────────────────────────────────
interface CardProps { children: ReactNode; className?: string; hover?: boolean; }

export function Card({ children, className, hover }: CardProps) {
  return (
    <div className={cn('card', hover && 'card-hover cursor-pointer', className)}>
      {children}
    </div>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  color?: 'green' | 'blue' | 'purple' | 'gold';
}

const colorBorderMap = {
  green:  'border-l-accent',
  blue:   'border-l-accent-2',
  purple: 'border-l-accent-3',
  gold:   'border-l-gold',
};

export function KpiCard({ label, value, trend, trendUp, color = 'green' }: KpiCardProps) {
  return (
    <div className={cn("card relative overflow-hidden pl-5 border-l-4", colorBorderMap[color])}>
      <p className="text-[11px] text-muted font-bold uppercase tracking-wider mb-2">{label}</p>
      <p className="font-display text-2xl sm:text-3xl font-bold leading-none text-white">{value}</p>
      {trend && (
        <p className={cn('text-[11px] mt-2 flex items-center gap-0.5 font-medium', trendUp ? 'text-accent' : 'text-danger')}>
          <span>{trendUp ? '↑' : '↓'}</span>
          <span>{trend}</span>
        </p>
      )}
    </div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────
type BadgeVariant = 'green' | 'blue' | 'purple' | 'muted' | 'red';

interface BadgeProps { children: ReactNode; variant?: BadgeVariant; className?: string; }

const badgeStyles: Record<BadgeVariant, string> = {
  green:  'bg-accent/10 text-accent border border-accent/20',
  blue:   'bg-accent-2/10 text-accent-2 border border-accent-2/20',
  purple: 'bg-accent-3/10 text-accent-3 border border-accent-3/20',
  muted:  'bg-muted/10 text-muted border border-border',
  red:    'bg-danger/10 text-danger border border-danger/20',
};

export function Badge({ children, variant = 'green', className }: BadgeProps) {
  return (
    <span className={cn('badge', badgeStyles[variant], className)}>
      {children}
    </span>
  );
}

// ─── MODAL ────────────────────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={cn('bg-surface border border-border rounded-card-lg w-full max-h-[90vh] overflow-y-auto animate-fade-up', sizeMap[size])}>
        <div className="flex items-center justify-between p-6 pb-4">
          <h3 className="font-display font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-[#f0f0f5] transition-colors text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}

// ─── TOGGLE ───────────────────────────────────────────────────
interface ToggleProps { checked: boolean; onChange: (v: boolean) => void; }

export function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-11 h-6 rounded-full border transition-all duration-300 cursor-pointer',
        checked ? 'bg-accent/20 border-accent' : 'bg-surface-2 border-border'
      )}
    >
      <span className={cn(
        'absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300',
        checked ? 'left-[22px] bg-accent' : 'left-0.5 bg-muted'
      )} />
    </button>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'rounded-lg bg-gradient-to-r from-surface via-surface-2 to-surface bg-[length:200%_100%] animate-shimmer',
      className
    )} />
  );
}

// ─── DIVIDER ──────────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="border-border my-4" />;
  return (
    <div className="flex items-center gap-3 my-4">
      <hr className="flex-1 border-border" />
      <span className="text-xs text-muted">{label}</span>
      <hr className="flex-1 border-border" />
    </div>
  );
}
