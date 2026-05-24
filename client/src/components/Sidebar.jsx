/**
 * Sidebar — Premium admin/librarian navigation sidebar with gradient
 * backgrounds, glowing active states, and smooth collapse animation.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.role] - Override role ('admin' | 'librarian')
 */
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, LayoutDashboard, BookMarked, Users, FileText,
  Upload, ChevronLeft, ChevronRight, LogOut, Moon, Sun,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

/* ── Navigation link definitions ── */
const LIBRARIAN_LINKS = [
  { to: '/librarian/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/librarian/books', icon: BookMarked, label: 'Manage Books' },
  { to: '/librarian/ebooks', icon: Upload, label: 'E-Books' },
  { to: '/librarian/students', icon: Users, label: 'Students' },
  { to: '/librarian/reports', icon: FileText, label: 'Reports' },
];

const ADMIN_LINKS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/analytics', icon: FileText, label: 'Analytics' },
  { to: '/librarian/books', icon: BookMarked, label: 'Manage Books' },
  { to: '/librarian/ebooks', icon: Upload, label: 'E-Books' },
  { to: '/librarian/students', icon: Users, label: 'Students' },
];

const Sidebar = ({ role: roleProp }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { dbUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const role = roleProp || dbUser?.role || 'librarian';
  const links = role === 'admin' ? ADMIN_LINKS : LIBRARIAN_LINKS;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside
      className={`${collapsed ? 'w-[72px]' : 'w-64'} min-h-screen transition-all duration-300 ease-in-out flex flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-[#0a0e1a]`}
      role="navigation"
      aria-label="Admin sidebar"
    >
      {/* ── Header ── */}
      <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-lg blur-md" />
              <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400 relative z-10" />
            </div>
            <span className="font-bold text-sm gradient-text">
              {role === 'admin' ? 'Admin Panel' : 'Librarian'}
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-all"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* ── User Info ── */}
      {!collapsed && dbUser && (
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full opacity-70" />
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                {dbUser.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{dbUser.name}</p>
              <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                role === 'admin'
                  ? 'bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 text-violet-700 dark:text-violet-300'
                  : 'bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-700 dark:text-emerald-300'
              }`}>{role}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation Links ── */}
      <nav className="flex-1 p-2 space-y-1" aria-label="Sidebar navigation">
        {links.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to + link.label}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/50 dark:to-violet-950/30 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
              title={collapsed ? link.label : ''}
            >
              {/* Active indicator bar */}
              {active && (
                <span className="absolute left-0 w-1 h-6 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-r-full" />
              )}
              <Icon className={`h-5 w-5 flex-shrink-0 transition-transform ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer Actions ── */}
      <div className="p-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all w-full"
          title={collapsed ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : ''}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 flex-shrink-0" /> : <Moon className="h-5 w-5 flex-shrink-0" />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
          title={collapsed ? 'Back to Site' : ''}
        >
          <BookOpen className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Back to Site</span>}
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all w-full"
          title={collapsed ? 'Log Out' : ''}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
