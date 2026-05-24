/**
 * ConfirmDialog — Premium confirmation dialog with animated warning icon
 * (shake on danger), gradient buttons, and glassmorphism modal.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls dialog visibility
 * @param {Function} props.onClose - Callback to close the dialog
 * @param {Function} props.onConfirm - Callback when action is confirmed
 * @param {string} [props.title='Confirm Action'] - Dialog title
 * @param {string} props.message - Confirmation message body
 * @param {string} [props.confirmText='Confirm'] - Confirm button label
 * @param {boolean} [props.danger=false] - Enables danger styling (red)
 */
import Modal from './Modal';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  danger = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm Action'} size="sm">
      <div className="text-center space-y-5">
        {/* Animated icon */}
        <div
          className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center ${
            danger
              ? 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30'
              : 'bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30'
          }`}
          style={danger ? { animation: 'shake 0.5s ease-in-out' } : {}}
        >
          {danger ? (
            <AlertTriangle className="h-8 w-8 text-red-500" />
          ) : (
            <CheckCircle className="h-8 w-8 text-indigo-500" />
          )}
        </div>

        {/* Message */}
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-6 py-2.5 rounded-xl text-white font-medium text-sm transition-all duration-200 shadow-lg ${
              danger
                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-red-500/25'
                : 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-indigo-500/25'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
