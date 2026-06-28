'use client';
import { useState, useRef, useEffect } from 'react';
import { useLangStore } from '@/store';
import { LANGUAGES } from '@/i18n/translations';
import type { LangCode } from '@/i18n/translations';
import { cn } from '@/utils';

interface LanguageSwitcherProps {
  mode: 'owner' | 'customer';
  /** visual style — 'compact' for sidebar, 'pill' for customer navbar */
  variant?: 'compact' | 'pill';
  primaryColor?: string;
  onAfterChange?: () => void;
}

export function LanguageSwitcher({
  mode,
  variant = 'compact',
  primaryColor = '#00e5a0',
  onAfterChange,
}: LanguageSwitcherProps) {
  const { ownerLang, customerLang, setOwnerLang, setCustomerLang } = useLangStore();
  const activeLang: LangCode = mode === 'owner' ? ownerLang : customerLang;
  const setLang = mode === 'owner' ? setOwnerLang : setCustomerLang;

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const active = LANGUAGES.find((l) => l.code === activeLang) ?? LANGUAGES[0];

  const handleSelect = (code: LangCode) => {
    setLang(code);
    setOpen(false);
    onAfterChange?.();
  };

  if (variant === 'pill') {
    // Customer navbar style — small globe button with dropdown
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          title="Switch Language / भाषा बदलें"
          className="flex items-center gap-1 text-[9px] sm:text-xs font-semibold px-1.5 py-0.5 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg border transition-all cursor-pointer font-sans select-none"
          style={{
            backgroundColor: `${primaryColor}12`,
            borderColor: `${primaryColor}30`,
            color: primaryColor,
          }}
        >
          <span className="text-base leading-none">🌐</span>
          <span className="hidden sm:inline">{active.nativeLabel}</span>
          <svg
            className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div
            className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-[#1f1f23] bg-[#111114] overflow-hidden shadow-2xl z-[200]"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer border-none text-left font-sans',
                  activeLang === lang.code
                    ? 'text-white'
                    : 'text-[#8e8ea8] hover:text-white hover:bg-white/5'
                )}
                style={
                  activeLang === lang.code
                    ? { backgroundColor: `${primaryColor}12`, color: primaryColor }
                    : { backgroundColor: 'transparent' }
                }
              >
                <span>{lang.nativeLabel}</span>
                {activeLang === lang.code && (
                  <span className="ml-auto text-[10px]" style={{ color: primaryColor }}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // compact — for owner sidebar footer
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Switch Language"
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer border-none font-sans text-left',
          open ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-white/4 hover:text-[#f0f0f5]'
        )}
      >
        <span className="text-base leading-none">🌐</span>
        <span>{active.nativeLabel}</span>
        <svg
          className={`w-3 h-3 ml-auto transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-48 rounded-xl bg-surface border border-border shadow-2xl overflow-hidden z-[200]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-all cursor-pointer border-none text-left',
                activeLang === lang.code
                  ? 'bg-accent/10 text-accent font-bold'
                  : 'text-muted hover:bg-white/4 hover:text-[#f0f0f5] bg-transparent'
              )}
            >
              <span>{lang.nativeLabel}</span>
              <span className="text-xs text-muted/60 ml-1">({lang.label})</span>
              {activeLang === lang.code && <span className="ml-auto text-accent text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
