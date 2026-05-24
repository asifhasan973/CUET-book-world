import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { Search, Trash2, Minus, Plus } from 'lucide-react';

const StudentRecords = () => {
  const { dbUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [selectedName, setSelectedName] = useState('');
  const [borrows, setBorrows] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [fineUpdatingId, setFineUpdatingId] = useState(null);
  const [fineDrafts, setFineDrafts] = useState({});
  const { addToast } = useToast();

  const updateStudentFineBalance = (userId, nextBorrows) => {
    const fineBalance = nextBorrows.reduce((sum, borrow) => sum + Number(borrow.fine || 0), 0);
    setStudents(prev => prev.map(student => (
      student._id === userId ? { ...student, fineBalance } : student
    )));
  };

  useEffect(() => {
    const t = setTimeout(() => {
      API.get('/users/students', { params: { search } })
        .then(res => setStudents(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const viewBorrows = async (userId, name) => {
    setSelected(userId);
    setSelectedName(name);
    setBorrows([]); // Clear while loading optional
    try {
      const res = await API.get(`/users/${userId}/borrows`);
      setBorrows(res.data);
      setFineDrafts(Object.fromEntries(res.data.map(borrow => [borrow._id, Number(borrow.fine || 0)])));
      updateStudentFineBalance(userId, res.data);
    } catch (err) { 
        console.error(err); 
        addToast(err.response?.data?.message || 'Failed to fetch borrowing history', 'error');
    }
  };

  const handleDeleteBorrow = async (borrowId) => {
    if (!window.confirm('Remove this borrow record? The book copy will be restored.')) return;
    setDeletingId(borrowId);
    try {
      await API.delete(`/users/${selected}/borrows/${borrowId}`);
      setBorrows(prev => {
        const next = prev.filter(b => b._id !== borrowId);
        updateStudentFineBalance(selected, next);
        return next;
      });
      addToast('Borrow record successfully removed', 'success');
    } catch (err) { 
        console.error(err); 
        addToast(err.response?.data?.message || 'Failed to remove borrow record', 'error');
    }
    finally { setDeletingId(null); }
  };

  const handleFineUpdate = async (borrowId, fine) => {
    const nextFine = Math.max(0, Math.round(Number(fine) || 0));
    setFineUpdatingId(borrowId);
    try {
      const res = await API.put(`/users/${selected}/borrows/${borrowId}/fine`, {
        fine: nextFine,
        reason: 'Fine adjusted by librarian',
      });
      setBorrows(prev => {
        const next = prev.map(borrow => (borrow._id === borrowId ? res.data.borrow : borrow));
        updateStudentFineBalance(selected, next);
        return next;
      });
      setFineDrafts(prev => ({ ...prev, [borrowId]: nextFine }));
      addToast('Fine updated successfully', 'success');
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to update fine', 'error');
    } finally {
      setFineUpdatingId(null);
    }
  };

  const isAdmin = dbUser?.role === 'admin';
  const canManageFines = ['librarian', 'admin'].includes(dbUser?.role);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8 overflow-auto page-enter">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Student Records</h1>

        <div className="flex bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
          <div className="pl-4 flex items-center"><Search className="h-5 w-5 text-slate-400" /></div>
          <input type="text" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none focus:ring-0 px-4 py-2.5 w-full outline-none text-slate-700 dark:text-slate-200 text-sm" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student List */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {loading ? <Spinner size="sm" /> : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {students.length === 0 && (
                  <p className="text-sm text-slate-500 p-6 text-center">No students found</p>
                )}
                {students.map(s => (
                  <button key={s._id} onClick={() => viewBorrows(s._id, s.name)}
                    className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3 ${selected === s._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {s.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 dark:text-white">{s.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{s.studentId} • {s.department} • {s.year}</p>
                      <p className={`text-xs mt-1 font-semibold ${Number(s.fineBalance || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        Fine: {Number(s.fineBalance || 0)} Tk
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Borrow History Panel */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {selected ? `${selectedName}'s Borrows` : 'Borrowing History'}
              </h2>
              {isAdmin && selected && (
                <span className="text-xs text-slate-500 dark:text-slate-400">Admin: click 🗑 to remove a borrow</span>
              )}
            </div>
            {!selected ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">Select a student to view their history</p>
            ) : borrows.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">No borrowing records</p>
            ) : (
              <div className="space-y-3">
                {borrows.map(b => {
                  const now = new Date();
                  const dueDate = new Date(b.dueDate);
                  const isOverdue = (b.status === 'active' || b.status === 'overdue') && dueDate < now;
                  const daysLate = isOverdue ? Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24)) : 0;
                  return (
                    <div key={b._id} className="p-3 border border-slate-100 dark:border-slate-700 rounded-xl">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-800 dark:text-white truncate">{b.bookId?.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Due: {dueDate.toLocaleDateString()}
                            {isOverdue && <span className="text-red-500 ml-2">• {daysLate}d late</span>}
                          </p>
                          <p className={`text-xs mt-1 font-semibold ${Number(b.fine || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            Current Fine: {Number(b.fine || 0)} Tk{b.fineReason ? ` - ${b.fineReason}` : ''}
                          </p>
                          {canManageFines && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => handleFineUpdate(b._id, Number(b.fine || 0) - 10)}
                                disabled={fineUpdatingId === b._id}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                              >
                                <Minus className="h-3 w-3" /> 10
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={fineDrafts[b._id] ?? Number(b.fine || 0)}
                                onChange={(e) => setFineDrafts(prev => ({ ...prev, [b._id]: e.target.value }))}
                                className="w-24 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200"
                                aria-label="Fine amount"
                              />
                              <button
                                onClick={() => handleFineUpdate(b._id, fineDrafts[b._id] ?? b.fine)}
                                disabled={fineUpdatingId === b._id}
                                className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                              >
                                Apply
                              </button>
                              <button
                                onClick={() => handleFineUpdate(b._id, Number(b.fine || 0) + 10)}
                                disabled={fineUpdatingId === b._id}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                              >
                                <Plus className="h-3 w-3" /> 10
                              </button>
                              <button
                                onClick={() => handleFineUpdate(b._id, 0)}
                                disabled={fineUpdatingId === b._id}
                                className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 disabled:opacity-50"
                              >
                                Clear
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <StatusBadge status={isOverdue ? 'overdue' : b.status} />
                          {/* Admin-only delete button — only for active/pending/overdue borrows */}
                          {isAdmin && ['active', 'pending', 'overdue'].includes(b.status) && (
                            <button
                              onClick={() => handleDeleteBorrow(b._id)}
                              disabled={deletingId === b._id}
                              className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors disabled:opacity-50"
                              title="Remove this borrow (admin)"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRecords;
