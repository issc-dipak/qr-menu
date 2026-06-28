'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function DashboardReviewsPage() {
  const { owner } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!owner?.id) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }

    async function loadData() {
      try {
        await loadReviews(owner!.id);
      } catch (err) {
        console.error('Failed to load dashboard owner reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [owner?.id]);

  const loadReviews = async (ownerId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('restaurant_reviews')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setReviews(data as Review[]);
      }
    } catch (err) {
      console.warn('Dashboard reviews query failed, loading from LocalStorage:', err);
      const localKey = `qrmenu_reviews_${ownerId}`;
      const saved = localStorage.getItem(localKey);
      if (saved) {
        setReviews(JSON.parse(saved));
      }
    }
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const triggerDeleteConfirm = (id: string) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDeleteReview = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setShowConfirm(false);
    setDeleteId(null);
    
    setDeletingId(id);
    const toastId = toast.loading('Deleting feedback...');

    try {
      // 1. Delete from Supabase
      const { error } = await (supabase as any)
        .from('restaurant_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Feedback deleted successfully!', { id: toastId });
      setReviews(reviews.filter((r) => r.id !== id));
    } catch (err) {
      console.warn('DB delete failed, updating LocalStorage fallback:', err);
      
      // LocalStorage delete fallback
      if (owner) {
        const localKey = `qrmenu_reviews_${owner.id}`;
        const updated = reviews.filter((r) => r.id !== id);
        localStorage.setItem(localKey, JSON.stringify(updated));
        setReviews(updated);
        toast.success('Feedback deleted (local update).', { id: toastId });
      }
    } finally {
      setDeletingId(null);
    }
  };

  // Calculations
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : '0.0';

  const starCounts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      starCounts[r.rating - 1]++;
    }
  });

  const getRelativeTime = (isoString: string) => {
    const elapsed = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(elapsed / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 60) return `${mins <= 0 ? 1 : mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted text-xs">Loading customer reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div>
        <h1 className="font-display font-black text-2xl text-white">Customer Reviews</h1>
        <p className="text-muted text-xs mt-1">Monitor and moderate feedback left by customers on your digital QR menu.</p>
      </div>

      {/* Overview stats & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Average score card */}
        <div className="bg-surface border border-border/60 rounded-xl p-5 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold tracking-wider uppercase text-muted">Average Rating</p>
          <p className="text-5xl font-display font-black text-white mt-2 leading-none">{averageRating}</p>
          <div className="flex gap-1 text-gold mt-3 text-sm">
            {'★'.repeat(Math.round(Number(averageRating)) || 5).padEnd(5, '☆')}
          </div>
          <p className="text-[10px] text-muted/60 mt-2">Based on {totalReviews} customer scans</p>
        </div>

        {/* Breakdown bar card */}
        <div className="bg-surface border border-border/60 rounded-xl p-5 md:col-span-2 flex flex-col justify-center gap-2.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = starCounts[stars - 1];
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs text-muted">
                <span className="w-3 font-semibold text-right">{stars}</span>
                <span className="text-gold text-xs">★</span>
                <div className="flex-1 h-2 bg-bg/60 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-500" 
                    style={{ width: `${pct}%`, backgroundColor: '#00e5a0' }}
                  />
                </div>
                <span className="w-8 text-right font-medium text-white/80">{count} ({pct.toFixed(0)}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews feed log */}
      <div className="bg-surface border border-border/60 rounded-xl p-5 space-y-4">
        <h3 className="font-display font-bold text-sm text-white">All Feedback Logs ({reviews.length})</h3>

        {reviews.length === 0 ? (
          <div className="text-center py-16 text-muted/30 border border-dashed border-border/40 rounded-xl">
            <span className="text-4xl block mb-2">⭐</span>
            <p className="text-sm font-medium">No reviews logged yet</p>
            <p className="text-xs mt-1">When customers submit feedback from your QR link, they will appear here in real-time.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {reviews.map((rev) => (
              <div key={rev.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                {/* Cute Avatar */}
                <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
                  {rev.customer_name.slice(0, 2).toUpperCase()}
                </div>
                
                {/* Details */}
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-white">{rev.customer_name}</h4>
                      <div className="flex text-gold text-[9px]">
                        {'★'.repeat(rev.rating).padEnd(5, '☆')}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted/50 flex-shrink-0">{getRelativeTime(rev.created_at)}</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed font-light">{rev.comment}</p>
                </div>

                {/* Moderate Delete button */}
                <button
                  onClick={() => triggerDeleteConfirm(rev.id)}
                  disabled={deletingId === rev.id}
                  className="p-1.5 rounded-lg border border-danger/25 text-danger bg-danger/5 hover:bg-danger/10 active:scale-95 transition-all cursor-pointer flex-shrink-0 disabled:opacity-50"
                  title="Delete Review"
                >
                  {deletingId === rev.id ? (
                    <span className="w-3.5 h-3.5 border-2 border-danger border-t-transparent rounded-full animate-spin block" />
                  ) : (
                    '🗑️'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all duration-300 animate-fade-in">
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleUp {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            .animate-fade-in {
              animation: fadeIn 0.2s ease-out forwards;
            }
            .animate-scale-up {
              animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>
          <div className="bg-surface/90 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-black/50 transform scale-95 transition-all duration-300 animate-scale-up">
            <div className="flex flex-col items-center text-center">
              {/* Warning Icon */}
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-4">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="font-display font-extrabold text-lg text-white mb-2">Delete Feedback?</h3>
              
              {/* Description */}
              <p className="text-xs text-muted leading-relaxed font-light mb-6">
                Are you sure you want to delete this customer feedback permanently? This action cannot be undone.
              </p>

              {/* Buttons */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setDeleteId(null);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteReview}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all text-xs font-semibold cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
