import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { BookOpen, Users, Clock, AlertTriangle, CheckCircle, XCircle, BookMarked, Video, ExternalLink, Calendar } from 'lucide-react';

const LibrarianDashboard = () => {
  const [stats, setStats] = useState({});
  const [pendingBorrows, setPendingBorrows] = useState([]);
  const [pendingRenewals, setPendingRenewals] = useState([]);
  const [approvedRenewals, setApprovedRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [approveModal, setApproveModal] = useState({ open: false, renewal: null });
  const [scheduleForm, setScheduleForm] = useState({ scheduledDate: '', scheduledTime: '' });
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const [s, b, r] = await Promise.all([
        API.get('/stats'),
        API.get('/borrows/all?status=pending'),
        API.get('/renewals'),
      ]);
      setStats(s.data);
      setPendingBorrows(b.data);
      setPendingRenewals(r.data.filter(x => x.status === 'pending'));
      setApprovedRenewals(r.data.filter(x => x.status === 'approved'));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBorrowAction = async (id, action) => {
    setActionLoading(id);
    try {
      await API.put(`/borrows/${id}/${action}`);
      addToast(`Borrow request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`, 'success');
      fetchData();
    } catch (err) { 
      console.error(err); 
      addToast(err.response?.data?.message || `Failed to ${action} request`, 'error');
    }
    finally { setActionLoading(''); }
  };

  const openApproveModal = (renewal) => {
    setApproveModal({ open: true, renewal });
    setScheduleForm({
      scheduledDate: renewal.preferredDate ? new Date(renewal.preferredDate).toISOString().split('T')[0] : '',
      scheduledTime: renewal.preferredTime || '10:00 AM',
    });
  };

  const handleApproveRenewal = async () => {
    if (!approveModal.renewal) return;
    setActionLoading(approveModal.renewal._id);
    try {
      const res = await API.put(`/renewals/${approveModal.renewal._id}/approve`, scheduleForm);
      setApproveModal({ open: false, renewal: null });
      addToast('Renewal approved & meeting scheduled', 'success');
      fetchData();
    } catch (err) { 
      console.error(err); 
      addToast(err.response?.data?.message || 'Failed to approve renewal', 'error');
    }
    finally { setActionLoading(''); }
  };

  const handleRejectRenewal = async (id) => {
    setActionLoading(id);
    try {
      await API.put(`/renewals/${id}/reject`);
      addToast('Renewal rejected', 'success');
      fetchData();
    } catch (err) { 
      console.error(err); 
      addToast(err.response?.data?.message || 'Failed to reject renewal', 'error');
    }
    finally { setActionLoading(''); }
  };

  const handleCompleteRenewal = async (id) => {
    setActionLoading(id);
    try {
      await API.put(`/renewals/${id}/complete`);
      addToast('Renewal completed and due date extended', 'success');
      fetchData();
    } catch (err) { 
      console.error(err); 
      addToast(err.response?.data?.message || 'Failed to complete renewal', 'error');
    }
    finally { setActionLoading(''); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8 overflow-auto page-enter">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Librarian Dashboard</h1>

        {loading ? <Spinner /> : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard icon={<BookOpen className="h-6 w-6 text-blue-500" />} label="Total Books" value={stats.totalBooks || 0} />
              <StatCard icon={<BookMarked className="h-6 w-6 text-emerald-500" />} label="Active Borrows" value={stats.activeBorrows || 0} />
              <StatCard icon={<Clock className="h-6 w-6 text-amber-500" />} label="Pending Requests" value={stats.pendingBorrows || 0} />
              <StatCard icon={<AlertTriangle className="h-6 w-6 text-red-500" />} label="Overdue" value={stats.overdueBorrows || 0} />
              <StatCard icon={<Users className="h-6 w-6 text-purple-500" />} label="Active Students" value={stats.activeStudents || 0} />
            </div>

            {/* Pending Borrow Requests */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Pending Borrow Requests</h2>
              {pendingBorrows.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">No pending requests!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                        <th className="pb-3 font-medium">Student</th>
                        <th className="pb-3 font-medium">Book</th>
                        <th className="pb-3 font-medium">Department</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingBorrows.map(b => (
                        <tr key={b._id} className="border-b border-slate-100 dark:border-slate-700/50">
                          <td className="py-3">
                            <p className="font-medium text-slate-800 dark:text-white">{b.userId?.name}</p>
                            <p className="text-xs text-slate-500">{b.userId?.studentId}</p>
                          </td>
                          <td className="py-3 text-slate-700 dark:text-slate-300">{b.bookId?.title}</td>
                          <td className="py-3 text-slate-500">{b.userId?.department}</td>
                          <td className="py-3 text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button onClick={() => handleBorrowAction(b._id, 'approve')} disabled={actionLoading === b._id}
                                className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 transition-colors disabled:opacity-50">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleBorrowAction(b._id, 'reject')} disabled={actionLoading === b._id}
                                className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors disabled:opacity-50">
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pending Renewal Requests */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Pending Renewal Requests</h2>
              {pendingRenewals.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">No pending renewals!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                        <th className="pb-3 font-medium">Student</th>
                        <th className="pb-3 font-medium">Book</th>
                        <th className="pb-3 font-medium">Preferred Date</th>
                        <th className="pb-3 font-medium">Time</th>
                        <th className="pb-3 font-medium">Notes</th>
                        <th className="pb-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRenewals.map(r => (
                        <tr key={r._id} className="border-b border-slate-100 dark:border-slate-700/50">
                          <td className="py-3">
                            <p className="font-medium text-slate-800 dark:text-white">{r.userId?.name}</p>
                            <p className="text-xs text-slate-500">{r.userId?.studentId} • {r.userId?.department}</p>
                          </td>
                          <td className="py-3 text-slate-700 dark:text-slate-300">{r.borrowId?.bookId?.title}</td>
                          <td className="py-3 text-slate-500">{r.preferredDate ? new Date(r.preferredDate).toLocaleDateString() : 'N/A'}</td>
                          <td className="py-3 text-slate-500">{r.preferredTime}</td>
                          <td className="py-3 text-slate-500 max-w-[150px] truncate">{r.notes || '--'}</td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button onClick={() => openApproveModal(r)} disabled={actionLoading === r._id}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 transition-colors text-xs font-medium disabled:opacity-50">
                                <Video className="h-3.5 w-3.5" /> Approve & Schedule
                              </button>
                              <button onClick={() => handleRejectRenewal(r._id)} disabled={actionLoading === r._id}
                                className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors disabled:opacity-50">
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Scheduled Consultations — Awaiting Decision */}
            {approvedRenewals.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-emerald-200 dark:border-emerald-800 mb-8">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Video className="h-5 w-5 text-emerald-500" />
                  Scheduled Consultations — Awaiting Decision
                </h2>
                <div className="space-y-4">
                  {approvedRenewals.map(r => (
                    <div key={r._id} className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div>
                          <h3 className="font-semibold text-sm text-slate-800 dark:text-white">{r.userId?.name} — {r.borrowId?.bookId?.title}</h3>
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : '--'}
                            </span>
                            <span>{r.scheduledTime || r.preferredTime}</span>
                          </div>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1.5 font-medium">
                            After holding the video consultation, choose an action below:
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {/* 1. Join Meeting */}
                          {r.meetingLink && (
                            <a href={r.meetingLink} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-medium">
                              <Video className="h-3.5 w-3.5" /> Join Meeting
                            </a>
                          )}
                          {/* 2. Approve Renew — extends due date by 30 days */}
                          <button onClick={() => handleCompleteRenewal(r._id)} disabled={actionLoading === r._id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs font-medium disabled:opacity-50">
                            <CheckCircle className="h-3.5 w-3.5" /> Approve Renew (+30 days)
                          </button>
                          {/* 3. Reject — does not extend due date */}
                          <button onClick={() => handleRejectRenewal(r._id)} disabled={actionLoading === r._id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors text-xs font-medium disabled:opacity-50">
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Approve & Schedule Modal */}
      <Modal isOpen={approveModal.open} onClose={() => setApproveModal({ open: false, renewal: null })} title="Approve & Schedule Meeting" size="sm">
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="font-semibold text-slate-800 dark:text-white text-sm">{approveModal.renewal?.userId?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{approveModal.renewal?.borrowId?.bookId?.title}</p>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-700 dark:text-blue-300">
            <p className="flex items-center gap-1.5 font-medium">
              <Video className="h-4 w-4" /> A unique video meeting link will be auto-generated
            </p>
            <p className="text-xs mt-1 text-blue-600 dark:text-blue-400">The student will be notified and can join the meeting from their Renew page.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Meeting Date</label>
            <input type="date" value={scheduleForm.scheduledDate} onChange={e => setScheduleForm({...scheduleForm, scheduledDate: e.target.value})}
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Meeting Time</label>
            <select value={scheduleForm.scheduledTime} onChange={e => setScheduleForm({...scheduleForm, scheduledTime: e.target.value})}
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent dark:bg-slate-800 text-sm">
              {['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setApproveModal({ open: false, renewal: null })} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
              Cancel
            </button>
            <button onClick={handleApproveRenewal} disabled={actionLoading === approveModal.renewal?._id}
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
              <Video className="h-4 w-4" />
              {actionLoading === approveModal.renewal?._id ? 'Approving...' : 'Approve & Generate Link'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  </div>
);

export default LibrarianDashboard;
