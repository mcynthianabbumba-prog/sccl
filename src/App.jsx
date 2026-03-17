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

import { Home }                   from './pages/Home';
import { Login, ForgotPassword }  from './pages/Auth';
import { ResetPassword }          from './pages/ResetPassword';
import { MapView }                from './pages/MapView';
import { SearchPage }             from './pages/Search';
import { FacilityProfile }        from './pages/FacilityProfile';
import { Emergency }              from './pages/Emergency';
import { Education }              from './pages/Education';
import { HowItWorks }             from './pages/HowItWorks';
import { Profile }                from './pages/Profile';
import { NotFound }               from './pages/NotFound';

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

const AuthLayout = ({ children }) => (
  <div style={{ minHeight: '100vh' }}>
    <ErrorBoundary>{children}</ErrorBoundary>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"              element={<AppLayout><Home /></AppLayout>} />
      <Route path="/map"           element={<AppLayout><MapView /></AppLayout>} />
      <Route path="/search"        element={<AppLayout><SearchPage /></AppLayout>} />
      <Route path="/facility/:id"  element={<AppLayout><FacilityProfile /></AppLayout>} />
      <Route path="/emergency"     element={<AppLayout><Emergency /></AppLayout>} />
      <Route path="/education"     element={<AppLayout><Education /></AppLayout>} />
      <Route path="/how-it-works"  element={<AppLayout><HowItWorks /></AppLayout>} />
      <Route path="/profile"       element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/login"         element={<GuestRoute><AuthLayout><Login /></AuthLayout></GuestRoute>} />
      <Route path="/signup"        element={<GuestRoute><AuthLayout><Login /></AuthLayout></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><AuthLayout><ForgotPassword /></AuthLayout></GuestRoute>} />
      <Route path="/reset-password"  element={<AuthLayout><ResetPassword /></AuthLayout>} />
      <Route path="*"              element={<AppLayout><NotFound /></AppLayout>} />
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
