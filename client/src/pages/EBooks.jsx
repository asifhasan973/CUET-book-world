/**
 * EBooks — Premium digital library listing with gradient overlays,
 * hover action reveals, and animated download counts.
 *
 * @component
 * Features:
 * - Glassmorphism category pills with smooth active states
 * - Gradient image overlays on hover showing action CTA
 * - Animated shimmer placeholder for missing covers
 * - Staggered fade-up grid entrance
 */
import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Link } from 'react-router-dom';
import { Download, Search, BookOpen, AlertCircle, FileText } from 'lucide-react';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { useStaggerReveal } from '../hooks/useScrollReveal';

const DEPARTMENTS = ['All', 'CSE', 'EEE', 'CE', 'ME', 'URP', 'ECE', 'MSE', 'PME', 'WRE', 'Architecture'];

const EBooks = () => {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');

  const gridRef = useStaggerReveal({ staggerMs: 100, dependency: ebooks });

  useEffect(() => {
    const fetchEbooks = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (searchTerm) query.append('search', searchTerm);
        if (category !== 'All') query.append('department', category);
        query.append('ebook', 'true'); // Filter for ebooks via books route
        // Ensure newly added ebooks aren't hidden by backend default limit.
        query.append('page', '1');
        query.append('limit', '50');
        
        const res = await API.get(`/books?${query.toString()}`);
        setEbooks(res.data.books);
      } catch (error) {
        console.error("Error fetching E-Books:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchEbooks, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, category]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      
      {/* ══════════════════════════════════════════
          HEADER & SEARCH 
         ══════════════════════════════════════════ */}
      <div className="mb-10 text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Digital <span className="gradient-text">E-Library</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Read course materials and research papers instantly. Free for CUET students.
        </p>

        {/* Glowing Search Bar */}
        <div className="relative max-w-2xl mx-auto mt-8 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search e-books by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm focus:shadow-emerald-500/20 text-lg"
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FILTERS
         ══════════════════════════════════════════ */}
      <div className="mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {DEPARTMENTS.map(dept => (
            <button
              key={dept}
              onClick={() => setCategory(dept)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                category === dept
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 transform scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          E-BOOK GRID
         ══════════════════════════════════════════ */}
      {loading ? (
        <div className="flex justify-center py-20">
            <Spinner size="lg" label="Loading digital library..." />
        </div>
      ) : ebooks.length === 0 ? (
        <EmptyState 
            title="No E-Books Found" 
            message="Try adjusting your search terms or category filter."
            icon={<AlertCircle className="h-10 w-10 text-slate-400" />}
        />
      ) : (
        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {ebooks.map((ebook) => (
            <div 
                key={ebook._id} 
                className="reveal-child group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 hover-lift flex flex-col"
            >
              {/* Cover Image Container */}
              <div className="aspect-[3/4] w-full bg-slate-100 dark:bg-slate-900 relative">
                {ebook.coverImage ? (
                  <img 
                    src={ebook.coverImage} 
                    alt={ebook.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className={`${ebook.coverImage ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30`}>
                    <BookOpen className="h-10 w-10 text-emerald-400/50" />
                </div>
                
                {/* File Type Badge */}
                <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 uppercase">
                    <FileText className="h-3 w-3" /> PDF
                </div>

                {/* Hover Overlay with CTA */}
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4">
                    <Link 
                        to={`/books/${ebook._id}`}
                        className="btn-accent btn-shimmer px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-center"
                    >
                        View Details
                    </Link>
                </div>
              </div>

              {/* E-Book Info */}
              <div className="p-4 flex-grow flex flex-col">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider mb-1">
                    {ebook.department}
                </span>
                <h3 className="font-bold text-slate-800 dark:text-white line-clamp-2 text-sm mb-1 group-hover:text-emerald-600 transition-colors">
                  {ebook.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-auto flex items-center gap-1 font-medium">
                    <Download className="h-3 w-3" /> {ebook.viewCount || 0} views
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EBooks;
