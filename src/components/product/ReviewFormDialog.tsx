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
import { Star } from 'lucide-react';
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
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          authorName: authorName.trim(),
          rating,
          comment: comment.trim(),
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
      setComment('');
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
      setComment('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with this product. Your review helps others make informed decisions.
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
