import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

import HomePage from './pages/Home'
import { LoginPage, SignupPage, ForgotPasswordPage } from './pages/Auth'
import SearchPage from './pages/Search'
import MapPage from './pages/Map'
import FacilityPage from './pages/Facility'
import EmergencyPage from './pages/Emergency'
import HowItWorksPage from './pages/HowItWorks'
import DashboardPage from './pages/Dashboard'

import DoctorPortal from './pages/hospital/DoctorPortal'

import AdminPage from './pages/admin/AdminPage'
import AdminRegisterPage from './pages/admin/AdminRegister'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/facility/:id" element={<FacilityPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />

            {/* Doctor portal — not publicly linked.
                Doctors sign in at /login, then come here.
                Admin creates doctor accounts via /sccl-admin. */}
            <Route path="/doctor" element={
              <ProtectedRoute requiredRole="doctor"><DoctorPortal /></ProtectedRoute>
            } />

            {/* Site owner admin — not publicly linked */}
            <Route path="/sccl-admin" element={
              <ProtectedRoute><AdminPage /></ProtectedRoute>
            } />
            <Route path="/admin/register" element={<AdminRegisterPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', flexDirection: 'column', gap: '16px',
      padding: '24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '64px' }}>🔍</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800 }}>404 — Page Not Found</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>The page you're looking for doesn't exist.</p>
      <a href="/" style={{
        background: 'var(--accent-primary)', color: 'white',
        padding: '12px 24px', borderRadius: 'var(--radius-md)',
        textDecoration: 'none', fontWeight: 700, fontSize: '15px',
        fontFamily: 'var(--font-body)', marginTop: '8px',
      }}>← Go Home</a>
    </div>
  )
}
