/**
 * FAQPage — Premium FAQ and Support page with smooth height accordion,
 * animated chevron rotation, live search filtering, and staggered entrance.
 *
 * @component
 * Features:
 * - Real-time animated search filtering
 * - Smooth CSS height grid transition for accordion expansion
 * - Rotating chevron icon on expand
 * - Category-segmented layout
 */
import { useState } from 'react';
import { Search, ChevronDown, HelpCircle, Mail, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStaggerReveal } from '../hooks/useScrollReveal';

/* ── FAQ Data Dictionary ── */
const FAQ_DATA = [
  {
    category: "Borrowing Books",
    items: [
      {
        q: "How many books can I borrow at a time?",
        a: "Students can borrow up to 3 books at a time. This limit ensures that resources remain available for all students across different departments."
      },
      {
        q: "How long can I keep a borrowed book?",
        a: "The standard borrowing period is 14 days. You can request a renewal if you need the book for a longer period, provided no one else has placed a hold on it."
      },
      {
        q: "What happens if I return a book late?",
        a: "Late returns may result in a fine of 10 BDT per day. Your account will automatically be marked with an 'Overdue' status, which prevents further borrowing until the book is returned and fines are settled."
      }
    ]
  },
  {
    category: "Renewals & Consultations",
    items: [
      {
        q: "How do I renew a book?",
        a: "Go to the 'Renew Books' section in your dashboard, select the book you wish to renew, and submit a reason. Note that renewals are limited to one time per book."
      },
      {
        q: "Why do I need a video consultation for a renewal?",
        a: "Librarians may occasionally mandate a brief video consultation (via Google Meet) to verify the physical condition of the book before approving a renewal request."
      }
    ]
  },
  {
    category: "E-Books & Digital Resources",
    items: [
      {
        q: "Can I download e-books?",
        a: "Yes! Navigate to the E-Books section. Most materials are available as downloadable PDFs. Some access-restricted journals may require you to be on the campus network."
      },
      {
        q: "Are the digital resources free?",
        a: "All digital resources listed in the CUET Bookworld catalog are entirely free for registered CUET students and faculty members."
      }
    ]
  }
];

const FAQPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [openItems, setOpenItems] = useState({});

    const contentRef = useStaggerReveal({ staggerMs: 150 });

    const toggleItem = (categoryIndex, itemIndex) => {
        const key = `${categoryIndex}-${itemIndex}`;
        setOpenItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Filter FAQs based on search term
    const filteredData = FAQ_DATA.map(category => ({
        ...category,
        items: category.items.filter(item => 
            item.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.a.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(category => category.items.length > 0);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 page-enter">
            
            {/* ══════════════════════════════════════════
                HEADER & SEARCH
               ══════════════════════════════════════════ */}
            <div className="text-center mb-16 space-y-6">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl mb-2 text-indigo-600 dark:text-indigo-400">
                    <HelpCircle className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                    Frequently Asked <span className="gradient-text">Questions</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                    Everything you need to know about borrowing, renewals, and library policies at CUET Bookworld.
                </p>

                {/* Glowing Search Bar */}
                <div className="relative max-w-xl mx-auto mt-8 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-500 transition-colors">
                        <Search className="h-5 w-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for an answer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all shadow-sm focus:shadow-violet-500/20 text-lg"
                    />
                </div>
            </div>

            {/* ══════════════════════════════════════════
                ACCORDION LIST
               ══════════════════════════════════════════ */}
            <div ref={contentRef} className="space-y-10">
                {filteredData.length === 0 ? (
                    <div className="text-center py-12 glass-card rounded-2xl">
                        <p className="text-slate-500 dark:text-slate-400 text-lg">No related questions found for "{searchTerm}".</p>
                        <p className="text-sm mt-2 text-slate-400">Try adjusting your search term.</p>
                    </div>
                ) : (
                    filteredData.map((category, cIdx) => (
                        <div key={cIdx} className="reveal-child space-y-4">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full inline-block" />
                                {category.category}
                            </h2>
                            
                            <div className="space-y-3">
                                {category.items.map((item, iIdx) => {
                                    const key = `${cIdx}-${iIdx}`;
                                    const isOpen = openItems[key];
                                    
                                    return (
                                        <div 
                                            key={iIdx} 
                                            className={`glass-card border rounded-2xl overflow-hidden transition-all duration-300 ${
                                                isOpen 
                                                    ? 'border-indigo-200 dark:border-indigo-800/50 shadow-md translate-x-1' 
                                                    : 'border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                        >
                                            <button
                                                onClick={() => toggleItem(cIdx, iIdx)}
                                                className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset"
                                                aria-expanded={isOpen}
                                            >
                                                <span className={`font-semibold text-lg pr-8 transition-colors ${
                                                    isOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-white'
                                                }`}>
                                                    {item.q}
                                                </span>
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                    isOpen ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                }`}>
                                                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                                </div>
                                            </button>
                                            
                                            {/* Smooth Height Transition Trick using Grid */}
                                            <div 
                                                className={`grid transition-all duration-300 ease-in-out ${
                                                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                                }`}
                                            >
                                                <div className="overflow-hidden">
                                                    <div className="px-6 pb-6 pt-0 text-slate-600 dark:text-slate-300 leading-relaxed border-t-0 space-y-3">
                                                        {item.a.split('\n').map((para, pIdx) => (
                                                            <p key={pIdx}>{para}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ══════════════════════════════════════════
                CONTACT CTA
               ══════════════════════════════════════════ */}
            <div className="mt-20 glass-card rounded-2xl p-8 sm:p-12 text-center border-t border-slate-200 dark:border-slate-800 bg-gradient-to-b from-transparent to-indigo-50/30 dark:to-indigo-950/10">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Still have questions?</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">
                    If you couldn't find the answer to your question, our library staff is here to help you.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link to="/contact" className="btn-primary py-3 px-8 rounded-xl font-semibold flex items-center justify-center gap-2 hover-lift">
                        <MessageCircle className="h-4 w-4" />
                        Contact Support
                    </Link>
                    <a href="mailto:library@cuet.ac.bd" className="btn-glass py-3 px-8 rounded-xl font-semibold flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Mail className="h-4 w-4 text-slate-500" />
                        Email Us
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
