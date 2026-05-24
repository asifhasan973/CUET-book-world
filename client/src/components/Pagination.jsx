/**
 * Pagination — Premium pagination with gradient active state,
 * hover scale effect, and smooth transitions.
 *
 * @component
 * @param {Object} props
 * @param {number} props.currentPage - Currently active page (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback with new page number
 */
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Number of pages to show around the current page */
const PAGE_DELTA = 2;

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  /** Generate visible page numbers with ellipsis support */
  const getPages = () => {
    const pages = [];
    const start = Math.max(1, currentPage - PAGE_DELTA);
    const end = Math.min(totalPages, currentPage + PAGE_DELTA);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page numbers */}
      {getPages().map((page, idx) => (
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-400 text-sm">
            ···
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 hover-scale ${
              page === currentPage
                ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25'
                : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      ))}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};

export default Pagination;
