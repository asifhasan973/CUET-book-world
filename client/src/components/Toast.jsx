/**
 * Toast — Premium notification toast system with slide+bounce entrance,
 * auto-dismiss progress bar, and gradient accent borders.
 *
 * @module Toast
 * @exports ToastProvider - Wrap your app to enable toasts
 * @exports useToast - Hook to trigger toasts: { addToast }
 *
 * @example
 * const { addToast } = useToast();
 * addToast('Book borrowed successfully!', 'success');
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

/** Hook to access the toast system */
export const useToast = () => useContext(ToastContext);

/** Default auto-dismiss duration in milliseconds */
const DEFAULT_DURATION = 4000;

/** Icon mapping for toast types */
const ICONS = {
  success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  error:   <AlertCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  info:    <Info className="h-5 w-5 text-indigo-500" />,
};

/** Style mapping for toast types */
const STYLES = {
  success: 'border-l-emerald-500 bg-white dark:bg-slate-800',
  error:   'border-l-red-500 bg-white dark:bg-slate-800',
  warning: 'border-l-amber-500 bg-white dark:bg-slate-800',
  info:    'border-l-indigo-500 bg-white dark:bg-slate-800',
};

/** Progress bar color mapping */
const PROGRESS_COLORS = {
  success: 'bg-emerald-500',
  error:   'bg-red-500',
  warning: 'bg-amber-500',
  info:    'bg-indigo-500',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = DEFAULT_DURATION) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-[100] space-y-3 max-w-sm" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-enter relative flex items-start gap-3 px-4 py-3 rounded-xl border-l-4 shadow-xl ${STYLES[toast.type]} overflow-hidden`}
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">{ICONS[toast.type]}</div>

            {/* Message */}
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1 pr-6">
              {toast.message}
            </p>

            {/* Close button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Auto-dismiss progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-700">
              <div
                className={`h-full ${PROGRESS_COLORS[toast.type]} toast-progress`}
                style={{ '--duration': `${toast.duration}ms` }}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
