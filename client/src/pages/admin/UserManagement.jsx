import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Search, Shield, Trash2, UserCheck, UserX } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);

  const fetchUsers = () => {
    API.get('/users', { params: { search, role: roleFilter } })
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { const t = setTimeout(fetchUsers, 300); return () => clearTimeout(t); }, [search, roleFilter]);

  const changeRole = async (id, role) => {
    try { await API.put(`/users/${id}/role`, { role }); fetchUsers(); }
    catch (err) { console.error(err); }
  };

  const changeStatus = async (id, status) => {
    try { await API.put(`/users/${id}/status`, { status }); fetchUsers(); }
    catch (err) { console.error(err); }
  };

  const deleteUser = async () => {
    try { await API.delete(`/users/${deleteId}`); setDeleteId(null); fetchUsers(); }
    catch (err) { console.error(err); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar role="admin" />
      <div className="flex-1 p-6 lg:p-8 overflow-auto page-enter">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">User Management</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
            <div className="pl-4 flex items-center"><Search className="h-5 w-5 text-slate-400" /></div>
            <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none focus:ring-0 px-4 py-2.5 w-full outline-none text-slate-700 dark:text-slate-200 text-sm" />
          </div>
          <div className="flex gap-2">
            {['all', 'student', 'librarian', 'admin'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${roleFilter === r ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {loading ? <Spinner /> : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Department</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-slate-800 dark:text-white">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{u.department} • {u.year}</td>
                    <td className="p-4">
                      <select value={u.role} onChange={e => changeRole(u._id, e.target.value)}
                        className="bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-xs font-medium capitalize">
                        <option value="student">Student</option>
                        <option value="librarian">Librarian</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4"><StatusBadge status={u.status} /></td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {u.status === 'active' ? (
                          <button onClick={() => changeStatus(u._id, 'suspended')} title="Suspend"
                            className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 hover:bg-amber-200 transition-colors">
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : (
                          <button onClick={() => changeStatus(u._id, 'active')} title="Activate"
                            className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 transition-colors">
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => setDeleteId(u._id)} title="Delete"
                          className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={deleteUser}
          title="Delete User" message="This will permanently delete this user account." confirmText="Delete" danger />
      </div>
    </div>
  );
};

export default UserManagement;
