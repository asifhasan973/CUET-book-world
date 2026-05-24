/**
 * Spinner — Premium loading indicator with animated book icon
 * and gradient ring spinner.
 *
 * @component
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Spinner size variant
 * @param {string} [props.label] - Optional loading text to display
 */
import { BookOpen } from 'lucide-react';

const SIZE_MAP = {
  sm: { ring: 'h-6 w-6',  icon: 'h-3 w-3',  text: 'text-xs',  gap: 'py-6' },
  md: { ring: 'h-10 w-10', icon: 'h-5 w-5',  text: 'text-sm',  gap: 'py-12' },
  lg: { ring: 'h-14 w-14', icon: 'h-7 w-7',  text: 'text-base', gap: 'py-16' },
};

const Spinner = ({ size = 'md', label = 'Loading...' }) => {
  const s = SIZE_MAP[size];

  return (
    <div className={`flex flex-col items-center justify-center ${s.gap} gap-4`} role="status" aria-label="Loading">
      {/* Gradient ring spinner with book icon */}
      <div className="relative">
        <div
          className={`${s.ring} rounded-full border-[3px] border-slate-200 dark:border-slate-700 border-t-indigo-500 dark:border-t-indigo-400 animate-spin`}
          style={{ borderTopColor: 'transparent', background: `conic-gradient(from 0deg, transparent 0%, transparent 70%, rgba(99,102,241,0.3) 100%)`, borderRadius: '50%', borderWidth: '3px', borderStyle: 'solid', borderColor: 'rgba(99,102,241,0.15)', borderTopColor: '#6366f1' }}
        />
        <BookOpen className={`${s.icon} text-indigo-500 dark:text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse`} />
      </div>

      {/* Loading text */}
      {label && (
        <p className={`${s.text} font-medium text-slate-400 dark:text-slate-500 animate-pulse`}>
          {label}
        </p>
      )}
    </div>
  );
};

export default Spinner;
