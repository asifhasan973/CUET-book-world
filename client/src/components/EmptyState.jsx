/**
 * EmptyState — Premium empty state component with floating animated icon,
 * gradient background orb, and subtle particle dots.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.title='Nothing here yet'] - Heading text
 * @param {string} [props.message='No data available.'] - Description text
 * @param {React.ReactNode} [props.icon] - Custom icon override
 * @param {React.ReactNode} [props.action] - Optional action button/link
 */
import { BookX } from 'lucide-react';

const EmptyState = ({
  title = 'Nothing here yet',
  message = 'No data available.',
  icon,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center relative" role="status">
    {/* Background orb */}
    <div className="absolute w-40 h-40 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50" />

    {/* Floating icon */}
    <div className="relative mb-6 animate-float">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/50 dark:to-violet-950/30 flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/30">
        {icon || <BookX className="h-10 w-10 text-indigo-400 dark:text-indigo-500" />}
      </div>
    </div>

    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">{message}</p>

    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
