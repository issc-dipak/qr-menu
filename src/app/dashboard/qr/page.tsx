'use client';
import { useState, useEffect } from 'react';
import { Badge, KpiCard } from '@/components/ui/index';
import { Button } from '@/components/ui/Button';
import { useAuthStore, useAnalyticsStore } from '@/store';
import { useCopyLink } from '@/hooks';
import { cn } from '@/utils';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

const QRCodeSVG = dynamic(
  () => import('qrcode.react').then((mod) => mod.QRCodeSVG),
  { ssr: false, loading: () => <div className="w-[192px] h-[192px] bg-muted/20 animate-pulse rounded-lg" /> }
);

export default function QrPage() {
  const { owner } = useAuthStore();
  const { data } = useAnalyticsStore();
  const { handleCopy } = useCopyLink();
  const [appUrl, setAppUrl] = useState('');
  const [selectedTable, setSelectedTable] = useState<number>(0); // 0 = Main Menu, 1-4 = Table 1-4

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppUrl(window.location.origin);
    }
  }, []);

  const isBusiness = owner?.plan === 'business';
  const tableParam = selectedTable > 0 ? `?table=${selectedTable}` : '';
  const url = owner?.shop_slug ? `${appUrl}/menu/${owner.shop_slug}${tableParam}` : 'dukaanqr.in/menu/your-shop';

  if (!data) {
    return <div className="flex items-center justify-center min-h-[300px]">Loading QR code details...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-black text-2xl">My QR Code</h1>
        <p className="text-muted text-sm mt-1">Share this with your customers</p>
      </div>

      {/* Business Plan Multi-QR Selectors */}
      {isBusiness ? (
        <div className="card mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-accent-2 mb-3">
            📍 Table / Location QR Selector (Business Feature Unlocked)
          </p>
          <div className="flex flex-wrap gap-2">
            {['Main Menu', 'Table 1', 'Table 2', 'Table 3', 'Table 4'].map((label, idx) => (
              <button
                key={label}
                onClick={() => setSelectedTable(idx)}
                className={cn(
                  'px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer font-sans',
                  selectedTable === idx
                    ? 'bg-accent-2/10 border-accent-2 text-accent-2'
                    : 'bg-surface border-border text-muted hover:border-accent-2/30'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="card mb-6 border-accent/20 bg-accent/3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-accent mb-1">
                💡 Need separate QRs for different tables?
              </p>
              <p className="text-xs text-muted max-w-xl">
                Upgrade to the <strong>Business Plan</strong> to generate up to 5 unique table/location QR codes. Track scan locations automatically!
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => window.location.href = '/dashboard/billing'} className="w-full sm:w-auto border-accent text-accent hover:bg-accent/5">
              Upgrade to Business 🚀
            </Button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* QR Display */}
        <div className="card flex flex-col items-center text-center">
          <Badge variant={selectedTable > 0 ? "blue" : "green"} className="mb-4">
            ● {selectedTable > 0 ? `Table ${selectedTable} QR` : 'Main QR Active'}
          </Badge>

          {/* Real QR Code */}
          <div className="w-56 h-56 bg-white rounded-2xl flex items-center justify-center p-4 my-6 shadow-[0_0_60px_rgba(0,229,160,0.2)] relative">
            {owner?.shop_slug ? (
              <QRCodeSVG value={url} size={192} fgColor="#0c0d13" bgColor="#ffffff" includeMargin />
            ) : (
              <span className="text-[6rem]">⬛</span>
            )}
          </div>

          <p className="text-xs text-muted mb-1">Generated QR code URL</p>
          <p className="text-accent text-sm font-medium mb-6 break-all">{url}</p>

          <div className="flex gap-3 flex-wrap justify-center w-full">
            <Button size="sm" className="w-full sm:w-auto" onClick={() => toast.success('QR Downloaded! 🎉')}>⬇ Download PNG</Button>
            <Button variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => toast.success('PDF ready! 🖨️')}>🖨 Print PDF</Button>
            <Button variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => handleCopy(url)}>🔗 Copy Link</Button>
          </div>
        </div>

        {/* Stats & Share */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <KpiCard label="Total Scans"  value={data.totalScans.toLocaleString()} color="green" />
            <KpiCard label="Scans Today"  value={data.todayScans} color="blue" />
          </div>

          {/* Share Options */}
          <div className="card">
            <h3 className="font-display font-bold mb-4">Share Your Menu</h3>
            <div className="space-y-2">
              {[
                { icon: '📱', label: 'Share on WhatsApp', action: () => toast.success('Opening WhatsApp... 📱') },
                { icon: '📋', label: 'Copy Menu Link',    action: () => handleCopy(url) },
                { icon: '📸', label: 'Share on Instagram',action: () => toast.success('Link copied for Instagram!') },
                { icon: '🖨️', label: 'Download Table Tent',action: () => toast.success('Table tent downloading...') },
              ].map((s) => (
                <button
                   key={s.label}
                   onClick={s.action}
                   className="flex items-center gap-3 w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm hover:border-accent hover:bg-accent/5 transition-all text-left font-sans text-[#f0f0f5]"
                >
                  <span className="text-lg">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
            <p className="text-accent text-xs font-bold tracking-wider uppercase mb-2">💡 Pro Tip</p>
            <p className="text-muted text-sm leading-relaxed">
              Print your QR code at any print shop for just ₹10–20. Place it on your counter, table, or visiting card!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
