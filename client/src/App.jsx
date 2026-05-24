import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import BookCatalog from './pages/BookCatalog';
import BookDetail from './pages/BookDetail';
import EBooks from './pages/EBooks';
import RenewPage from './pages/RenewPage';

import ProfilePage from './pages/ProfilePage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import LibrarianDashboard from './pages/librarian/LibrarianDashboard';
import ManageBooks from './pages/librarian/ManageBooks';
import StudentRecords from './pages/librarian/StudentRecords';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import Footer from './components/Footer';

const AppContent = () => {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/librarian') || location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-900 dark:text-slate-50 font-sans">
      {!hideNavbar && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/books" element={<BookCatalog />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/ebooks" element={<EBooks />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Student Protected Pages */}
          <Route path="/home" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/renew" element={<ProtectedRoute><RenewPage /></ProtectedRoute>} />

          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Librarian Protected Pages */}
          <Route path="/librarian/dashboard" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><LibrarianDashboard /></ProtectedRoute>} />
          <Route path="/librarian/books" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><ManageBooks /></ProtectedRoute>} />
          <Route path="/librarian/ebooks" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><ManageBooks /></ProtectedRoute>} />
          <Route path="/librarian/students" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><StudentRecords /></ProtectedRoute>} />
          <Route path="/librarian/reports" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><LibrarianDashboard /></ProtectedRoute>} />

          {/* Admin Protected Pages */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
