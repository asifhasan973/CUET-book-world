/**
 * BookCatalog — Premium book listing page with glowing search bar,
 * glassmorphism filter pills, staggered grid entrance, and 3D hover cards.
 *
 * @component
 * Features:
 * - Expanding focus animation on search input
 * - Smooth toggling, gradient-active category pills
 * - Staggered fade-up entrance for book cards
 * - 3D lift hover effect with glow shadow on cards
 * - Animated shimmer placeholder for missing covers
 * - "Unavailable" glass blur overlay
 */
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import API from '../api/axios';
import { Search, Filter, BookOpen } from 'lucide-react';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import StarRating from '../components/StarRating';
import { useStaggerReveal } from '../hooks/useScrollReveal';

const DEPARTMENTS = ['All', 'CSE', 'EEE', 'CE', 'ME', 'URP', 'ECE', 'MSE', 'PME', 'WRE', 'Architecture'];
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: '-rating', label: 'Highest Rated' },
  { value: 'title', label: 'Title (A-Z)' }
];

const BookCatalog = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('q') || '';

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const gridRef = useStaggerReveal({ staggerMs: 100, dependency: books });

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        // Increase limit so newly added demo books show up immediately.
        limit: 50,
        sort: sortBy
      });

      if (searchTerm) query.append('search', searchTerm);
      if (category !== 'All') query.append('department', category);
      query.append('ebook', 'false'); // Only show physical books in the catalog

      const res = await API.get(`/books?${query.toString()}`);
      setBooks(res.data.books);
      setTotalPages(res.data.totalPages);
      
      // Scroll to top on page change if not initial load
      if (page > 1) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 on new search/filter
      fetchBooks();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, category, sortBy, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      
      {/* ══════════════════════════════════════════
          PAGE HEADER & SEARCH
         ══════════════════════════════════════════ */}
      <div className="mb-10 text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Library <span className="gradient-text">Catalog</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Discover thousands of academic resources, textbooks, and reference materials.
        </p>

        {/* Search Bar - glowing focus effect */}
        <div className="relative max-w-2xl mx-auto mt-8 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm focus:shadow-indigo-500/20 text-lg"
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FILTERS & SORTING
         ══════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
        
        {/* Categories (Horizontal Scroll on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="flex items-center gap-2 flex-nowrap">
            {DEPARTMENTS.map(dept => (
              <button
                key={dept}
                onClick={() => setCategory(dept)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  category === dept
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20 transform scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BOOK GRID
         ══════════════════════════════════════════ */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <div key={n} className="rounded-2xl p-4 skeleton h-80" />
            ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState 
            title="No Books Found" 
            message={`We couldn't find any books matching "${searchTerm}" in the ${category} category.`} 
        />
      ) : (
        <>
            <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {books.map((book) => (
                    <BookCard key={book._id} book={book} />
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-12 flex justify-center">
                <Pagination 
                    currentPage={page} 
                    totalPages={totalPages} 
                    onPageChange={setPage} 
                />
            </div>
        </>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════ */

/**
 * BookCard — 3D hover effect card for book items
 */
const BookCard = ({ book }) => {
    const isAvailable = book.availableCopies > 0;

    return (
        <Link 
            to={`/books/${book._id}`} 
            className="reveal-child group glass-card rounded-2xl p-4 flex flex-col h-full hover-lift border border-slate-200/50 dark:border-slate-700/50 relative overflow-hidden"
        >
            {/* Tag / Badge */}
            <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 items-end">
                <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                    {book.department}
                </span>
            </div>

            {/* Cover Image Container */}
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/20 group-hover:shadow-lg transition-all duration-300">
                {book.coverImage ? (
                    <img 
                        src={book.coverImage} 
                        alt={book.title} 
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!isAvailable ? 'grayscale-[50%] brightness-75' : ''}`}
                        loading="lazy"
                        onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                    />
                ) : null}
                
                {/* Fallback Icon */}
                <div className={`${book.coverImage ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center`}>
                    <BookOpen className="h-12 w-12 text-indigo-300 dark:text-indigo-600 group-hover:scale-110 transition-transform duration-500" />
                </div>

                {/* Unavailable Overlay */}
                {!isAvailable && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg transform -rotate-12 outline outline-2 outline-white/20">
                            Borrowed
                        </span>
                    </div>
                )}
            </div>

            {/* Book Info */}
            <div className="flex flex-col flex-grow">
                <h3 className="font-bold text-slate-800 dark:text-white line-clamp-2 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {book.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-1 italic">
                    By {book.authors?.join(', ')}
                </p>
                
                <div className="mt-auto flex items-center justify-between">
                    <StarRating rating={book.rating || 0} size="sm" />
                    <p className={`text-xs font-bold ${isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                        {isAvailable ? `${book.availableCopies} left` : '0 left'}
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default BookCatalog;
