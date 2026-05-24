/**
 * VideoPage — Premium academic video consultation booking page
 * featuring floating label forms, animated session cards,
 * and gradient action buttons.
 *
 * @component
 * Features:
 * - Floating label input elements
 * - Glassmorphism card layouts
 * - Pulse animations on video icons
 * - Staggered fade in applied to upcoming & pending lists
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { Video as VideoIcon, Calendar, Users, Plus, ExternalLink, Clock } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { useStaggerReveal } from '../hooks/useScrollReveal';

const VideoPage = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [form, setForm] = useState({ 
        topic: '', 
        preferredDate: '', 
        preferredTime: '10:00 AM', 
        type: 'one-on-one' 
    });

    const listsRef = useStaggerReveal({ staggerMs: 120, dependency: sessions });

    useEffect(() => {
        if (user) {
            API.get('/videos/my')
               .then(res => setSessions(res.data))
               .catch(() => addToast("Failed to load sessions", "error"))
               .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user, addToast]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await API.post('/videos', form);
            addToast('Session request submitted successfully!', 'success');
            const res = await API.get('/videos/my');
            setSessions(res.data);
            setForm({ topic: '', preferredDate: '', preferredTime: '10:00 AM', type: 'one-on-one' });
        } catch (err) {
            addToast(err.response?.data?.message || 'Error submitting request', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e1a] flex items-center justify-center p-4">
            <EmptyState title="Login Required" message="Please login to schedule academic video consultations." />
        </div>
    );

    const upcoming = sessions.filter(s => s.status === 'approved');
    const pending = sessions.filter(s => s.status === 'pending');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 page-enter">
            
            {/* Header */}
            <div className="mb-12 text-center max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-violet-50 dark:bg-violet-900/30 rounded-2xl mb-2 text-violet-600 dark:text-violet-400 shadow-sm border border-violet-100 dark:border-violet-800/50">
                    <VideoIcon className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                    Academic <span className="gradient-text text-violet-600">Consultations</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                    Schedule a 1-on-1 meeting with librarians for research help or join a group study session.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* ══════════════════════════════════════════
                    REQUEST FORM
                   ══════════════════════════════════════════ */}
                <div className="glass-card rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg relative overflow-hidden h-fit">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Plus className="h-5 w-5" />
                        </div>
                        Request a Session
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Topic Input - Floating */}
                        <div className="relative">
                            <input 
                                type="text" id="v_topic" 
                                value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} required
                                className="block w-full px-4 pt-6 pb-2 text-sm text-slate-900 bg-transparent border border-slate-300 rounded-xl appearance-none dark:text-white dark:border-slate-600 shadow-sm focus:outline-none focus:ring-0 focus:border-violet-500 transition-all peer"
                                placeholder=" "
                            />
                            <label htmlFor="v_topic" className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-violet-600 peer-focus:dark:text-violet-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none bg-white lg:bg-transparent dark:bg-slate-800 lg:dark:bg-transparent px-1">
                                Topic / Reason for meeting
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Date Input - Floating */}
                            <div className="relative">
                                <input 
                                    type="date" id="v_date" 
                                    value={form.preferredDate} onChange={e => setForm({...form, preferredDate: e.target.value})} required
                                    className="block w-full px-4 pt-6 pb-2 text-sm text-slate-900 bg-transparent border border-slate-300 rounded-xl appearance-none dark:text-white dark:border-slate-600 shadow-sm focus:outline-none focus:ring-0 focus:border-violet-500 transition-all peer"
                                />
                                <label htmlFor="v_date" className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 bg-white lg:bg-transparent dark:bg-slate-800 lg:dark:bg-transparent px-1">
                                    Date
                                </label>
                            </div>
                            
                            {/* Time Input - Floating */}
                            <div className="relative">
                                <select 
                                    id="v_time" 
                                    value={form.preferredTime} onChange={e => setForm({...form, preferredTime: e.target.value})}
                                    className="block w-full px-4 pt-6 pb-2 text-sm text-slate-900 bg-transparent border border-slate-300 rounded-xl appearance-none dark:text-white dark:border-slate-600 shadow-sm focus:outline-none focus:ring-0 focus:border-violet-500 transition-all peer"
                                >
                                    {['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'].map(t => <option key={t} className="dark:bg-slate-800">{t}</option>)}
                                </select>
                                <label htmlFor="v_time" className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 bg-white lg:bg-transparent dark:bg-slate-800 lg:dark:bg-transparent px-1">
                                    Time
                                </label>
                            </div>
                        </div>

                        {/* Type Select */}
                        <div className="relative">
                            <select 
                                id="v_type" 
                                value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                                className="block w-full px-4 pt-6 pb-2 text-sm text-slate-900 bg-transparent border border-slate-300 rounded-xl appearance-none dark:text-white dark:border-slate-600 shadow-sm focus:outline-none focus:ring-0 focus:border-violet-500 transition-all peer"
                            >
                                <option value="one-on-one" className="dark:bg-slate-800">One-on-One with Librarian</option>
                                <option value="group" className="dark:bg-slate-800">Group Study Session</option>
                            </select>
                            <label htmlFor="v_type" className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 bg-white lg:bg-transparent dark:bg-slate-800 lg:dark:bg-transparent px-1">
                                Session Type
                            </label>
                        </div>
                        
                        <button 
                            type="submit" disabled={submitting}
                            className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 btn-shimmer group flex justify-center items-center gap-2"
                        >
                            {submitting ? 'Submitting...' : (
                                <>
                                    Submit Request <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* ══════════════════════════════════════════
                    SESSIONS LIST
                   ══════════════════════════════════════════ */}
                <div ref={listsRef} className="space-y-8">
                    
                    {/* Upcoming Sessions */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full inline-block" />
                            Upcoming Meetings
                        </h3>
                        {upcoming.length === 0 ? (
                            <div className="glass-card rounded-2xl p-6 text-center border-dashed border-2 border-slate-200 dark:border-slate-700">
                                <p className="text-sm text-slate-500 dark:text-slate-400">No scheduled sessions</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcoming.map(s => (
                                    <div key={s._id} className="reveal-child bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 hover-lift">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-slate-800 dark:text-white text-lg">{s.topic}</h4>
                                            <StatusBadge status={s.status} />
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4 bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                                            <span className="flex items-center gap-1.5 font-medium"><Calendar className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> {new Date(s.preferredDate).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5 font-medium"><Clock className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> {s.preferredTime}</span>
                                            {s.hostName && <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-slate-400" /> {s.hostName}</span>}
                                        </div>

                                        {s.meetingLink && (
                                            <a 
                                                href={s.meetingLink} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all hover:scale-105"
                                            >
                                                <VideoIcon className="h-4 w-4" /> Join Video Call
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pending Requests */}
                    {pending.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full inline-block" />
                                Pending Requests
                            </h3>
                            <div className="space-y-3">
                                {pending.map(s => (
                                    <div key={s._id} className="reveal-child glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-sm text-slate-800 dark:text-white">{s.topic}</h4>
                                            <StatusBadge status="pending" />
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {new Date(s.preferredDate).toLocaleDateString()} at {s.preferredTime}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoPage;
