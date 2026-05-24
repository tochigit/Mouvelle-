'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: 12,
  md: 16,
  lg: 20,
};

export default function StarRating({ rating, count, size = 'md' }: StarRatingProps) {
  const iconSize = SIZE_MAP[size];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className="fill-[#D4AF37] text-[#D4AF37]"
            style={{ width: iconSize, height: iconSize }}
          />
        ))}
        {/* Half star */}
        {hasHalf && (
          <div className="relative" style={{ width: iconSize, height: iconSize }}>
            <Star
              className="text-muted-foreground/30 absolute"
              style={{ width: iconSize, height: iconSize }}
            />
            <div className="overflow-hidden absolute" style={{ width: iconSize / 2, height: iconSize }}>
              <Star
                className="fill-[#D4AF37] text-[#D4AF37]"
                style={{ width: iconSize, height: iconSize }}
              />
            </div>
          </div>
        )}
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className="text-muted-foreground/30"
            style={{ width: iconSize, height: iconSize }}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-muted-foreground text-xs ml-0.5">
          ({count})
        </span>
      )}
    </div>
  );
}
