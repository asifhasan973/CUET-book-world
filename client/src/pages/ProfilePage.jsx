/**
 * ProfilePage — Premium user profile with animated gradient avatar ring,
 * counter stat cards, staggered notifications, and sliding tabs.
 *
 * @component
 * Features:
 * - Animated gradient ring around user avatar (morphing animation)
 * - Number counter animation for profile stats
 * - Sliding indicator for tab selection
 * - Staggered fade-up items for active borrows and history
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { User, BookOpen, Clock, Calendar, CheckCircle, Bell, Settings, LayoutDashboard, AlertTriangle } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';
import { useToast } from '../components/Toast';
import Spinner from '../components/Spinner';
import { useStaggerReveal } from '../hooks/useScrollReveal';
import useAnimatedCounter from '../hooks/useAnimatedCounter';
import EmptyState from '../components/EmptyState';

const ProfilePage = () => {
  const { user, dbUser, setDbUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'overview';
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [stats, setStats] = useState({ borrows: 0, returned: 0, overdue: 0, pending: 0, fines: 0 });
  const [borrows, setBorrows] = useState({ active: [], history: [] });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    studentId: '',
    department: '',
    year: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Animation hooks for list items
  const activeBorrowsRef = useStaggerReveal({ staggerMs: 100, dependency: `${activeTab}-${loading}` });
  const historyRef = useStaggerReveal({ staggerMs: 80, dependency: `${activeTab}-${loading}` });
  const notificationsRef = useStaggerReveal({ staggerMs: 120, dependency: `${activeTab}-${loading}` });

  useEffect(() => {
    if (dbUser) {
      if (dbUser.role !== 'student' && ['overview', 'borrows', 'history'].includes(initialTab)) {
        setActiveTab('notifications');
      } else {
        setActiveTab(initialTab);
      }
      setProfileForm({
        name: dbUser.name || '',
        studentId: dbUser.studentId || '',
        department: dbUser.department || 'CSE',
        year: dbUser.year || '1st'
      });
    }
  }, [initialTab, dbUser]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [borrowsRes, notifsRes] = await Promise.all([
          API.get('/borrows/my'),
          API.get('/notifications')
        ]);
        
        const allBorrows = borrowsRes.data;
        const active = allBorrows.filter(b => b.status === 'active' || b.status === 'overdue' || b.status === 'pending');
        const history = allBorrows.filter(b => b.status === 'returned' || b.status === 'completed' || b.status === 'rejected');
        const totalFines = allBorrows.reduce((sum, borrow) => sum + Number(borrow.fine || 0), 0);
        
        setBorrows({ active, history });
        setStats({
          borrows: active.filter(b => b.status === 'active' || b.status === 'overdue').length,
          returned: history.filter(b => b.status === 'returned').length,
          overdue: active.filter(b => b.status === 'overdue').length,
          pending: allBorrows.filter(b => b.status === 'pending').length,
          fines: totalFines,
        });
        
        setNotifications(notifsRes.data);
      } catch (error) {
        addToast('Failed to load profile data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, addToast]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await API.put('/auth/profile', profileForm);
      setDbUser(res.data.user);
      addToast('Profile updated successfully!', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      addToast('All notifications marked as read', 'success');
    } catch (error) {
      addToast('Failed to update notifications', 'error');
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await API.put(`/notifications/${notification._id}/read`);
        setNotifications((prev) => prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n)));
      }
    } catch {
      // ignore read failures; still allow navigation
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  if (!dbUser) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* ══════════════════════════════════════════
                LEFT SIDEBAR — User Info & Navigation
               ══════════════════════════════════════════ */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Profile Card */}
                <div className="glass-card rounded-2xl p-6 text-center relative overflow-hidden group">
                    {/* Gradient Background Decoration */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-full blur-3xl pointer-events-none" />
                    
                    {/* Animated Avatar */}
                    <div className="relative w-28 h-28 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-500 animate-spin opacity-70 blur-md" style={{ animationDuration: '4s' }} />
                        <div className="absolute inset-1 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 z-10">
                            <span className="text-4xl font-black gradient-text">
                                {dbUser.name?.[0]?.toUpperCase() || 'U'}
                            </span>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {dbUser.name}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{user.email}</p>
                    
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <User className="h-3 w-3" />
                        {dbUser.role}
                    </div>

                    {dbUser.role === 'student' && (
                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-left space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Student ID:</span>
                                <span className="font-medium text-slate-800 dark:text-white">{dbUser.studentId}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Department:</span>
                                <span className="font-medium text-slate-800 dark:text-white">{dbUser.department}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Year:</span>
                                <span className="font-medium text-slate-800 dark:text-white">{dbUser.year}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Outstanding Fine:</span>
                                <span className={`font-semibold ${stats.fines > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {stats.fines} Tk
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:block glass-card rounded-2xl p-2 sticky top-24">
                    <nav className="space-y-1">
                        {dbUser.role === 'student' && (
                            <>
                                <TabButton 
                                    active={activeTab === 'overview'} 
                                    onClick={() => setActiveTab('overview')} 
                                    icon={LayoutDashboard} 
                                    label="Overview" 
                                />
                                <TabButton 
                                    active={activeTab === 'borrows'} 
                                    onClick={() => setActiveTab('borrows')} 
                                    icon={BookOpen} 
                                    label="Active Borrows" 
                                    badge={borrows.active.length}
                                />
                                <TabButton 
                                    active={activeTab === 'history'} 
                                    onClick={() => setActiveTab('history')} 
                                    icon={Clock} 
                                    label="Borrow History" 
                                />
                            </>
                        )}
                        <TabButton 
                            active={activeTab === 'notifications'} 
                            onClick={() => setActiveTab('notifications')} 
                            icon={Bell} 
                            label="Notifications" 
                            badge={notifications.filter(n => !n.read).length}
                            badgeColor="bg-red-500"
                        />
                        <TabButton 
                            active={activeTab === 'settings'} 
                            onClick={() => setActiveTab('settings')} 
                            icon={Settings} 
                            label="Settings" 
                        />
                    </nav>
                </div>
            </div>

            {/* ══════════════════════════════════════════
                RIGHT CONTENT AREA
               ══════════════════════════════════════════ */}
            <div className="lg:col-span-3 pb-20">
                
                {/* Mobile Tab Navigation */}
                <div className="lg:hidden flex overflow-x-auto gap-2 pb-4 mb-4 scrollbar-hide">
                    {(dbUser.role === 'student' ? ['overview', 'borrows', 'history', 'notifications'] : ['notifications']).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                                activeTab === tab 
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                            activeTab === 'settings' 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                    >
                        settings
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Spinner size="lg" /></div>
                ) : (
                    <div className="space-y-8">
                        
                        {/* ── Overview Tab ── */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6 page-fade">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full inline-block" />
                                    Your Library Stats
                                </h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                    <StatBox label="Total Borrows" value={stats.borrows} icon={BookOpen} color="indigo" />
                                    <StatBox label="Returned" value={stats.returned} icon={CheckCircle} color="emerald" />
                                    <StatBox label="Overdue" value={stats.overdue} icon={Calendar} color="red" />
                                    <StatBox label="Total Fine" value={stats.fines} suffix=" Tk" icon={AlertTriangle} color="red" />
                                </div>
                                
                                {/* Recent Activity Snippet */}
                                <div className="pt-6">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full inline-block" />
                                        Recent Activity
                                    </h3>
                                    <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                                        {borrows.active.slice(0, 3).map(b => (
                                            <div key={b._id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    {b.bookId?.coverImage && (
                                                        <Link to={`/books/${b.bookId._id}`}>
                                                            <img src={b.bookId.coverImage} className="w-8 h-10 object-cover rounded shadow-sm hover:opacity-80 transition-opacity" alt="Cover" />
                                                        </Link>
                                                    )}
                                                    <div>
                                                        <Link to={`/books/${b.bookId?._id}`} className="font-semibold text-slate-800 dark:text-white text-sm line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                            {b.bookId?.title || 'Unknown Book'}
                                                        </Link>
                                                        <p className="text-xs text-slate-500 mt-1">Due: {format(new Date(b.dueDate), 'MMM dd, yyyy')}</p>
                                                        {Number(b.fine || 0) > 0 && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">Fine: {b.fine} Tk</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <StatusBadge status={b.status} />
                                            </div>
                                        ))}
                                        {borrows.active.length === 0 && (
                                            <div className="p-6 text-center text-slate-500 text-sm">No recent activity.</div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => setActiveTab('borrows')}
                                        className="mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                                    >
                                        View all activity &rarr;
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Active Borrows Tab ── */}
                        {activeTab === 'borrows' && (
                            <div className="space-y-6 page-fade">
                                <Heading icon={BookOpen} title="Active Borrows & Pending Requests" />
                                {borrows.active.length === 0 && stats.pending === 0 ? (
                                    <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-700/50">
                                        <EmptyState message="You don't have any books currently borrowed." />
                                    </div>
                                ) : (
                                    <div ref={activeBorrowsRef} className="space-y-4">
                                        {borrows.active.map(borrow => (
                                            <div key={borrow._id} className="reveal-child glass-card rounded-2xl p-5 border-l-4 border-l-indigo-500 hover-lift flex gap-4">
                                                {borrow.bookId?.coverImage ? (
                                                    <Link to={`/books/${borrow.bookId._id}`} className="hidden sm:block">
                                                        <img src={borrow.bookId.coverImage} className="w-16 h-20 md:w-20 md:h-28 object-cover rounded-xl shadow-md border border-slate-200/50 hover:opacity-80 transition-opacity" alt="Book Cover" />
                                                    </Link>
                                                ) : (
                                                    <div className="w-16 h-20 md:w-20 md:h-28 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center hidden sm:flex">
                                                        <BookOpen className="h-6 w-6 text-slate-300" />
                                                    </div>
                                                )}
                                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div>
                                                        <Link to={`/books/${borrow.bookId?._id}`}>
                                                            <h4 className="font-bold text-slate-800 dark:text-white text-lg line-clamp-2 md:line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{borrow.bookId?.title || 'Unknown Book'}</h4>
                                                        </Link>
                                                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-slate-600 dark:text-slate-400">
                                                            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-slate-400" /> Borrowed: {format(new Date(borrow.borrowDate), 'MMM dd, yyyy')}</span>
                                                            <span className={`flex items-center gap-1.5 font-medium ${new Date(borrow.dueDate) < new Date() ? 'text-red-500' : ''}`}><Clock className="h-4 w-4 text-slate-400" /> Due: {format(new Date(borrow.dueDate), 'MMM dd, yyyy')}</span>
                                                        </div>
                                                        {Number(borrow.fine || 0) > 0 && (
                                                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-1.5 text-sm font-semibold text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/50">
                                                                <AlertTriangle className="h-4 w-4" />
                                                                Fine: {borrow.fine} Tk{borrow.fineReason ? ` - ${borrow.fineReason}` : ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <StatusBadge status={borrow.status} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Borrow History Tab ── */}
                        {activeTab === 'history' && (
                            <div className="space-y-6 page-fade">
                                <Heading icon={Clock} title="Borrowing History" />
                                {borrows.history.length === 0 ? (
                                    <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-700/50">
                                        <EmptyState message="Your reading history is empty." />
                                    </div>
                                ) : (
                                    <div ref={historyRef} className="space-y-4">
                                        {borrows.history.map(borrow => (
                                            <div key={borrow._id} className="reveal-child bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50 opacity-80 hover:opacity-100 transition-opacity flex gap-4">
                                                {borrow.bookId?.coverImage ? (
                                                    <Link to={`/books/${borrow.bookId._id}`} className="hidden sm:block">
                                                        <img src={borrow.bookId.coverImage} className="w-12 h-16 object-cover rounded-lg shadow-sm border border-slate-200/50 grayscale hover:grayscale-0 transition-all hover:opacity-80" alt="Book Cover" />
                                                    </Link>
                                                ) : (
                                                    <div className="w-12 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center hidden sm:flex">
                                                        <BookOpen className="h-4 w-4 text-slate-300" />
                                                    </div>
                                                )}
                                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div>
                                                        <Link to={`/books/${borrow.bookId?._id}`}>
                                                            <h4 className="font-bold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{borrow.bookId?.title || 'Unknown Book'}</h4>
                                                        </Link>
                                                        <p className="text-sm text-slate-500 mt-1">
                                                            {borrow.status === 'rejected'
                                                                ? `Rejected: ${format(new Date(borrow.updatedAt || borrow.createdAt), 'MMM dd, yyyy')}`
                                                                : `Returned: ${borrow.returnDate ? format(new Date(borrow.returnDate), 'MMM dd, yyyy') : 'N/A'}`}
                                                        </p>
                                                        {Number(borrow.fine || 0) > 0 && (
                                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1 font-semibold">
                                                                Fine: {borrow.fine} Tk{borrow.fineReason ? ` - ${borrow.fineReason}` : ''}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <StatusBadge status={borrow.status} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Notifications Tab ── */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6 page-fade">
                                <div className="flex items-center justify-between">
                                    <Heading icon={Bell} title="Notifications" />
                                    {notifications.some(n => !n.read) && (
                                        <button 
                                            onClick={markAllRead} 
                                            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                
                                {notifications.length === 0 ? (
                                    <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-700/50">
                                        <EmptyState message="You're all caught up! No notifications." />
                                    </div>
                                ) : (
                                    <div ref={notificationsRef} className="space-y-4">
                                        {notifications.map(notification => (
                                            <div
                                                key={notification._id}
                                                role={notification.link ? 'button' : undefined}
                                                tabIndex={notification.link ? 0 : undefined}
                                                onClick={() => handleNotificationClick(notification)}
                                                onKeyDown={(e) => {
                                                  if (!notification.link) return;
                                                  if (e.key === 'Enter' || e.key === ' ') handleNotificationClick(notification);
                                                }}
                                                className={`reveal-child rounded-2xl p-5 transition-all ${
                                                notification.read 
                                                    ? 'bg-slate-50 dark:bg-slate-800/50 border border-transparent' 
                                                    : 'glass-card border border-indigo-200 dark:border-indigo-800 shadow-sm border-l-4 border-l-indigo-500'
                                            } ${notification.link ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}`}>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className={`text-sm ${notification.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium leading-relaxed'}`}>
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-2 font-medium">
                                                            {format(new Date(notification.createdAt), 'MMM dd, h:mm a')}
                                                        </p>
                                                    </div>
                                                    {!notification.read && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Settings Tab ── */}
                        {activeTab === 'settings' && (
                            <div className="space-y-6 page-fade">
                                <Heading icon={Settings} title="Account Settings" />
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Edit Profile Form */}
                                    <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 relative overflow-hidden">
                                        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Edit Profile</h3>
                                        <form onSubmit={handleProfileUpdate} className="space-y-4 relative z-10">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                                                <input 
                                                    type="text" 
                                                    value={profileForm.name} 
                                                    onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                                    required
                                                />
                                            </div>
                                            {dbUser?.role === 'student' && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Student ID</label>
                                                        <input 
                                                            type="text" 
                                                            value={profileForm.studentId} 
                                                            onChange={e => setProfileForm({...profileForm, studentId: e.target.value})}
                                                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Department</label>
                                                            <select 
                                                                value={profileForm.department} 
                                                                onChange={e => setProfileForm({...profileForm, department: e.target.value})}
                                                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                                            >
                                                                <option value="CSE">CSE</option>
                                                                <option value="EEE">EEE</option>
                                                                <option value="ME">ME</option>
                                                                <option value="CE">CE</option>
                                                                <option value="URP">URP</option>
                                                                <option value="Arch">Arch</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Year</label>
                                                            <select 
                                                                value={profileForm.year} 
                                                                onChange={e => setProfileForm({...profileForm, year: e.target.value})}
                                                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                                            >
                                                                <option value="1st">1st Year</option>
                                                                <option value="2nd">2nd Year</option>
                                                                <option value="3rd">3rd Year</option>
                                                                <option value="4th">4th Year</option>
                                                                <option value="Masters">Masters</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            <button 
                                                type="submit" 
                                                disabled={savingProfile}
                                                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                                            >
                                                {savingProfile ? 'Saving Changes...' : 'Save Changes'}
                                            </button>
                                        </form>
                                    </div>

                                    {/* App Settings */}
                                    <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Preferences</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                                <div>
                                                    <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Email Notifications</h4>
                                                    <p className="text-xs text-slate-500">Receive emails for due dates</p>
                                                </div>
                                                <div className="w-11 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                                                </div>
                                            </div>
                                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
                                                <h4 className="font-semibold text-amber-800 dark:text-amber-400 text-sm mb-1">Account Permissions</h4>
                                                <p className="text-xs text-amber-700/70 dark:text-amber-500/70">
                                                    Your role is strictly managed by administrators. Changing passwords is done via your Firebase authentication provider.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════ */

/** Desktop Navigation Tab Button */
const TabButton = ({ active, onClick, icon: Icon, label, badge, badgeColor = 'bg-indigo-500' }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
            active 
                ? 'bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/30 dark:to-transparent text-indigo-700 dark:text-indigo-400 font-semibold border-r-4 border-indigo-500 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
    >
        <div className="flex items-center gap-3">
            <Icon className={`h-5 w-5 ${active ? 'text-indigo-600 dark:text-indigo-400 transform scale-110' : 'text-slate-400'} transition-transform`} />
            <span className="text-sm">{label}</span>
        </div>
        {!!badge && badge > 0 && (
            <span className={`${badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm`}>
                {badge}
            </span>
        )}
    </button>
);

/** Top Overview Stat Box */
const StatBox = ({ label, value, icon: Icon, color, suffix = '' }) => {
    const { count, ref } = useAnimatedCounter(value);
    
    const colors = {
        indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/20',
        emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
        amber: 'from-amber-500 to-orange-500 shadow-amber-500/20',
        red: 'from-red-500 to-rose-600 shadow-red-500/20',
    };

    return (
        <div className={`rounded-2xl p-5 text-white bg-gradient-to-br ${colors[color]} shadow-lg hover-lift relative overflow-hidden group`}>
            <Icon className="absolute -right-4 -bottom-4 h-24 w-24 text-white opacity-20 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
                <p className="text-sm font-medium text-white/80 mb-1">{label}</p>
                <div ref={ref} className="text-3xl font-extrabold">{count}{suffix}</div>
            </div>
        </div>
    );
};

const Heading = ({ icon: Icon, title }) => (
    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Icon className="h-4 w-4" />
        </div>
        {title}
    </h3>
);

export default ProfilePage;
