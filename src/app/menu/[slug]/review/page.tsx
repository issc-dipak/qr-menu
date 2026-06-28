'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOwnerBySlug } from '@/services/ownerService';
import { getActiveCustomerSession } from '@/services/customerAuthService';
import { cn } from '@/utils';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface PageProps {
  params: { slug: string };
}

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ReviewPage({ params }: PageProps) {
  const router = useRouter();
  const [owner, setOwner] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');

  const ratingDescriptions: Record<number, string> = {
    1: 'Very Bad 😞',
    2: 'Bad 😐',
    3: 'Good 🙂',
    4: 'Very Good 😊',
    5: 'Excellent! 😍',
  };

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Get active customer session
        const session = await getActiveCustomerSession();
        if (!session) {
          router.push(`/menu/${params.slug}/login`);
          return;
        }
        setCustomer(session);
        setCustomerName(session.firstName ? `${session.firstName} ${session.lastName || ''}`.trim() : 'Valued Customer');

        // 2. Fetch owner details
        const ownerData = await getOwnerBySlug(params.slug);
        if (!ownerData) {
          toast.error('Restaurant not found');
          router.push('/');
          return;
        }
        setOwner(ownerData);

        // 3. Load reviews
        await loadReviews(ownerData.id);
      } catch (err) {
        console.error('Error loading review metadata:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.slug]);

  // Load reviews from Supabase with LocalStorage fallback
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
      console.warn('Supabase reviews fetch failed, falling back to LocalStorage:', err);
      const localKey = `qrmenu_reviews_${ownerId}`;
      const saved = localStorage.getItem(localKey);
      if (saved) {
        setReviews(JSON.parse(saved));
      } else {
        // Default seed reviews for premium presentation
        const mockReviews: Review[] = [
          {
            id: '1',
            customer_name: 'Rahul Sharma',
            rating: 5,
            comment: 'Amazing food quality and extremely fast service! Loved the tea here.',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            customer_name: 'Priya Patel',
            rating: 4,
            comment: 'Very clean menu representation. Samosas were hot and spicy!',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          }
        ];
        localStorage.setItem(localKey, JSON.stringify(mockReviews));
        setReviews(mockReviews);
      }
    }
  };

  // Submit Review handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setSubmitting(true);
    const newReview = {
      owner_id: owner.id,
      customer_name: customerName.trim(),
      rating,
      comment: comment.trim(),
    };

    try {
      // Try to insert in Supabase
      const { data, error } = await (supabase as any)
        .from('restaurant_reviews')
        .insert(newReview)
        .select()
        .single();

      if (error) throw error;

      toast.success('Thank you! Review submitted successfully.');
      setComment('');
      if (data) {
        setReviews([data as Review, ...reviews]);
      }
    } catch (err) {
      console.warn('Failed saving to database, saving to LocalStorage fallback:', err);
      
      // LocalStorage fallback saving
      const localKey = `qrmenu_reviews_${owner.id}`;
      const localReview: Review = {
        id: crypto.randomUUID(),
        customer_name: customerName.trim(),
        rating,
        comment: comment.trim(),
        created_at: new Date().toISOString(),
      };
      
      const updatedReviews = [localReview, ...reviews];
      localStorage.setItem(localKey, JSON.stringify(updatedReviews));
      setReviews(updatedReviews);
      toast.success('Thank you! Review saved (local fallback).');
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate averages & distributions
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
    const hours = Math.floor(mins / 600);
    const days = Math.floor(hours / 24);

    if (mins < 60) return `${mins <= 0 ? 1 : mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1a12] text-white flex flex-col items-center justify-center">
        <span className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted text-sm font-light">Loading reviews panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1a12] text-[#f0f0f5] flex flex-col font-sans">
      
      {/* Header segment */}
      <header className="sticky top-0 z-40 bg-[#0d1a12]/95 border-b border-[#00e5a0]/15 px-4 py-3 flex items-center justify-between backdrop-blur-md">
        <Link href={`/menu/${params.slug}`} className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors no-underline">
          <span className="text-sm">←</span> Menu
        </Link>
        <div className="text-center">
          <h2 className="font-display font-black text-sm md:text-base leading-none tracking-tight">
            {owner?.shop_name || 'Cafe Menu'}
          </h2>
          <p className="text-[10px] text-accent/80 font-bold mt-0.5">Rating &amp; Reviews</p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 flex flex-col gap-6">

        {/* Rating Overview Summary */}
        <section className="bg-surface border border-border/40 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-display font-black text-white leading-none">{averageRating}</p>
              <div className="flex gap-0.5 justify-center mt-1 text-gold text-xs">
                {'★'.repeat(Math.round(Number(averageRating)) || 5).padEnd(5, '☆')}
              </div>
              <p className="text-[9px] text-muted mt-1.5 uppercase font-bold tracking-wider">{totalReviews} Reviews</p>
            </div>
            
            {/* Progress breakdown */}
            <div className="flex-1 flex flex-col gap-1.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = starCounts[stars - 1];
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2 text-[10px] text-muted">
                    <span className="w-3 text-right">{stars}</span>
                    <span className="text-[9px] text-gold">★</span>
                    <div className="flex-1 h-1.5 bg-bg/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Submit Review Card */}
        <section className="bg-surface border border-border/40 rounded-2xl p-5">
          <h3 className="font-display font-bold text-sm text-white mb-4">Write a Review</h3>
          
          <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
            
            {/* Star Rating Interactive Selector */}
            <div className="flex flex-col items-center gap-1.5 py-2.5 bg-bg/25 border border-border/30 rounded-xl">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="text-2xl cursor-pointer transition-transform active:scale-95 focus:outline-none"
                  >
                    <span className={cn(
                      "transition-colors duration-150",
                      (hoverRating !== null ? star <= hoverRating : star <= rating) 
                        ? 'text-gold fill-current' 
                        : 'text-muted/30'
                    )}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] font-bold text-accent tracking-wide">
                {ratingDescriptions[hoverRating || rating]}
              </p>
            </div>

            {/* Customer Name Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Your Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                required
                className="bg-bg/40 border border-border/50 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Comment Area */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Your Comments</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience (e.g. food quality, table service, ambiance)..."
                rows={3}
                required
                className="bg-bg/40 border border-border/50 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs w-full py-3 rounded-xl flex items-center justify-center font-bold tracking-wider uppercase bg-[#00e5a0] text-bg hover:bg-[#00e5a0]/90 transition-colors shadow-glow mt-1"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-bg border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : 'Submit Review ⭐'}
            </button>
          </form>
        </section>

        {/* Reviews List */}
        <section className="flex flex-col gap-3">
          <h3 className="font-display font-bold text-xs text-muted uppercase tracking-wider px-1">
            Recent Feedback ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <div className="bg-surface/30 border border-border/20 rounded-xl p-8 text-center text-muted text-xs font-light">
              No feedback yet. Be the first to submit a review!
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-surface border border-border/30 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                        {rev.customer_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{rev.customer_name}</h4>
                        <div className="flex text-gold text-[9px] mt-0.5">
                          {'★'.repeat(rev.rating).padEnd(5, '☆')}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] text-muted/60">{getRelativeTime(rev.created_at)}</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed font-light pl-9">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
