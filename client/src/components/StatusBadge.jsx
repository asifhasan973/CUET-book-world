/**
 * StatusBadge — Premium status indicator with pulsing dot,
 * gradient backgrounds, and subtle glow effects.
 *
 * @component
 * @param {Object} props
 * @param {string} props.status - One of: active, available, approved, returned,
 *   pending, overdue, rejected, suspended, completed
 */

/** Status color and style mappings */
const STATUS_CONFIG = {
  active:    { bg: 'bg-emerald-50 dark:bg-emerald-950/30',   text: 'text-emerald-700 dark:text-emerald-400',  dot: 'bg-emerald-500', glow: 'shadow-emerald-500/30' },
  available: { bg: 'bg-emerald-50 dark:bg-emerald-950/30',   text: 'text-emerald-700 dark:text-emerald-400',  dot: 'bg-emerald-500', glow: 'shadow-emerald-500/30' },
  approved:  { bg: 'bg-emerald-50 dark:bg-emerald-950/30',   text: 'text-emerald-700 dark:text-emerald-400',  dot: 'bg-emerald-500', glow: 'shadow-emerald-500/30' },
  returned:  { bg: 'bg-slate-100 dark:bg-slate-800',         text: 'text-slate-600 dark:text-slate-400',      dot: 'bg-slate-400',   glow: '' },
  pending:   { bg: 'bg-amber-50 dark:bg-amber-950/30',       text: 'text-amber-700 dark:text-amber-400',      dot: 'bg-amber-500',   glow: 'shadow-amber-500/30' },
  overdue:   { bg: 'bg-red-50 dark:bg-red-950/30',           text: 'text-red-700 dark:text-red-400',          dot: 'bg-red-500',     glow: 'shadow-red-500/30' },
  rejected:  { bg: 'bg-red-50 dark:bg-red-950/30',           text: 'text-red-700 dark:text-red-400',          dot: 'bg-red-500',     glow: 'shadow-red-500/30' },
  suspended: { bg: 'bg-red-50 dark:bg-red-950/30',           text: 'text-red-700 dark:text-red-400',          dot: 'bg-red-500',     glow: 'shadow-red-500/30' },
  completed: { bg: 'bg-indigo-50 dark:bg-indigo-950/30',     text: 'text-indigo-700 dark:text-indigo-400',    dot: 'bg-indigo-500',  glow: 'shadow-indigo-500/30' },
};

/** Fallback for unknown statuses */
const DEFAULT_CONFIG = STATUS_CONFIG.pending;

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || DEFAULT_CONFIG;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${config.bg} ${config.text}`}
      role="status"
    >
      {/* Pulsing indicator dot */}
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${config.dot}`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dot}`} />
      </span>
      {status}
    </span>
  );
};

export default StatusBadge;
