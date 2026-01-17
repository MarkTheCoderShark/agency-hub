import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'

// Layouts
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { PortalLayout } from '@/components/layouts/PortalLayout'

// Auth pages
import { LoginPage } from '@/app/auth/LoginPage'
import { RegisterPage } from '@/app/auth/RegisterPage'
import { ForgotPasswordPage } from '@/app/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/app/auth/ResetPasswordPage'
import { VerifyEmailPage } from '@/app/auth/VerifyEmailPage'

// Dashboard pages
import { DashboardPage } from '@/app/dashboard/DashboardPage'
import { ProjectsPage } from '@/app/dashboard/ProjectsPage'
import { ProjectDetailPage } from '@/app/dashboard/ProjectDetailPage'
import { TeamPage } from '@/app/dashboard/TeamPage'
import { SettingsPage } from '@/app/dashboard/SettingsPage'
import { BillingPage } from '@/app/dashboard/BillingPage'
import { ProfilePage } from '@/app/dashboard/ProfilePage'

// Portal pages
import { PortalLoginPage } from '@/app/portal/PortalLoginPage'
import { PortalDashboardPage } from '@/app/portal/PortalDashboardPage'
import { PortalRequestsPage } from '@/app/portal/PortalRequestsPage'
import { PortalRequestDetailPage } from '@/app/portal/PortalRequestDetailPage'
import { PortalNewRequestPage } from '@/app/portal/PortalNewRequestPage'
import { PortalSettingsPage } from '@/app/portal/PortalSettingsPage'

// Invitation page
import { InvitationPage } from '@/app/invitation/InvitationPage'

// Hooks
import { useAuth } from '@/hooks/useAuth'

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Auth route wrapper (redirect if already logged in)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRoute>
                <RegisterPage />
              </AuthRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* Invitation routes */}
        <Route path="/invitation/:token" element={<InvitationPage />} />

        {/* Dashboard routes (protected) */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId/*" element={<ProjectDetailPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/billing" element={<BillingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Portal routes */}
        <Route path="/portal/:slug">
          <Route path="login" element={<PortalLoginPage />} />
          <Route element={<PortalLayout />}>
            <Route index element={<PortalDashboardPage />} />
            <Route path="requests" element={<PortalRequestsPage />} />
            <Route path="requests/new" element={<PortalNewRequestPage />} />
            <Route path="requests/:requestId" element={<PortalRequestDetailPage />} />
            <Route path="settings" element={<PortalSettingsPage />} />
          </Route>
        </Route>

        {/* Catch all - redirect to dashboard or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster position="top-right" richColors closeButton />
    </>
  )
}

export default App
