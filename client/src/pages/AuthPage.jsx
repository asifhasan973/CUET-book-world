/**
 * AuthPage — Premium authentication page with animated gradient mesh,
 * floating 3D glassmorphism shapes, shimmer submit button, and
 * smooth role switching with sliding indicator.
 *
 * @component
 * Features:
 * - Left pane: animated gradient background with floating shapes & parallax
 * - Right pane: glass card form with gradient border glow
 * - Role switch: smooth sliding indicator between Student/Librarian
 * - Input focus: gradient underline animation
 * - Submit button: gradient with shimmer sweep
 * - Error: shake animation on error messages
 * - Google login: branded hover with lift effect
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, User, Eye, EyeOff, Lock, Mail, ChevronLeft,
  BookMarked, RefreshCw, Video, Smartphone, GraduationCap, Library,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CUET_EMAIL_DOMAIN_MESSAGE } from '../utils/emailDomain';

/* ── Department list for registration ── */
const DEPARTMENTS = ['CSE', 'EEE', 'CE', 'ME', 'URP', 'ECE', 'MSE', 'PME', 'WRE', 'Architecture'];
const YEARS = ['1st', '2nd', '3rd', '4th', 'Faculty'];

/* ── Feature lists for left pane ── */
const STUDENT_FEATURES = [
  { icon: BookMarked, text: 'Borrow & manage physical books online' },
  { icon: Smartphone, text: 'Read e-books anywhere on any device' },
  { icon: RefreshCw, text: 'Quick & easy book renewal system' },
  { icon: Video, text: 'Video consultations with librarians' },
];

const LIBRARIAN_FEATURES = [
  { icon: BookMarked, text: 'Manage books, borrows & students' },
  { icon: RefreshCw, text: 'Approve renewals with one click' },
  { icon: Video, text: 'Auto-generated video meeting links' },
];

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle } = useAuth();

  const [loginRole, setLoginRole] = useState('student');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '', studentId: '', department: 'CSE',
    year: '1st', email: '', password: '',
  });

  /* ── Handlers ── */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRoleSwitch = (role) => {
    setLoginRole(role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const profile = await login(formData.email, formData.password);
        if (profile?.role === 'admin') navigate('/admin/dashboard');
        else if (profile?.role === 'librarian') navigate('/librarian/dashboard');
        else navigate('/home');
      } else {
        await register({
          name: formData.name, email: formData.email,
          password: formData.password, studentId: formData.studentId,
          department: formData.department, year: formData.year,
          requestedRole: loginRole,
        });
        if (loginRole === 'librarian') navigate('/librarian/dashboard');
        else navigate('/home');
      }
    } catch (err) {
      const code = err.code;
      if (code === 'auth/user-not-found') setError('No account found with this email.');
      else if (code === 'auth/wrong-password') setError('Incorrect password.');
      else if (code === 'auth/invalid-credential') setError('Invalid email or password.');
      else if (code === 'auth/email-already-in-use') setError('An account with this email already exists.');
      else if (code === 'auth/weak-password') setError('Password must be at least 6 characters.');
      else if (code === 'auth/unauthorized-domain') setError(CUET_EMAIL_DOMAIN_MESSAGE);
      else setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const profile = await loginWithGoogle(isLogin ? undefined : loginRole);
      if (profile?.role === 'admin') navigate('/admin/dashboard');
      else if (profile?.role === 'librarian') navigate('/librarian/dashboard');
      else navigate('/home');
    } catch (err) {
      if (err.code === 'auth/unauthorized-domain') {
        setError(CUET_EMAIL_DOMAIN_MESSAGE);
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isLibrarian = !isLogin && loginRole === 'librarian';
  const features = isLibrarian ? LIBRARIAN_FEATURES : STUDENT_FEATURES;

  return (
    <div className="min-h-screen flex text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#0a0e1a]">

      {/* ══════════════════════════════════════════
          LEFT PANE — Rich Visual Design
         ══════════════════════════════════════════ */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className={`absolute inset-0 transition-all duration-700 ${
          isLibrarian
            ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-900'
            : 'bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-900'
        }`} />

        {/* Animated floating shapes */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="animate-float absolute top-[10%] left-[10%] w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 rotate-12" />
          <div className="animate-float-delayed absolute top-[60%] left-[15%] w-24 h-24 rounded-2xl bg-amber-400/15 backdrop-blur-sm border border-amber-400/20 -rotate-6" />
          <div className="animate-float-slow absolute top-[25%] right-[10%] w-40 h-40 rounded-full bg-white/5 backdrop-blur-sm border border-white/10" />
          <div className="animate-float absolute bottom-[15%] right-[20%] w-28 h-28 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 rotate-45" />
          <div className="animate-float-delayed absolute top-[45%] left-[50%] w-16 h-16 rounded-xl bg-amber-300/10 backdrop-blur-sm border border-amber-300/15 rotate-12" />

          {/* Book icon decorations */}
          <div className="animate-float-slow absolute top-[15%] right-[25%] text-white/15">
            <BookOpen className="w-20 h-20" />
          </div>
          <div className="animate-float absolute bottom-[30%] left-[30%] text-white/10">
            <BookMarked className="w-16 h-16" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-16 hover:opacity-80 transition-opacity w-fit text-white/70 hover:text-white">
              <ChevronLeft className="h-5 w-5" /> Back to Home
            </Link>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
                <BookOpen className="h-9 w-9 text-amber-400" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight">CUET Bookworld</h1>
                <p className="text-white/70 text-lg">Digital Academic Library</p>
              </div>
            </div>

            <p className="text-xl text-white/80 mb-12 max-w-lg leading-relaxed">
              {isLibrarian
                ? 'Manage books, approve renewals, and schedule consultations — all from one dashboard.'
                : 'Access your academic resources, borrow books, read online, and connect with peers — all in one place.'}
            </p>

            {/* Feature list */}
            <div className="space-y-5">
              {features.map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors border border-white/10">
                    <item.icon className="h-5 w-5 text-amber-300" />
                  </div>
                  <span className="text-white/80 group-hover:text-white transition-colors">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-12 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            {isLibrarian ? (
              <>
                <p className="text-white/80 italic mb-3">"The renewal video consultation feature saves so much time. I can manage everything from the dashboard!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-400/30 flex items-center justify-center text-amber-300 text-sm font-bold">N</div>
                  <div>
                    <p className="text-white text-sm font-medium">Dr. Nazrul Islam</p>
                    <p className="text-white/60 text-xs">Head Librarian, CUET</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-white/80 italic mb-3">"CUET Bookworld made finding and borrowing academic books so easy. I can manage everything from my phone!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-400/30 flex items-center justify-center text-amber-300 text-sm font-bold">R</div>
                  <div>
                    <p className="text-white text-sm font-medium">Rafiq Ahmed</p>
                    <p className="text-white/60 text-xs">CSE, 3rd Year</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANE — Auth Form
         ══════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile back link */}
        <div className="lg:hidden absolute top-6 left-6">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white text-sm">
            <ChevronLeft className="h-5 w-5" /> Home
          </Link>
        </div>

        <div className="w-full max-w-md space-y-6 page-enter">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-4 pt-8">
            <BookOpen className="h-8 w-8 text-indigo-600 dark:text-amber-500" />
            <span className="text-2xl font-bold gradient-text">CUET Bookworld</span>
          </div>

          {/* ── Registration Role Selector ── */}
          {!isLogin && (
            <div className="glass-card p-1.5 rounded-2xl flex gap-1">
              <button
                onClick={() => handleRoleSwitch('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  loginRole === 'student'
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <GraduationCap className="h-4 w-4" /> Student
              </button>
              <button
                onClick={() => handleRoleSwitch('librarian')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  loginRole === 'librarian'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Library className="h-4 w-4" /> Librarian
              </button>
            </div>
          )}

          {/* ── Form Card ── */}
          <div className="glass-card p-8 sm:p-10 rounded-2xl relative overflow-hidden">
            {/* Gradient top accent */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
              isLibrarian ? 'from-emerald-500 to-teal-500' : 'from-indigo-500 to-violet-500'
            }`} />

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">
                {isLogin ? 'Welcome Back' : (isLibrarian ? 'Create Librarian Account' : 'Create Student Account')}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {isLogin
                  ? 'Enter your credentials. Your dashboard will open based on your account role.'
                  : (isLibrarian ? 'Register with your CUET staff credentials' : 'Register with your CUET student credentials')}
              </p>
            </div>

            {/* Error message with shake animation */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm" style={{ animation: 'shake 0.4s ease' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registration fields */}
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input type="text" name="name" required onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-transparent text-sm transition-all"
                        placeholder="e.g. Rafiq Ahmed" />
                    </div>
                  </div>
                  {!isLibrarian && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Student ID</label>
                          <input type="text" name="studentId" required onChange={handleChange}
                            className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm transition-all"
                            placeholder="e.g. 2204010" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Department</label>
                          <select name="department" onChange={handleChange} className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-transparent dark:bg-slate-800 text-sm">
                            {DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Academic Year</label>
                        <select name="year" onChange={handleChange} className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-transparent dark:bg-slate-800 text-sm">
                          {YEARS.map((y) => <option key={y} value={y}>{y} {y !== 'Faculty' ? 'Year' : ''}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                  {isLibrarian && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        Librarian registration creates a staff dashboard account using your allowed CUET email domain.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input type="email" name="email" required onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-transparent text-sm transition-all"
                    placeholder={isLogin ? 'name@cuet.ac.bd' : (isLibrarian ? 'librarian@cuet.ac.bd' : 'name@student.cuet.ac.bd')} />
                </div>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  Allowed domains: @cuet.ac.bd and @student.cuet.ac.bd
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input type={showPassword ? 'text' : 'password'} name="password" required onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-transparent text-sm transition-all"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-slate-600 dark:text-slate-400">Remember me</span>
                  </label>
                  <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Forgot password?</a>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg relative overflow-hidden btn-shimmer ${
                  isLibrarian
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 focus:ring-emerald-500 shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-indigo-500 to-violet-500 focus:ring-indigo-500 shadow-indigo-500/25'
                }`}
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  isLogin ? 'Log In' : (isLibrarian ? 'Create Librarian Account' : 'Create Student Account')
                )}
              </button>
            </form>

            {/* Google Login — dynamic account role on login, selected role on registration */}
            <>
              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-md transition-all text-sm font-medium disabled:opacity-60"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </>

            {/* Librarian note */}
            {isLibrarian && (
              <div className="mt-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
                  Use your official CUET email. Login later will route this account to the librarian dashboard automatically.
                </p>
              </div>
            )}

            {/* Toggle Login/Register */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  className="ml-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline focus:outline-none"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
