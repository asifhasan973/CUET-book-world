/**
 * RenewPage — Premium renewal management page with animated tabs,
 * timeline visualization for consultation tracking, and glassmorphism sections.
 *
 * @component
 * Features:
 * - Smooth animated tab indicator transition
 * - Status timeline with active/completed dot animations
 * - Glowing meeting action buttons
 * - Floating label input fields for the renewal form
 */
import { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Clock, CheckCircle, Video, List, AlertCircle, FileText, Calendar, Link as LinkIcon } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { useLocation } from 'react-router-dom';

const RenewPage = () => {
  const { user, dbUser } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'status';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [borrows, setBorrows] = useState([]);
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedBorrowId, setSelectedBorrowId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [borrowsRes, renewalsRes] = await Promise.all([
          API.get('/borrows/my'),
          API.get('/renewals/my')
        ]);
        
        // Only allow renewing active or overdue borrows that aren't already pending or scheduled for a meeting
        const eligibleBorrows = borrowsRes.data.filter(b => 
            (b.status === 'active' || b.status === 'overdue') && 
            !renewalsRes.data.some(r => r.borrowId?._id === b._id && (r.status === 'pending' || r.status === 'approved'))
        );
        
        setBorrows(eligibleBorrows);
        setRenewals(renewalsRes.data);
      } catch (error) {
        addToast('Failed to load renewal data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, addToast]);

  useEffect(() => {
    if (initialTab === 'request' || initialTab === 'status') setActiveTab(initialTab);
  }, [initialTab]);

  const tabs = useMemo(() => ([
    { id: 'status', label: 'Check Status', Icon: List },
    { id: 'request', label: 'New Request', Icon: FileText },
  ]), []);

  const tablistRef = useRef(null);
  const tabButtonRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 6, width: 150 });

  useLayoutEffect(() => {
    const el = tabButtonRefs.current[activeTab];
    const container = tablistRef.current;
    if (!el || !container) return;

    const update = () => {
      const containerRect = container.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      const left = rect.left - containerRect.left;
      setIndicatorStyle({ left, width: rect.width });
    };

    // Ensure layout is settled before measuring (fonts/animations)
    const raf = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
    };
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBorrowId || !reason) {
      addToast('Please select a book and provide a reason.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/renewals', { borrowId: selectedBorrowId, notes: reason });
      addToast('Renewal request submitted. Wait for librarian approval/meeting.', 'success');
      
      // Cleanup & Refresh
      setReason('');
      setSelectedBorrowId('');
      setActiveTab('status');
      
      const newRenewalsRes = await API.get('/renewals/my');
      setRenewals(newRenewalsRes.data);
      
      const newBorrowsRes = await API.get('/borrows/my');
      const activePendingIds = newRenewalsRes.data.map(r => r.borrowId?._id);
      setBorrows(newBorrowsRes.data.filter(b => 
        (b.status === 'active' || b.status === 'overdue') && !activePendingIds.includes(b._id)
      ));
      
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /** Helper for timeline step status */
  const getStepStatus = (renewalStatus, step) => {
    if (step === 'pending') return 'completed';
    if (step === 'meeting') {
      if (renewalStatus === 'rejected') return 'error';
      if (renewalStatus === 'completed') return 'completed';
      // pending or approved => meeting is the active step
      return 'active';
    }
    if (step === 'final') {
      if (renewalStatus === 'completed') return 'success';
      if (renewalStatus === 'rejected') return 'error';
      return 'pending';
    }
    return 'pending';
  };

  if (!user || dbUser?.role !== 'student') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center page-enter">
          <EmptyState title="Access Denied" message="This page is only for student accounts." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
        
        {/* Page Header */}
        <div className="mb-10 max-w-3xl space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                Book <span className="gradient-text">Renewal</span> Center
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
                Extend your borrow period. Note that librarians may require a brief video consultation before approval.
            </p>
        </div>

        {/* ── Animated Tabs ── */}
        <div
          ref={tablistRef}
          className="bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl inline-flex mb-8 relative glass"
          role="tablist"
        >
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                ref={(node) => {
                  if (node) tabButtonRefs.current[id] = node;
                }}
                onClick={() => setActiveTab(id)}
                role="tab"
                aria-selected={activeTab === id}
                className={`relative px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors z-10 flex items-center gap-2 ${
                  activeTab === id
                    ? 'text-indigo-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}

            {/* Sliding Selection Background */}
            <div
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-white dark:bg-indigo-600 shadow-sm transition-all duration-300 ease-out z-0"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
              }}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ── Main Content Area ── */}
            <div className="lg:col-span-2">
                {activeTab === 'request' ? (
                    <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/50 dark:border-slate-700/50 page-fade">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            Request Extension
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Floating Label Select */}
                            <div className="relative">
                                <select 
                                    id="borrowSelect"
                                    value={selectedBorrowId}
                                    onChange={(e) => setSelectedBorrowId(e.target.value)}
                                    required
                                    className="block w-full px-4 pt-6 pb-2 text-sm text-slate-900 bg-transparent border border-slate-300 rounded-xl appearance-none dark:text-white dark:border-slate-600 focus:outline-none focus:ring-0 focus:border-indigo-600 peer"
                                >
                                    <option value="" disabled className="dark:bg-slate-800">Select a borrowed book...</option>
                                    {borrows.map(b => (
                                        <option key={b._id} value={b._id} className="dark:bg-slate-800">
                                            {b.bookId?.title} (Due: {format(new Date(b.dueDate), 'MMM dd')})
                                            {b.status === 'overdue' ? ' - OVERDUE' : ''}
                                        </option>
                                    ))}
                                </select>
                                <label htmlFor="borrowSelect" className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-indigo-600 peer-focus:dark:text-indigo-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none bg-white lg:bg-transparent dark:bg-slate-900 lg:dark:bg-transparent px-1">
                                    Book to Renew
                                </label>
                                {borrows.length === 0 && (
                                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> No eligible books found. Books already pending renewal are hidden.
                                    </p>
                                )}
                            </div>

                            {/* Floating Label Textarea */}
                            <div className="relative">
                                <textarea 
                                    id="reasonText"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                    rows="4"
                                    placeholder=" "
                                    className="block w-full px-4 pt-6 pb-2 text-sm text-slate-900 bg-transparent border border-slate-300 rounded-xl appearance-none dark:text-white dark:border-slate-600 focus:outline-none focus:ring-0 focus:border-indigo-600 peer resize-none"
                                />
                                <label htmlFor="reasonText" className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-indigo-600 peer-focus:dark:text-indigo-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none bg-white lg:bg-transparent dark:bg-slate-900 lg:dark:bg-transparent px-1">
                                    Why do you need more time?
                                </label>
                            </div>

                            <button 
                                type="submit"
                                disabled={submitting || borrows.length === 0}
                                className="w-full btn-primary btn-shimmer py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-6 page-fade">
                        {loading ? (
                            <div className="flex justify-center py-10"><Spinner /></div>
                        ) : renewals.length === 0 ? (
                            <div className="glass-card rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-700">
                                <List className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                                <h3 className="font-semibold text-slate-800 dark:text-white mb-1">No Renewal Requests</h3>
                                <p className="text-slate-500 text-sm">Your renewal history is empty.</p>
                            </div>
                        ) : (
                            renewals.map(renewal => (
                                <div key={renewal._id} className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover-lift relative overflow-hidden group">
                                    {/* Background Accent */}
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                                    
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {renewal.borrowId?.bookId?.title || 'Unknown Book'}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Original Due: {renewal.borrowId?.dueDate ? format(new Date(renewal.borrowId.dueDate), 'MMM dd, yyyy') : 'N/A'}
                                            </p>
                                        </div>
                                        <StatusBadge status={renewal.status} />
                                    </div>

                                    {/* Status Timeline */}
                                    <div className="relative pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                                        <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10" />
                                        
                                        {/* Step 1: Requested */}
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-indigo-500 text-white shadow-md shadow-indigo-500/30 ring-4 ring-indigo-50 dark:ring-slate-900">
                                                <CheckCircle className="h-3 w-3" />
                                            </div>
                                            <span className="font-medium text-indigo-600 dark:text-indigo-400">Requested</span>
                                        </div>

                                        {/* Step 2: Consultation */}
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 transition-colors ${
                                                getStepStatus(renewal.status, 'meeting') === 'completed' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' :
                                                getStepStatus(renewal.status, 'meeting') === 'active' ? 'bg-amber-500 text-white animate-pulse shadow-md shadow-amber-500/30' :
                                                getStepStatus(renewal.status, 'meeting') === 'error' ? 'bg-red-500 text-white' :
                                                'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                            }`}>
                                                <Video className="h-3 w-3" />
                                            </div>
                                            <span className={`font-medium ${getStepStatus(renewal.status, 'meeting') === 'active' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>
                                                Meeting
                                            </span>
                                        </div>

                                        {/* Step 3: Decision */}
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 transition-colors ${
                                                getStepStatus(renewal.status, 'final') === 'success' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' :
                                                getStepStatus(renewal.status, 'final') === 'error' ? 'bg-red-500 text-white shadow-md shadow-red-500/30' :
                                                'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                            }`}>
                                                {getStepStatus(renewal.status, 'final') === 'success' ? <CheckCircle className="h-3 w-3" /> : 
                                                 getStepStatus(renewal.status, 'final') === 'error' ? <AlertCircle className="h-3 w-3" /> : 
                                                 <Clock className="h-3 w-3" />}
                                            </div>
                                            <span className={`font-medium ${
                                                getStepStatus(renewal.status, 'final') === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                                                getStepStatus(renewal.status, 'final') === 'error' ? 'text-red-600 dark:text-red-400' :
                                                'text-slate-500'
                                            }`}>
                                                Decision
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Banner (If Meeting Scheduled/Approved) */}
                                    {renewal.status === 'approved' && renewal.meetingLink && (
                                        <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Consultation Scheduled</p>
                                                    <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                                                        📅 {renewal.scheduledDate ? format(new Date(renewal.scheduledDate), 'PPP') : 'Date: N/A'}
                                                        {renewal.scheduledTime ? ` • ${renewal.scheduledTime}` : ''}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <a 
                                                        href={renewal.meetingLink} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-lg shadow-md shadow-amber-500/20 hover:shadow-lg transition-all hover:-translate-y-0.5 whitespace-nowrap"
                                                    >
                                                        <Video className="h-4 w-4" /> Join Meeting
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                          try {
                                                            await navigator.clipboard.writeText(renewal.meetingLink);
                                                            addToast('Meeting link copied', 'success');
                                                          } catch {
                                                            addToast('Failed to copy meeting link', 'error');
                                                          }
                                                        }}
                                                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-900/40 border border-amber-200/60 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-sm font-bold rounded-lg hover:bg-white dark:hover:bg-slate-900/60 transition-all whitespace-nowrap"
                                                    >
                                                        <LinkIcon className="h-4 w-4" /> Copy Link
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Rejection Note */}
                                    {renewal.status === 'rejected' && renewal.librarianNote && (
                                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30 border-l-4 border-l-red-500">
                                            <span className="font-bold">Note:</span> {renewal.librarianNote}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* ── Sidebar: Rules & Info ── */}
            <div className="lg:col-span-1 space-y-6">
                <div className="glass-card rounded-2xl p-6 border-t-4 border-t-indigo-500 shadow-sm relative overflow-hidden">
                    <AlertCircle className="absolute -right-4 -bottom-4 h-32 w-32 text-slate-100 dark:text-slate-800 opacity-50" />
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 relative z-10">Renewal Policy Guidelines</h3>
                    <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 relative z-10">
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                            <span>Books can only be renewed once.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                            <span>Renewal extends the due date by 7 days.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                            <span>You cannot renew a book if another student has placed a hold on it.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                            <span className="text-slate-700 dark:text-slate-300 font-medium">Librarians may mandate a short Google Meet call to verify the book's condition before approving.</span>
                        </li>
                    </ul>
                </div>
            </div>

        </div>
    </div>
  );
};

export default RenewPage;
