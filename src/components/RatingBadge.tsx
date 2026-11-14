import { Star } from 'lucide-react';

interface RatingBadgeProps {
  rating: number;
  count: number;
  className?: string;
}

function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(count);
}

export function RatingBadge({ rating, count, className = '' }: RatingBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded bg-white/95 px-2 py-0.5 text-xs font-bold text-[#282C3F] shadow-sm backdrop-blur-xs tabular-nums ${className}`}
      aria-label={`Rated ${rating.toFixed(1)} out of 5 based on ${count} reviews`}
    >
      <span>{rating.toFixed(1)}</span>
      <Star className="h-3 w-3 fill-[#03A685] text-[#03A685]" aria-hidden="true" />
      <span className="h-3 w-px bg-[#EAEAEC]" aria-hidden="true" />
      <span className="font-medium text-[#7E818C]">{formatCount(count)}</span>
    </div>
  );
}
