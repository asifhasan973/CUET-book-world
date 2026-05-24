/**
 * Navbar — Premium glassmorphism navigation bar with scroll-aware blur,
 * animated gradient logo, notification bell with bounce, and user dropdown.
 *
 * @component
 * Features:
 * - Glassmorphism background that intensifies on scroll
 * - Gradient text logo with hover animation
 * - Active link with sliding indicator
 * - Notification bell with bounce animation
 * - User avatar with animated gradient ring
 * - Smooth mobile menu with staggered link entrance
 */
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen, Bell, Moon, Sun, User, Menu, X,
  LogOut, Settings, LayoutDashboard, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';

/* ── Navigation link definitions ── */
const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/books', label: 'Book List' },
  { to: '/ebooks', label: 'E-Books' },
  { to: '/renew', label: 'Renew' },
];

/** Scroll threshold (px) for compact navbar style */
const SCROLL_THRESHOLD = 20;

/** Polling interval for notifications (ms) */
const NOTIFICATION_POLL_INTERVAL = 30_000;

const Navbar = () => {
  const { user, dbUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  /* ── Scroll detection for glassmorphism intensity ── */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Fetch unread notification count ── */
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }

    const fetchCount = async () => {
      try {
        const res = await API.get('/notifications');
        setUnreadCount(res.data.filter((n) => !n.read).length);
      } catch { /* silently fail */ }
    };

    fetchCount();
    const interval = setInterval(fetchCount, NOTIFICATION_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [user]);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Close mobile menu on route change ── */
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'glass-navbar shadow-lg border-indigo-100/50 dark:border-indigo-900/30'
          : 'bg-white/95 dark:bg-slate-900/95 border-slate-100 dark:border-slate-800'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="CUET Bookworld Home">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-lg group-hover:bg-indigo-500/30 transition-all" />
              <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400 relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xl font-bold gradient-text">
              CUET Bookworld
            </span>
          </Link>

          {/* ── Desktop Navigation Links ── */}
          <div className="hidden md:flex items-center gap-1" role="menubar">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                role="menuitem"
                className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 text-sm ${
                  isActive(link.to)
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* ── Right Side Actions ── */}
          <div className="flex items-center gap-1.5">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2.5 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-800 transition-all duration-300"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark'
                ? <Sun className="h-5 w-5 transition-transform hover:rotate-45" />
                : <Moon className="h-5 w-5 transition-transform hover:-rotate-12" />
              }
            </button>

            {user ? (
              <>
                {/* Notification Bell */}
                <Link
                  to="/profile?tab=notifications"
                  className="flex items-center justify-center p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800 transition-all"
                  onClick={() => setUnreadCount(0)}
                  aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                  <div className="relative flex items-center justify-center">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1 shadow-lg shadow-red-500/30">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full opacity-75 group-hover:opacity-100 animate-gradient" style={{ backgroundSize: '200% 200%' }} />
                      <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                        {(dbUser?.name || user.email)?.[0]?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-400 hidden sm:block transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 glass-card rounded-2xl shadow-2xl py-2 z-50 modal-content">
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
                        <p className="font-semibold text-sm text-slate-800 dark:text-white">{dbUser?.name || 'User'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 text-indigo-700 dark:text-indigo-300">
                          {dbUser?.role || 'student'}
                        </span>
                      </div>

                      {/* Menu items */}
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors">
                        <User className="h-4 w-4" /> My Profile
                      </Link>

                      {dbUser?.role === 'student' && (
                        <Link to="/home" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors">
                          <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </Link>
                      )}

                      {(dbUser?.role === 'librarian' || dbUser?.role === 'admin') && (
                        <Link
                          to={dbUser.role === 'admin' ? '/admin/dashboard' : '/librarian/dashboard'}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          {dbUser.role === 'admin' ? 'Admin Panel' : 'Librarian Dashboard'}
                        </Link>
                      )}

                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors">
                        <Settings className="h-4 w-4" /> Settings
                      </Link>

                      <div className="border-t border-slate-100 dark:border-slate-700/50 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 w-full transition-colors"
                        >
                          <LogOut className="h-4 w-4" /> Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 btn-primary btn-shimmer px-5 py-2 rounded-xl text-sm shadow-lg shadow-indigo-500/25"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-1 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95">
          {NAV_LINKS.map((link, index) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                isActive(link.to)
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
