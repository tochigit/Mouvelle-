'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, ShieldCheck, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewFormDialog({
  open,
  onOpenChange,
  productId,
  onReviewSubmitted,
}: ReviewFormDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);

  const handleVerifyPurchase = async () => {
    if (!email.trim()) return;

    try {
      const res = await fetch('/api/reviews/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), productId }),
      });

      if (res.ok) {
        const data = await res.json();
        setVerified(data.verified);
        if (data.verified) {
          toast.success('Purchase verified! Your review will be marked as verified.');
        }
      }
    } catch {
      // Silently ignore verification errors
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    if (!authorName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Enter the email address used for your order');
      return;
    }

    setSubmitting(true);
    try {
      // Verify purchase before submitting. The API repeats this check server-side.
      let isVerified = verified;
      if (verified === null) {
        try {
          const verifyRes = await fetch('/api/reviews/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), productId }),
          });
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            isVerified = verifyData.verified;
          }
        } catch {
          isVerified = false;
        }
      }

      if (isVerified !== true) {
        toast.error('Delivery confirmation required', {
          description: 'Reviews unlock after this product has been delivered and confirmed.',
        });
        return;
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          authorName: authorName.trim(),
          rating,
          comment: comment.trim(),
          email: email.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit review');
      }

      toast.success('Review submitted successfully!');
      setRating(0);
      setHoverRating(0);
      setAuthorName('');
      setEmail('');
      setComment('');
      setVerified(null);
      onOpenChange(false);
      onReviewSubmitted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setRating(0);
      setHoverRating(0);
      setAuthorName('');
      setEmail('');
      setComment('');
      setVerified(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Write a Review</DialogTitle>
          <DialogDescription>
            Reviews unlock after a customer has received and confirmed delivery of this product.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const starValue = i + 1;
                const isFilled = starValue <= (hoverRating || rating);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        isFilled
                          ? 'fill-[#D4AF37] text-[#D4AF37]'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                );
              })}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium text-[#D4AF37]">
                  {rating === 1 ? '1 Star' : `${rating} Stars`}
                </span>
              )}
            </div>
          </div>

          {/* Author Name */}
          <div className="space-y-2">
            <Label htmlFor="review-author">Your Name</Label>
            <Input
              id="review-author"
              placeholder="Enter your name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="focus-visible:border-[#D4AF37] focus-visible:ring-[#D4AF37]/20"
            />
          </div>

          {/* Email for Purchase Verification */}
          <div className="space-y-2">
            <Label htmlFor="review-email" className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Order Email
            </Label>
            <div className="flex gap-2">
              <Input
                id="review-email"
                type="email"
                placeholder="Enter the email used for your order"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setVerified(null);
                }}
                onBlur={() => {
                  if (email.trim() && email.includes('@')) {
                    handleVerifyPurchase();
                  }
                }}
                className="flex-1 focus-visible:border-[#D4AF37] focus-visible:ring-[#D4AF37]/20"
              />
              {email.trim() && email.includes('@') && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleVerifyPurchase}
                  className="shrink-0 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 h-10"
                >
                  Verify
                </Button>
              )}
            </div>
            {verified === true && (
              <div className="flex items-center gap-1.5 text-xs text-green-600">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Purchase verified — your review will show a &quot;Verified Purchase&quot; badge</span>
              </div>
            )}
            {verified === false && email.trim() && (
              <p className="text-xs text-muted-foreground">
                No confirmed delivery was found for this product. Reviews unlock after delivery confirmation.
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">
              Required. Use the same email address from your confirmed order.
            </p>
          </div>

          {/* Review Comment */}
          <div className="space-y-2">
            <Label htmlFor="review-comment">Your Review</Label>
            <Textarea
              id="review-comment"
              placeholder="Tell us what you think about this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="min-h-24 resize-none focus-visible:border-[#D4AF37] focus-visible:ring-[#D4AF37]/20"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#D4AF37] hover:bg-[#C0A030] text-primary-foreground font-semibold h-11"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
