/**
 * ContactPage — Premium contact page with interactive floating labels,
 * 3D contact info cards, embedded map placeholder with overlay,
 * and animated success state.
 *
 * @component
 * Features:
 * - Floating label UI for form inputs
 * - Confetti/Checkmark animation on successful submission
 * - Hover-lift effect on contact method cards
 * - Gradient overlay on the map placeholder
 */
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, ArrowRight } from 'lucide-react';
import { useStaggerReveal } from '../hooks/useScrollReveal';

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const cardsRef = useStaggerReveal({ staggerMs: 120 });
    const formRef = useStaggerReveal({ staggerMs: 150 });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setSuccess(false), 5000); // Hide success message after 5s
        }, 1500);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 page-enter">
            
            {/* ══════════════════════════════════════════
                HEADER
               ══════════════════════════════════════════ */}
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl mb-2 text-indigo-600 dark:text-indigo-400">
                    <Mail className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                    Get in <span className="gradient-text">Touch</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                    Have a question, suggestion, or facing an issue? We're here to help. Reach out to the library staff.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 lg:gap-8 items-start">
                
                {/* ══════════════════════════════════════════
                    CONTACT INFO CARDS
                   ══════════════════════════════════════════ */}
                <div ref={cardsRef} className="lg:col-span-1 space-y-6">
                    <ContactCard 
                        icon={MapPin} 
                        title="Visit Us" 
                        details={["Central Library, CUET", "Pahartali, Chittagong-4349", "Bangladesh"]} 
                        color="indigo" 
                    />
                    <ContactCard 
                        icon={Phone} 
                        title="Call Us" 
                        details={["+880-31-714920", "+880-31-714921", "Ext: 123"]} 
                        color="emerald" 
                    />
                    <ContactCard 
                        icon={Mail} 
                        title="Email Us" 
                        details={["library@cuet.ac.bd", "support@cuetbookworld.com"]} 
                        color="amber" 
                    />
                </div>

                {/* ══════════════════════════════════════════
                    CONTACT FORM
                   ══════════════════════════════════════════ */}
                <div className="lg:col-span-2">
                    <div className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-200/50 dark:border-slate-700/50 relative overflow-hidden shadow-xl">
                        {/* Background Accents */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                        {success ? (
                            <div className="h-[450px] flex flex-col items-center justify-center text-center space-y-6 animate-fade-in relative z-10">
                                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-8 ring-emerald-50 dark:ring-emerald-900/30 scale-in">
                                    <CheckCircle className="h-12 w-12 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Message Sent!</h3>
                                    <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-lg hover-scale">
                                        Thank you for reaching out. A librarian will get back to your CUET email shortly.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="reveal-child grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Name Input */}
                                    <FloatingInput 
                                        id="cf_name" name="name" 
                                        type="text" label="Your Name" 
                                        value={formData.name} onChange={handleChange} required 
                                    />
                                    {/* Email Input */}
                                    <FloatingInput 
                                        id="cf_email" name="email" 
                                        type="email" label="CUET Email Address" 
                                        value={formData.email} onChange={handleChange} required 
                                    />
                                </div>

                                {/* Subject Input */}
                                <div className="reveal-child">
                                    <FloatingInput 
                                        id="cf_subject" name="subject" 
                                        type="text" label="Subject" 
                                        value={formData.subject} onChange={handleChange} required 
                                    />
                                </div>

                                {/* Message Input */}
                                <div className="reveal-child relative">
                                    <textarea
                                        id="cf_message" name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        className="block w-full px-4 pt-6 pb-2 text-sm text-slate-900 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl appearance-none dark:text-white focus:outline-none focus:ring-0 focus:border-indigo-500 peer resize-none transition-all"
                                        placeholder=" "
                                    />
                                    <label htmlFor="cf_message" className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-indigo-600 peer-focus:dark:text-indigo-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none bg-slate-50 dark:bg-[#121827] px-1">
                                        How can we help you?
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className="reveal-child pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full sm:w-auto btn-primary btn-shimmer py-3.5 px-8 rounded-xl font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-2 group"
                                    >
                                        {loading ? (
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Send Message 
                                                <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
                MAP SECTION — Placeholder with Gradient
               ══════════════════════════════════════════ */}
            <div className="mt-20">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <MapPin className="h-6 w-6 text-indigo-500" />
                        Find Us on Campus
                    </h2>
                    <a href="#" className="hidden sm:flex text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 items-center gap-1 group">
                        Get Directions <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
                
                <div className="glass-card rounded-3xl overflow-hidden h-96 relative border border-slate-200 dark:border-slate-800 group">
                    {/* Simulated Map View (Replace with actual iframe if API key available) */}
                    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 flex flex-col justify-center items-center text-slate-400 dark:text-slate-500">
                        {/* Abstract map pattern background */}
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                        
                        <div className="relative z-10 flex flex-col items-center animate-float">
                            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg mb-4 text-indigo-600 dark:text-indigo-400">
                                <MapPin className="h-8 w-8" />
                            </div>
                            <span className="font-bold text-slate-800 dark:text-white bg-white/80 dark:bg-slate-900/80 px-4 py-1.5 rounded-full backdrop-blur-sm shadow-sm">
                                Central Library Building
                            </span>
                        </div>
                    </div>
                    
                    {/* Interactive Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                        <button className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2 m-auto sm:m-0 sm:ml-auto">
                            Open in Google Maps <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

/* ══════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════ */

/**
 * FloatingInput — Form input with animated floating label
 */
const FloatingInput = ({ id, name, type, label, value, onChange, required }) => (
    <div className="relative">
        <input
            type={type} id={id} name={name} value={value} onChange={onChange} required={required}
            className="block w-full px-4 pt-6 pb-2 text-sm text-slate-900 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl appearance-none dark:text-white focus:outline-none focus:ring-0 focus:border-indigo-500 peer transition-all"
            placeholder=" "
        />
        <label htmlFor={id} className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-indigo-600 peer-focus:dark:text-indigo-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none bg-slate-50 dark:bg-[#121827] px-1">
            {label}
        </label>
    </div>
);

/**
 * ContactCard — 3D hover card for contact methods
 */
const ContactCard = ({ icon: Icon, title, details, color }) => {
    const colorMap = {
        indigo: 'from-indigo-500 to-violet-500 text-indigo-100',
        emerald: 'from-emerald-500 to-teal-500 text-emerald-100',
        amber: 'from-amber-400 to-orange-500 text-amber-100'
    };
    
    return (
        <div className="reveal-child glass-card p-6 rounded-2xl hover-lift border border-slate-200/50 dark:border-slate-700/50 flex flex-col md:flex-row lg:flex-col gap-4 group">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${colorMap[color]} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 flex-shrink-0`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">{title}</h3>
                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    {details.map((detail, idx) => (
                        <li key={idx} className={idx === 0 ? "font-medium text-slate-700 dark:text-slate-300" : ""}>
                            {detail}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ContactPage;
