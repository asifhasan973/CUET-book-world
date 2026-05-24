/**
 * StudentDashboard — Premium student portal with animated welcome banner,
 * staggered stat cards, glowing action cards, and responsive data tables.
 *
 * @component
 * Features:
 * - Gradient welcome banner with background shapes
 * - Staggered count-up stat cards
 * - Hover-lift quick action cards with gradient icons
 * - Active borrows table with hover-glow rows
 * - Animated step progress for active renewals
 * - Skeleton loaders for data fetching states
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { BookOpen, Clock, Calendar, Search, Bell, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';
import { useStaggerReveal } from '../hooks/useScrollReveal';
import useAnimatedCounter from '../hooks/useAnimatedCounter';

const StudentDashboard = () => {
    const { user, dbUser } = useAuth();
    const [borrows, setBorrows] = useState([]);
    const [renewals, setRenewals] = useState([]);
    const [stats, setStats] = useState({ active: 0, returned: 0, overdue: 0 });
    const [loading, setLoading] = useState(true);

    const cardsRef = useStaggerReveal({ staggerMs: 150, dependency: !loading });
    const actionsRef = useStaggerReveal({ staggerMs: 100, dependency: !loading });

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Fetch active borrows
                const borrowsRes = await API.get('/borrows/my');
                const activeBorrows = borrowsRes.data.filter(b => b.status === 'active' || b.status === 'overdue' || b.status === 'pending');
                setBorrows(activeBorrows);

                const returnedCount = borrowsRes.data.filter(b => b.status === 'returned').length;
                const overdueCount = activeBorrows.filter(b => b.status === 'overdue').length;

                setStats({
                    active: activeBorrows.length,
                    returned: returnedCount,
                    overdue: overdueCount,
                });

                // Fetch active renewals
                const renewalsRes = await API.get('/renewals/my');
                const activeRenewals = renewalsRes.data.filter(r => r.status === 'pending' || r.status === 'meeting_scheduled');
                setRenewals(activeRenewals);

            } catch (error) {
                console.error("Dashboard data fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
                <div className="h-40 rounded-2xl skeleton" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl skeleton" />)}
                </div>
                <div className="h-64 rounded-2xl skeleton" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 page-enter">
            
            {/* ══════════════════════════════════════════
                WELCOME BANNER — Gradient with Shapes
               ══════════════════════════════════════════ */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white p-8 sm:p-10 shadow-lg border border-indigo-500/30">
                {/* Background Shapes */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-amber-400/20 rounded-full blur-2xl" />
                
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium border border-white/20 mb-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute" />
                            <span className="w-2 h-2 rounded-full bg-amber-400 relative" />
                            Student Portal
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Welcome back, {dbUser?.name?.split(' ')[0] || 'Student'}! 👋
                        </h1>
                        <p className="text-indigo-100 max-w-xl text-lg">
                            Ready to dive into your next great read? Manage your library activity here.
                        </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                        <Link 
                            to="/books" 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all hover-scale shadow-lg"
                        >
                            <Search className="h-5 w-5" />
                            Find Books
                        </Link>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
                STATS GRID — Staggered Counter Cards
               ══════════════════════════════════════════ */}
            <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Active Borrows" 
                    value={stats.active} 
                    icon={BookOpen} 
                    color="indigo" 
                    link="/profile?tab=borrows"
                />
                <StatCard 
                    title="Books Returned" 
                    value={stats.returned} 
                    icon={Calendar} 
                    color="emerald" 
                    link="/profile?tab=history"
                />
                <StatCard 
                    title="Overdue Items" 
                    value={stats.overdue} 
                    icon={AlertTriangle} 
                    color="red" 
                    link="/profile?tab=borrows"
                    alert={stats.overdue > 0}
                />
            </div>

            {/* ══════════════════════════════════════════
                QUICK ACTIONS — Hover Lift Cards
               ══════════════════════════════════════════ */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full inline-block" />
                    Quick Actions
                </h2>
                <div ref={actionsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ActionCard 
                        to="/books" 
                        icon={Search} 
                        title="Browse Catalog" 
                        desc="Search for physical books" 
                        gradient="from-blue-500 to-indigo-500" 
                    />
                    <ActionCard 
                        to="/ebooks" 
                        icon={BookOpen} 
                        title="Read E-Books" 
                        desc="Access digital resources" 
                        gradient="from-emerald-500 to-teal-500" 
                    />
                    <ActionCard 
                        to="/renew" 
                        icon={Clock} 
                        title="Renew Book" 
                        desc="Extend your borrow period" 
                        gradient="from-amber-500 to-orange-500" 
                    />
                    <ActionCard 
                        to="/profile?tab=notifications" 
                        icon={Bell} 
                        title="Notifications" 
                        desc="Check library updates" 
                        gradient="from-violet-500 to-purple-500" 
                    />
                </div>
            </div>

            {/* ══════════════════════════════════════════
                ACTIVE MATTERS — Tables & Lists
               ══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Active Borrows Table (Takes 2 columns on LG) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full inline-block" />
                            Current Borrows
                        </h2>
                        <Link to="/profile?tab=borrows" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group">
                            View All <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 relative">
                        {borrows.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="h-8 w-8 text-slate-400" />
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 font-medium">You have no active borrows.</p>
                                <p className="text-sm text-slate-500 mt-1">Visit the catalog to find your next read.</p>
                                <Link to="/books" className="mt-4 inline-block btn-primary px-6 py-2 rounded-xl text-sm">
                                    Browse Books
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            <th className="p-4">Book Title</th>
                                            <th className="p-4">Borrowed On</th>
                                            <th className="p-4">Due Date</th>
                                            <th className="p-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {borrows.slice(0, 5).map((borrow) => (
                                            <tr key={borrow._id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {borrow.bookId?.coverImage ? (
                                                            <Link to={`/books/${borrow.bookId._id}`}>
                                                                <img src={borrow.bookId.coverImage} className="w-10 h-14 object-cover rounded shadow-sm hover:opacity-80 transition-opacity" alt="Cover" />
                                                            </Link>
                                                        ) : (
                                                            <Link to={`/books/${borrow.bookId?._id}`}>
                                                                <div className="w-10 h-14 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center hover:bg-slate-200 transition-colors">
                                                                    <BookOpen className="h-4 w-4 text-slate-300" />
                                                                </div>
                                                            </Link>
                                                        )}
                                                        <Link to={`/books/${borrow.bookId?._id}`} className="font-semibold text-slate-800 dark:text-white line-clamp-2 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
                                                            {borrow.bookId?.title || 'Unknown Book'}
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {format(new Date(borrow.borrowDate), 'MMM dd, yyyy')}
                                                </td>
                                                <td className="p-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                    <span className={new Date(borrow.dueDate) < new Date() ? 'text-red-500' : ''}>
                                                        {format(new Date(borrow.dueDate), 'MMM dd, yyyy')}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <StatusBadge status={borrow.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Renewals & Meetings (Takes 1 column on LG) */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full inline-block" />
                        Active Renewals
                    </h2>

                    <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50">
                        {renewals.length === 0 ? (
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Clock className="h-6 w-6 text-slate-400" />
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">No active renewal requests.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {renewals.map(renewal => (
                                    <div key={renewal._id} className="relative pl-6 pb-4 last:pb-0 border-l-2 border-indigo-100 dark:border-indigo-900/50 last:border-transparent">
                                        {/* Timeline Dot */}
                                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-slate-800 bg-indigo-500 shadow-sm" />
                                        
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700 -mt-1 group hover:-translate-y-1 transition-transform">
                                            <h4 className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                                                {renewal.borrowId?.book?.title || 'Book Renewal'}
                                            </h4>
                                            <div className="mt-2 flex items-center justify-between">
                                                <StatusBadge status={renewal.status} />
                                                {renewal.meetingLink && (
                                                    <a 
                                                        href={renewal.meetingLink} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                                                    >
                                                        Join Meeting <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                            {renewal.meetingTime && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                                                    📅 {format(new Date(renewal.meetingTime), 'MMM dd, h:mm a')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                             <Link to="/renew" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center justify-center gap-1">
                                Request New Renewal <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

/* ══════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════ */

/** StatCard with animated counter */
const StatCard = ({ title, value, icon: Icon, color, link, alert }) => {
    const { count, ref } = useAnimatedCounter(value);
    
    const colorMap = {
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
        <Link to={link || '#'} className="reveal-child block">
            <div className={`glass-card p-6 rounded-2xl border ${alert ? 'border-red-200 dark:border-red-800/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-slate-200 dark:border-slate-700/50'} hover-lift relative overflow-hidden group`}>
                
                {alert && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                        ACTION REQUIRED
                    </div>
                )}
                
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
                        <div ref={ref} className="text-3xl font-extrabold text-slate-800 dark:text-white transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {count}
                        </div>
                    </div>
                    <div className={`p-3 rounded-xl ${colorMap[color]} transition-transform group-hover:-rotate-6 group-hover:scale-110`}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </div>
        </Link>
    );
};

/** ActionCard with hover glow & gradient icon */
const ActionCard = ({ to, icon: Icon, title, desc, gradient }) => (
    <Link to={to} className="reveal-child block">
        <div className="glass-card p-5 rounded-2xl hover-lift border border-slate-200 dark:border-slate-700/50 group h-full">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {desc}
            </p>
        </div>
    </Link>
);

export default StudentDashboard;
