import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  BookMarked,
  BookOpen,
  Library,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';
import API from '../api/axios';

const STATS = [
  { value: '2,500+', label: 'Academic Books' },
  { value: '1,200+', label: 'Registered Students' },
  { value: '400+', label: 'Digital E-Books' },
  { value: '99.9%', label: 'System Uptime' },
];

const FEATURES = [
  {
    icon: BookMarked,
    title: 'Smart Borrowing',
    desc: 'Reserve books online and track due dates with a clear student dashboard.',
  },
  {
    icon: RefreshCw,
    title: 'One-Click Renewal',
    desc: 'Submit renewal requests quickly and coordinate with librarians easily.',
  },
  {
    icon: Smartphone,
    title: 'Read Anywhere',
    desc: 'Access course e-books from laptop, tablet, or phone in seconds.',
  },
  {
    icon: Video,
    title: 'Video Consultation',
    desc: 'Book structured support sessions for research and project guidance.',
  },
];

const STEPS = [
  {
    index: '01',
    title: 'Create Account',
    desc: 'Sign in with your CUET identity and personalize your profile.',
    icon: Users,
  },
  {
    index: '02',
    title: 'Find Resources',
    desc: 'Search by title, subject, department, or author from one place.',
    icon: Library,
  },
  {
    index: '03',
    title: 'Borrow And Learn',
    desc: 'Borrow, renew, and complete your reading goals with confidence.',
    icon: ShieldCheck,
  },
];

const LandingPage = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [homeAnnouncement, setHomeAnnouncement] = useState(null);

  useEffect(() => {
    API.get('/books?limit=8&sort=rating')
      .then((res) => setFeaturedBooks(res.data.books || []))
      .catch(() => { });
  }, []);

  useEffect(() => {
    API.get('/announcements?home=true')
      .then((res) => setHomeAnnouncement(res.data || null))
      .catch(() => setHomeAnnouncement(null));
  }, []);

  const doubledBooks = useMemo(() => featuredBooks.slice(0, 8), [featuredBooks]);

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      {homeAnnouncement?.title && (
        <section className="border-b border-slate-200/70 bg-white/90 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-2 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/50">
              <div className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-slate-950 dark:text-indigo-400">
                <Bell className="h-5 w-5" />
              </div>
              <p className="min-w-0 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <span className="font-black text-slate-900 dark:text-white">{homeAnnouncement.title}</span>
                <span className="mx-2 text-slate-400">•</span>
                <span className="text-slate-600 dark:text-slate-300 line-clamp-1">{homeAnnouncement.message}</span>
              </p>
            </div>
          </div>
        </section>
      )}
      <section className="relative overflow-hidden border-b border-slate-200/70 dark:border-slate-800/80">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-30 h-72 w-72 rounded-full bg-cyan-200/50 blur-3xl dark:bg-cyan-500/10" />
          <div className="absolute -right-30 top-10 h-80 w-80 rounded-full bg-indigo-300/40 blur-3xl dark:bg-indigo-500/10" />
          <div className="absolute -bottom-35 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/10" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pb-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/70 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                CUET Digital Library Platform
              </span>

              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                A Modern Library Experience
                <span className="block bg-linear-to-r from-indigo-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  Built For Student Success
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
                CUET Bookworld combines borrowing, renewal, e-book access, and librarian support into a clean, reliable, and job-ready product experience.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/books"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Explore Catalog
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Get Started
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/70">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Library Catalog</p>
                    <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">2,500+ Books</p>
                    <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">Across all core departments</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/70">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Digital Access</p>
                    <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">400+ E-Books</p>
                    <p className="mt-1 text-xs text-cyan-600 dark:text-cyan-400">Read online from any device</p>
                  </div>
                  <div className="sm:col-span-2 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/70 dark:bg-indigo-950/30">
                    <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Library Quick Access</p>
                    <div className="mt-2 grid grid-cols-3 gap-3 text-center text-xs">
                      <Link to="/books" className="rounded-lg bg-white px-2 py-2 font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">Book List</Link>
                      <Link to="/ebooks" className="rounded-lg bg-white px-2 py-2 font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">E-Books</Link>
                      <Link to="/contact" className="rounded-lg bg-white px-2 py-2 font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">Help Desk</Link>
                    </div>
                    <p className="mt-3 text-xs text-indigo-700/80 dark:text-indigo-200/80">Open Saturday to Thursday, 8:00 AM to 8:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-2xl font-black text-slate-900 dark:text-white">{item.value}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">Core Capabilities</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Crafted For A Professional Product Impression
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
            Every section is designed to feel trustworthy, readable, and conversion-focused for both student users and evaluators.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  <Icon className="h-5 w-5 text-slate-800 dark:text-slate-100" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">User Flow</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Simple Journey, Strong Outcomes
            </h2>
          </div>
          <Link to="/auth" className="hidden items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 sm:inline-flex">
            Join now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.index} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-black tracking-[0.14em] text-slate-500 dark:text-slate-400">{step.index}</p>
                <div className="mt-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  <Icon className="h-5 w-5 text-slate-900 dark:text-white" />
                </div>
                <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {doubledBooks.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-600 dark:text-cyan-400">Popular Picks</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">High Rated Books</h2>
            </div>
            <Link to="/books" className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
              View all books
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {doubledBooks.map((book) => (
              <Link
                key={book._id}
                to={`/books/${book._id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative mb-3 flex aspect-2/3 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div className={`${book.coverImage ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center`}>
                    <BookOpen className="h-7 w-7 text-slate-400 dark:text-slate-500" />
                  </div>
                </div>
                <h3 className="line-clamp-2 text-sm font-bold text-slate-900 dark:text-white">{book.title}</h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-600 dark:text-slate-300">{book.authors?.[0] || 'Unknown author'}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default LandingPage;
