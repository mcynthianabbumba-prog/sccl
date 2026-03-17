import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Public pages
import HomePage from './pages/Home'
import { LoginPage, SignupPage, ForgotPasswordPage } from './pages/Auth'
import SearchPage from './pages/Search'
import MapPage from './pages/Map'
import FacilityPage from './pages/Facility'
import EmergencyPage from './pages/Emergency'
import HowItWorksPage from './pages/HowItWorks'
import DashboardPage from './pages/Dashboard'

// Doctor portal (admin2 - accessible via /hospital/*)
import DoctorDashboard from './pages/hospital/DoctorPortal'
import DoctorSettings from './pages/hospital/DoctorSettings'
import DoctorSignupPage from './pages/hospital/DoctorSignup'
import HospitalAdminPage from './pages/hospital/HospitalAdmin'

// Site owner admin (admin1 - accessible via /sccl-admin)
import AdminPage from './pages/admin/AdminPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/facility/:id" element={<FacilityPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Patient Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />

            {/* ============================================================
                HOSPITAL PORTAL (admin2)
                Accessible via /hospital/* — not linked from public nav
                ============================================================ */}
            <Route path="/hospital/register" element={<DoctorSignupPage />} />
            <Route path="/doctor" element={
              <ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>
            } />
            <Route path="/doctor/settings" element={
              <ProtectedRoute requiredRole="doctor"><DoctorSettings /></ProtectedRoute>
            } />
            <Route path="/hospital/manage" element={
              <ProtectedRoute requiredRole="doctor"><HospitalAdminPage /></ProtectedRoute>
            } />

            {/* ============================================================
                SITE OWNER ADMIN (admin1)
                Accessible via /sccl-admin — not linked from public nav
                ============================================================ */}
            <Route path="/sccl-admin" element={
              <ProtectedRoute><AdminPage /></ProtectedRoute>
            } />

            {/* Fallback */}
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
      background: 'var(--bg-primary)', flexDirection: 'column', gap: '16px', padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '64px' }}>🔍</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800 }}>404 — Page Not Found</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>The page you're looking for doesn't exist.</p>
      <a href="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'var(--accent-primary)', color: 'white',
        padding: '12px 24px', borderRadius: 'var(--radius-md)',
        textDecoration: 'none', fontWeight: 700, fontSize: '15px',
        fontFamily: 'var(--font-body)', marginTop: '8px',
      }}>
        ← Go Home
      </a>
    </div>
  )
}
