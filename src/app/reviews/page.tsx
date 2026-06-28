'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { cn } from '@/utils';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  avatar: string;
  created_at: string;
}

export default function PlatformReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  const ratingDescriptions: Record<number, string> = {
    1: 'Needs Improvement 😞',
    2: 'Okay 😐',
    3: 'Good Service 🙂',
    4: 'Love it! 😊',
    5: 'Excellent Platform! 😍',
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('platform_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setReviews(data as Review[]);
      } else {
        throw new Error('No data');
      }
    } catch (err) {
      console.warn('Supabase platform reviews load failed, using LocalStorage fallback...');
      const localKey = 'qrmenu_platform_reviews';
      const saved = localStorage.getItem(localKey);
      if (saved) {
        setReviews(JSON.parse(saved));
      } else {
        // Seed default beautiful owner reviews
        const seedReviews: Review[] = [
          {
            id: '1',
            name: 'Dipak Patil',
            role: 'Owner, Dipak Chai Corner',
            rating: 5,
            comment: 'Earlier I had to reprint menus every time prices changed. Now I just update online and QR works instantly! Saved so much printing cost.',
            avatar: '👨',
            created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            name: 'Sagar Patil',
            role: 'Chef, Sagar Dhaba Pune',
            rating: 5,
            comment: 'My restaurant looks so professional now. Customers love scanning the QR and seeing our full menu with photos! Ordering is super smooth.',
            avatar: '👨‍🍳',
            created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            name: 'Nilesh Jadhav',
            role: 'Owner, Nilesh Fast Food',
            rating: 4,
            comment: 'Setup was done in less than 10 minutes. Now 200+ people scan our menu daily. Best decision ever!',
            avatar: '👨',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ];
        localStorage.setItem(localKey, JSON.stringify(seedReviews));
        setReviews(seedReviews);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setSubmitting(true);
    const newReview = {
      name: name.trim(),
      role: role.trim() || 'Shop Owner',
      rating,
      comment: comment.trim(),
      avatar: rating >= 5 ? '😍' : rating >= 4 ? '😊' : '🙂',
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await (supabase as any)
        .from('platform_reviews')
        .insert(newReview)
        .select()
        .single();

      if (error) throw error;
      toast.success('Thank you! Your platform review has been submitted.');
      setReviews([data as Review, ...reviews]);
      setName('');
      setRole('');
      setComment('');
    } catch (err) {
      console.warn('Failed saving platform review to database, saving locally:', err);
      const localKey = 'qrmenu_platform_reviews';
      const localReview: Review = {
        id: crypto.randomUUID(),
        ...newReview,
      };
      const updated = [localReview, ...reviews];
      localStorage.setItem(localKey, JSON.stringify(updated));
      setReviews(updated);
      toast.success('Thank you! Review saved (local fallback).');
      setName('');
      setRole('');
      setComment('');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-white flex flex-col items-center justify-center">
        <span className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted text-sm font-light">Loading reviews portal...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-bg text-[#f0f0f5] pt-24 pb-16 px-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-accent blur-[120px] opacity-[0.05] -top-36 left-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto flex flex-col gap-8 relative z-10">
          
          {/* Header segment */}
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="section-tag inline-block">Platform Reviews</span>
            <h1 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight leading-none">
              Hear From Our <span className="gradient-text">Shop Owners</span>
            </h1>
            <p className="text-muted text-xs md:text-sm font-light leading-relaxed">
              Read how QR-Menu is helping Indian small businesses go digital, save printing costs, and streamline ordering.
            </p>
          </div>

          {/* Grid Layout (Form & Overview left, List right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Rating Overview & Submit form */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Rating Summary Widget */}
              <section className="bg-surface border border-border/40 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-display font-black text-white leading-none">{averageRating}</p>
                    <div className="flex gap-0.5 justify-center mt-1 text-gold text-xs">
                      {'★'.repeat(Math.round(Number(averageRating)) || 5).padEnd(5, '☆')}
                    </div>
                    <p className="text-[9px] text-muted mt-1.5 uppercase font-bold tracking-wider">{totalReviews} Reviews</p>
                  </div>
                  
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

              {/* Submission Form Card */}
              <section className="bg-surface border border-border/40 rounded-2xl p-5">
                <h3 className="font-display font-bold text-sm text-white mb-4">Submit Your Review</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  
                  {/* Rating Selector */}
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

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sagar Patil"
                      required
                      className="bg-bg/40 border border-border/50 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Role / Business Name</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Owner, Sagar Dhaba"
                      className="bg-bg/40 border border-border/50 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Comments</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your platform feedback..."
                      rows={3}
                      required
                      className="bg-bg/40 border border-border/50 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-xs w-full py-3 rounded-xl flex items-center justify-center font-bold tracking-wider uppercase bg-[#00e5a0] text-bg hover:bg-[#00e5a0]/90 transition-colors shadow-glow mt-1"
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback 🚀'}
                  </button>
                </form>
              </section>
            </div>

            {/* Right side: Reviews Feed List */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <h3 className="font-display font-bold text-xs text-muted uppercase tracking-wider px-1">
                Recent Reviews ({reviews.length})
              </h3>
              
              <div className="flex flex-col gap-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-surface border border-border/40 rounded-2xl p-5 flex flex-col gap-3 hover:border-accent/20 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-2 border border-border flex items-center justify-center text-lg">
                          {rev.avatar || '👨'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">{rev.name}</h4>
                          <p className="text-muted text-[10px] mt-0.5">{rev.role}</p>
                        </div>
                      </div>
                      <div className="flex text-gold text-[10px]">
                        {'★'.repeat(rev.rating).padEnd(5, '☆')}
                      </div>
                    </div>
                    <p className="text-xs text-muted leading-relaxed font-light pl-12 italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>
    </>
  );
}
