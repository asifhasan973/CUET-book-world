/**
 * BookDetail — Premium single book view with parallax cover,
 * staggered text reveal, glowing borrow button, and animated review cards.
 *
 * @component
 * Features:
 * - Parallax scroll effect on the main cover image
 * - Staggered fade-up reveal for book metadata
 * - Animated cascade fill for user ratings
 * - Gradient pulse CTA for the borrow action
 * - Glassmorphism review cards with staggered entrance
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { BookOpen, User, Hash, Tag, Building, Star, Calendar, ArrowLeft, MessageSquare, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Spinner from '../components/Spinner';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import useScrollReveal, { useStaggerReveal } from '../hooks/useScrollReveal';

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, dbUser } = useAuth();
    const { addToast } = useToast();

    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
    const [borrowing, setBorrowing] = useState(false);
    
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [submittingReview, setSubmittingReview] = useState(false);

    const infoRef = useStaggerReveal({ staggerMs: 150, dependency: book });
    const reviewsRef = useStaggerReveal({ staggerMs: 100, dependency: book });
    const headerReveal = useScrollReveal({ dependency: book });

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const response = await API.get(`/books/${id}`);
                setBook(response.data.book);
                setReviews(response.data.reviews || []);
            } catch (error) {
                addToast('Failed to load book details.', 'error');
                navigate('/books');
            } finally {
                setLoading(false);
            }
        };
        fetchBookDetails();
        window.scrollTo(0, 0);
    }, [id, navigate, addToast]);

    const handleBorrowRequest = async () => {
        if (!user) {
            addToast('Please login to borrow books.', 'warning');
            navigate('/auth');
            return;
        }

        if (dbUser?.role !== 'student') {
            addToast('Only students can borrow books.', 'warning');
            setIsBorrowModalOpen(false);
            return;
        }

        setBorrowing(true);
        try {
            await API.post('/borrows', { bookId: id });
            addToast('Borrow request placed successfully! Please collect from library.', 'success');
            setIsBorrowModalOpen(false);
            const res = await API.get(`/books/${id}`);
            setBook(res.data.book);
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to place borrow request', 'error');
        } finally {
            setBorrowing(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            addToast('Please login to review.', 'warning');
            return;
        }
        
        setSubmittingReview(true);
        try {
            const res = await API.post(`/books/${id}/review`, {
                rating: reviewRating,
                comment: reviewText
            });
            setReviews([res.data.review, ...reviews]);
            setReviewText('');
            setReviewRating(5);
            addToast('Review submitted successfully!', 'success');
            
            const bookRes = await API.get(`/books/${id}`);
            setBook(bookRes.data.book);
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to submit review', 'error');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
            <Spinner size="lg" label="Loading book details..." />
        </div>
    );

    if (!book) return null;

    const isAvailable = book.availableCopies > 0;

    return (
        <div className="page-enter pb-16">
            {/* ══════════════════════════════════════════
                HERO SECTION — Parallax Cover + Metadata
               ══════════════════════════════════════════ */}
            <div className="bg-slate-50 dark:bg-[#0a0e1a] border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
                    
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors group text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Catalog
                    </button>

                    <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
                        {/* Left Column: Image (Sticky) */}
                        <div className="md:w-1/3 lg:w-1/4">
                            <div className="sticky top-24">
                                <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden glass-card shadow-2xl relative mb-6 group">
                                    {book.coverImage ? (
                                        <img 
                                            src={book.coverImage} 
                                            alt={book.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                if (e.currentTarget.nextElementSibling) {
                                                    e.currentTarget.nextElementSibling.style.display = 'flex';
                                                }
                                            }}
                                        />
                                    ) : null}
                                    <div className={`${book.coverImage ? 'hidden' : 'flex'} absolute inset-0 flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20`}>
                                        <BookOpen className="h-16 w-16 text-indigo-300 dark:text-indigo-700/50 mb-2" />
                                        <span className="text-sm font-bold text-indigo-400/50 uppercase tracking-widest">{book.department}</span>
                                    </div>
                                    {!isAvailable && (
                                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                            <span className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transform -rotate-12 outline outline-2 outline-white/20">
                                                Currently Borrowed
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                {!book.isEbook ? (
                                    <>
                                        <button
                                            onClick={() => setIsBorrowModalOpen(true)}
                                            disabled={!isAvailable}
                                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-xl ${
                                                isAvailable 
                                                    ? 'btn-primary btn-shimmer group' 
                                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                                            }`}
                                        >
                                            <BookOpen className={`h-5 w-5 ${isAvailable ? 'group-hover:animate-bounce-subtle' : ''}`} />
                                            {isAvailable ? 'Request to Borrow' : 'Not Available'}
                                        </button>
                                        {isAvailable && (
                                            <p className="text-center text-xs text-indigo-600 dark:text-indigo-400 mt-3 font-semibold">
                                                ⚡ Only {book.availableCopies} copies left!
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="w-full py-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold flex items-center justify-center gap-2 text-sm border border-emerald-200 dark:border-emerald-800/50">
                                            <BookOpen className="h-4 w-4" /> Digital E-Book
                                        </div>
                                        {book.ebookLink && (
                                            <a
                                                href={book.ebookLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white hover:scale-[1.02]"
                                            >
                                                Open PDF Externally <ArrowLeft className="h-5 w-5 rotate-135" style={{transform: "rotate(135deg)"}} />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="md:w-2/3 lg:w-3/4 flex flex-col" ref={infoRef}>
                            <div className="reveal-child">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm font-bold uppercase tracking-wider mb-4 border border-indigo-100 dark:border-indigo-800/50">
                                    <Building className="h-4 w-4" />
                                    {book.department}
                                </div>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 dark:text-white leading-tight mb-4">
                                    {book.title}
                                </h1>
                            </div>
                            
                            <div className="reveal-child flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-300 mb-8 border-b border-slate-200 dark:border-slate-800 pb-8">
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <span className="font-medium text-sm">{book.authors?.join(', ')}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
                                    <StarRating rating={book.rating || 0} size="sm" />
                                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400 ml-1">
                                        {book.rating ? book.rating.toFixed(1) : 'No stats'}
                                    </span>
                                </div>
                            </div>

                            <div className="reveal-child mb-8">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full inline-block" />
                                    Description
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                                    {book.description || 'No description available for this book.'}
                                </p>
                            </div>

                            <div className="reveal-child grid grid-cols-2 md:grid-cols-4 gap-4">
                                <DetailBox icon={Tag} label="ISBN" value={book.isbn} />
                                <DetailBox icon={Building} label="Publisher" value={book.publisher} />
                                <DetailBox icon={Calendar} label="Published" value={book.publishedYear} />
                                <DetailBox icon={Hash} label="Copies" value={`${book.availableCopies} available / ${book.totalCopies} total`} />
                            </div>

                            {/* E-Book PDF Viewer */}
                            {book.isEbook && (
                                <div className="reveal-child mt-10 w-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl p-2">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2 p-2 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-emerald-500" />
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Web PDF Viewer</span>
                                        </div>
                                        {book.ebookLink && (
                                            <a
                                                href={normalizeEbookLink(book.ebookLink, true)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800"
                                            >
                                                Open PDF in new tab
                                            </a>
                                        )}
                                    </div>
                                    <div className="w-full aspect-[4/3] md:aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-black flex items-center justify-center">
                                        {book.ebookLink ? (
                                            <iframe 
                                                src={normalizeEbookLink(book.ebookLink, false)} 
                                                title="PDF Viewer" 
                                                className="w-full h-full border-0"
                                                allow="autoplay"
                                            ></iframe>
                                        ) : (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 px-4 text-center">
                                                PDF link is not configured for this e-book. Please contact the librarian.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
                REVIEWS SECTION — Glass Cards
               ══════════════════════════════════════════ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-8" ref={headerReveal}>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <MessageSquare className="h-6 w-6 text-indigo-500" />
                        Student Reviews
                    </h2>
                    <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400">
                        {reviews.length} Reviews
                    </span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Write Review Card */}
                    {user && dbUser?.role === 'student' && (
                        <div className="glass-card rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/30 lg:col-span-1 shadow-lg shadow-indigo-500/5">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Write a Review</h3>
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Rating</label>
                                    <StarRating 
                                        rating={reviewRating} 
                                        onChange={setReviewRating} 
                                        interactive={true} 
                                        size="lg" 
                                    />
                                </div>
                                <div>
                                    <textarea
                                        required
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        rows="4"
                                        placeholder="Share your thoughts about this book..."
                                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="w-full btn-primary py-2.5 rounded-xl font-semibold text-sm transition-all"
                                >
                                    {submittingReview ? 'Submitting...' : 'Post Review'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Review List */}
                    <div className={`space-y-4 ${user && dbUser?.role === 'student' ? 'lg:col-span-2' : 'lg:col-span-3'} ${!user || dbUser?.role !== 'student' ? 'md:col-span-2' : ''}`} ref={reviewsRef}>
                        {reviews.length === 0 ? (
                            <div className="glass-card rounded-2xl p-10 text-center h-full flex flex-col justify-center">
                                <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-500 dark:text-slate-400">No reviews yet. Be the first to review!</p>
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review._id} className="reveal-child bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                                                {review.userName?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white">
                                                    {review.userName || 'Anonymous User'}
                                                </p>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <StarRating rating={review.rating} size="sm" />
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        {review.comment}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
                MODALS
               ══════════════════════════════════════════ */}
            <Modal 
                isOpen={isBorrowModalOpen} 
                onClose={() => setIsBorrowModalOpen(false)} 
                title="Confirm Borrow"
                size="sm"
            >
                <div className="text-center space-y-5">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50">
                        <BookOpen className="h-8 w-8 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">You are requesting to borrow:</p>
                        <p className="font-bold text-slate-800 dark:text-white text-lg">{book.title}</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
                        <div className="flex items-start gap-2 text-left">
                            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800 dark:text-amber-400">
                                <strong>Note:</strong> Once requested, you must collect the physical book from the library counter within 24 hours to finalize the borrow.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-center pt-2">
                        <button
                            onClick={() => setIsBorrowModalOpen(false)}
                            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBorrowRequest}
                            disabled={borrowing}
                            className="btn-primary px-6 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50"
                        >
                            {borrowing ? 'Processing...' : 'Confirm Request'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

/** Normalize various ebook link formats into an embeddable / openable URL */
const normalizeEbookLink = (rawLink, forExternalOpen = false) => {
    if (!rawLink) return '';
    let link = rawLink.trim();

    // Google Drive share links
    if (link.includes('drive.google.com')) {
        // Handle /file/d/FILE_ID/view?usp=sharing
        const fileIdMatch = link.match(/\/file\/d\/([^/]+)\//);
        if (fileIdMatch && fileIdMatch[1]) {
            const id = fileIdMatch[1];
            return forExternalOpen
                ? `https://drive.google.com/uc?export=download&id=${id}`
                : `https://drive.google.com/file/d/${id}/preview`;
        }

        // Handle open?id=FILE_ID
        const openIdMatch = link.match(/[?&]id=([^&]+)/);
        if (openIdMatch && openIdMatch[1]) {
            const id = openIdMatch[1];
            return forExternalOpen
                ? `https://drive.google.com/uc?export=download&id=${id}`
                : `https://drive.google.com/file/d/${id}/preview`;
        }

        // Fallback: just force /preview for embed
        if (!forExternalOpen) {
            return link.replace('/view', '/preview');
        }
        return link;
    }

    // If it's already clearly a PDF or other host, just return as-is
    return link;
};

/** Reusable detail box for book metadata */
const DetailBox = ({ icon: Icon, label, value }) => (
    <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col items-center text-center justify-center">
        <Icon className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mb-2 opacity-80" />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</span>
        <span className="text-sm font-bold text-slate-800 dark:text-white">{value || 'N/A'}</span>
    </div>
);

export default BookDetail;
