import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Plus, Edit, Trash2, Search, BookOpen } from 'lucide-react';

const emptyBook = { title: '', authors: [''], publisher: '', year: 2024, isbn: '', edition: '', subject: [''], department: ['CSE'], yearLevel: [1], totalCopies: 1, availableCopies: 1, description: '', ebookLink: '', isEbook: false };

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editBook, setEditBook] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchBooks = () => {
    API.get('/books', { params: { search, limit: 50 } }).then(res => setBooks(res.data.books || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { const t = setTimeout(fetchBooks, 300); return () => clearTimeout(t); }, [search]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...editBook, authors: editBook.authors.filter(a => a), subject: editBook.subject.filter(s => s) };
      if (editBook._id) {
        await API.put(`/books/${editBook._id}`, data);
      } else {
        data.availableCopies = data.totalCopies;
        await API.post('/books', data);
      }
      setEditBook(null);
      fetchBooks();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/books/${deleteId}`);
      setDeleteId(null);
      fetchBooks();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8 overflow-auto page-enter">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manage Books</h1>
          <button onClick={() => setEditBook({ ...emptyBook })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> Add Book
          </button>
        </div>

        <div className="flex bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
          <div className="pl-4 flex items-center"><Search className="h-5 w-5 text-slate-400" /></div>
          <input type="text" placeholder="Search books..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none focus:ring-0 px-4 py-2.5 w-full outline-none text-slate-700 dark:text-slate-200 text-sm" />
        </div>

        {loading ? <Spinner /> : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50">
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Authors</th>
                  <th className="p-4 font-medium">Dept</th>
                  <th className="p-4 font-medium">Copies</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book._id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-slate-800 dark:text-white max-w-xs truncate">{book.title}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{book.authors?.join(', ')}</td>
                    <td className="p-4 text-slate-500">{book.department?.join(', ')}</td>
                    <td className="p-4"><span className={book.availableCopies > 0 ? 'text-emerald-600' : 'text-red-500'}>{book.availableCopies}/{book.totalCopies}</span></td>
                    <td className="p-4">{book.isEbook ? '📱 E-Book' : '📖 Physical'}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => setEditBook({ ...book, authors: book.authors || [''], subject: book.subject || [''] })}
                          className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteId(book._id)}
                          className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors">
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

        {/* Edit Modal */}
        <Modal isOpen={!!editBook} onClose={() => setEditBook(null)} title={editBook?._id ? 'Edit Book' : 'Add New Book'} size="lg">
          {editBook && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Title</label>
                  <input value={editBook.title} onChange={e => setEditBook({...editBook, title: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Authors (comma separated)</label>
                  <input value={editBook.authors?.join(', ')} onChange={e => setEditBook({...editBook, authors: e.target.value.split(',').map(a => a.trim())})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Publisher</label>
                  <input value={editBook.publisher} onChange={e => setEditBook({...editBook, publisher: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Year</label>
                  <input type="number" value={editBook.year} onChange={e => setEditBook({...editBook, year: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">ISBN</label>
                  <input value={editBook.isbn} onChange={e => setEditBook({...editBook, isbn: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Edition</label>
                  <input value={editBook.edition} onChange={e => setEditBook({...editBook, edition: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Subjects (comma separated)</label>
                  <input value={editBook.subject?.join(', ')} onChange={e => setEditBook({...editBook, subject: e.target.value.split(',').map(s => s.trim())})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Department</label>
                  <input value={editBook.department?.join(', ')} onChange={e => setEditBook({...editBook, department: e.target.value.split(',').map(d => d.trim())})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Total Copies</label>
                  <input type="number" value={editBook.totalCopies} onChange={e => setEditBook({...editBook, totalCopies: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Available Copies</label>
                  <input type="number" value={editBook.availableCopies} onChange={e => setEditBook({...editBook, availableCopies: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Description</label>
                  <textarea value={editBook.description} onChange={e => setEditBook({...editBook, description: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm resize-none" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">E-Book Link (optional)</label>
                  <input value={editBook.ebookLink} onChange={e => setEditBook({...editBook, ebookLink: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={editBook.isEbook} onChange={e => setEditBook({...editBook, isEbook: e.target.checked})} className="rounded" />
                  <label className="text-sm text-slate-700 dark:text-slate-300">This is an E-Book</label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditBook(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Book'}
                </button>
              </div>
            </div>
          )}
        </Modal>

        <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
          title="Delete Book" message="Are you sure you want to delete this book? This action cannot be undone." confirmText="Delete" danger />
      </div>
    </div>
  );
};

export default ManageBooks;
