import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { Users, BookOpen, BookMarked, DollarSign, AlertTriangle, ShieldCheck, Plus, Trash2, Pin } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '' });
  const [adding, setAdding] = useState(false);

  const fetchData = async () => {
    try {
      const [s, a] = await Promise.all([
        API.get('/stats'),
        API.get('/announcements?all=true'),
      ]);
      setStats(s.data);
      setAnnouncements(a.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const addAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) return;
    setAdding(true);
    try {
      await API.post('/announcements', newAnnouncement);
      setNewAnnouncement({ title: '', message: '' });
      fetchData();
    } catch (err) { console.error(err); }
    finally { setAdding(false); }
  };

  const deleteAnnouncement = async (id) => {
    try {
      await API.delete(`/announcements/${id}`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const setHomeAnnouncement = async (id) => {
    try {
      await API.put(`/announcements/${id}/show-on-home`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar role="admin" />
      <div className="flex-1 p-6 lg:p-8 overflow-auto page-enter">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Admin Dashboard</h1>

        {loading ? <Spinner /> : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              <StatCard icon={<Users className="h-5 w-5 text-blue-500" />} label="Total Users" value={stats.totalUsers || 0} />
              <StatCard icon={<ShieldCheck className="h-5 w-5 text-amber-500" />} label="Pending Approvals" value={stats.pendingUsers || 0} />
              <StatCard icon={<BookOpen className="h-5 w-5 text-emerald-500" />} label="Total Books" value={stats.totalBooks || 0} />
              <StatCard icon={<BookMarked className="h-5 w-5 text-purple-500" />} label="E-Books" value={stats.totalEbooks || 0} />
              <StatCard icon={<AlertTriangle className="h-5 w-5 text-red-500" />} label="Active Borrows" value={stats.activeBorrows || 0} />
              <StatCard icon={<DollarSign className="h-5 w-5 text-amber-600" />} label="Total Fines" value={`${stats.totalFines || 0} Tk`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Popular Books */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Most Borrowed Books</h2>
                {stats.popularBooks?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.popularBooks.map((b, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                          <span className="text-sm font-medium text-slate-800 dark:text-white">{b.title}</span>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{b.count} borrows</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-500 text-center py-4">No data yet</p>}
              </div>

              {/* Announcements */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Announcements</h2>
                <div className="space-y-2 mb-4">
                  <input value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm" placeholder="Title" />
                  <textarea value={newAnnouncement.message} onChange={e => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm resize-none" rows={2} placeholder="Message" />
                  <button onClick={addAnnouncement} disabled={adding}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {announcements.map(a => (
                    <div key={a._id} className="flex justify-between items-start p-3 border border-slate-100 dark:border-slate-700 rounded-xl">
                      <div>
                        <p className="font-medium text-sm text-slate-800 dark:text-white">{a.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{a.message}</p>
                        {a.showOnHome && (
                          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/40">
                            <Pin className="h-3 w-3" /> Shown on Home
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setHomeAnnouncement(a._id)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                            a.showOnHome
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40'
                          }`}
                          title="Show this announcement on Home page"
                        >
                          <Pin className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteAnnouncement(a._id)} className="p-1 text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
    <div className="flex justify-center mb-2">{icon}</div>
    <p className="text-xl font-bold text-slate-800 dark:text-white">{value}</p>
    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
  </div>
);

export default AdminDashboard;
