// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';

// Public pages
import { Home }                  from './pages/Home';
import { Login, ForgotPassword } from './pages/Auth';
import { ResetPassword }         from './pages/ResetPassword';
import { MapView }               from './pages/MapView';
import { SearchPage }            from './pages/Search';
import { FacilityProfile }       from './pages/FacilityProfile';
import { Emergency }             from './pages/Emergency';
import { Education }             from './pages/Education';
import { HowItWorks }            from './pages/HowItWorks';
import { Profile }               from './pages/Profile';
import { NotFound }              from './pages/NotFound';

// Staff / admin pages
import { DoctorLogin }           from './pages/DoctorLogin';
import { DoctorSignup }          from './pages/DoctorSignup';
import { DoctorDashboard }       from './pages/DoctorDashboard';
import { AdminOwner }            from './pages/admin/AdminOwner';
import { AdminHospital }         from './pages/admin/AdminHospital';

// ─── Route guards ─────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen message="Checking session…" />;
  return user ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return !user ? children : <Navigate to="/" replace />;
};

// Staff guard — any authenticated staff (doctor / hospital_admin / super_admin)
const StaffRoute = ({ children }) => {
  const { user, role, loading } = useAuth();
  if (loading) return <LoadingScreen message="Checking credentials…" />;
  if (!user) return <Navigate to="/doctor/login" replace />;
  if (!role || role === 'patient') return <Navigate to="/doctor/login" replace />;
  return children;
};

// ─── Layouts ─────────────────────────────────────────────────────────────────
const AppLayout = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <main style={{ flex: 1 }}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </main>
    <Footer />
    <MobileNav />
  </div>
);

const BareLayout = ({ children }) => (
  <div style={{ minHeight: '100vh' }}>
    <ErrorBoundary>{children}</ErrorBoundary>
  </div>
);

// ─── Routes ──────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/"              element={<AppLayout><Home /></AppLayout>} />
      <Route path="/map"           element={<AppLayout><MapView /></AppLayout>} />
      <Route path="/search"        element={<AppLayout><SearchPage /></AppLayout>} />
      <Route path="/facility/:id"  element={<AppLayout><FacilityProfile /></AppLayout>} />
      <Route path="/emergency"     element={<AppLayout><Emergency /></AppLayout>} />
      <Route path="/education"     element={<AppLayout><Education /></AppLayout>} />
      <Route path="/how-it-works"  element={<AppLayout><HowItWorks /></AppLayout>} />

      {/* ── Auth (public users) ── */}
      <Route path="/login"           element={<GuestRoute><BareLayout><Login /></BareLayout></GuestRoute>} />
      <Route path="/signup"          element={<GuestRoute><BareLayout><Login /></BareLayout></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><BareLayout><ForgotPassword /></BareLayout></GuestRoute>} />
      <Route path="/reset-password"  element={<BareLayout><ResetPassword /></BareLayout>} />

      {/* ── Protected (public users) ── */}
      <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />

      {/* ── Staff portal ── */}
      {/* Doctor login — hidden from nav, but accessible if you know the URL */}
      <Route path="/doctor/login"    element={<BareLayout><DoctorLogin /></BareLayout>} />
      {/* Doctor signup — only via invitation token link */}
      <Route path="/doctor/signup"   element={<BareLayout><DoctorSignup /></BareLayout>} />
      {/* Doctor dashboard — requires staff role */}
      <Route path="/doctor/dashboard"element={<StaffRoute><BareLayout><DoctorDashboard /></BareLayout></StaffRoute>} />

      {/* ── Admin portals ── hidden from nav, access by URL only ── */}
      {/* Admin1 — Site owner / super_admin */}
      <Route path="/admin/owner"    element={<StaffRoute><BareLayout><AdminOwner /></BareLayout></StaffRoute>} />
      {/* Admin2 — Hospital admin */}
      <Route path="/admin/hospital" element={<StaffRoute><BareLayout><AdminHospital /></BareLayout></StaffRoute>} />

      {/* ── 404 ── */}
      <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
