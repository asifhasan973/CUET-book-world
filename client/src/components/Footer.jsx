import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <BookOpen className="h-5 w-5" />
          <span className="text-sm font-black tracking-wide">CUET BOOKWORLD</span>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Link to="/">Home</Link>
          <Link to="/books">Books</Link>
          <Link to="/ebooks">E-Books</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;

