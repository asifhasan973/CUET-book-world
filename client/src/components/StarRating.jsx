/**
 * StarRating — Animated star rating component with sequential
 * cascade fill on hover and glow effect on selected stars.
 *
 * @component
 * @param {Object} props
 * @param {number} props.rating - Current rating value (1-5)
 * @param {Function} [props.onChange] - Callback when rating changes (interactive mode)
 * @param {boolean} [props.interactive=false] - Enable click-to-rate
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Star size variant
 */
import { Star } from 'lucide-react';
import { useState } from 'react';

const SIZE_MAP = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

/** Total number of stars to display */
const MAX_STARS = 5;

const StarRating = ({ rating, onChange, interactive = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label={`Rating: ${rating} out of ${MAX_STARS}`}>
      {Array.from({ length: MAX_STARS }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= displayRating;

        return (
          <button
            key={starValue}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`transition-all duration-200 ${
              interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'
            }`}
            style={{ transitionDelay: interactive ? `${i * 30}ms` : '0ms' }}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <Star
              className={`${SIZE_MAP[size]} transition-all duration-200 ${
                isFilled
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
