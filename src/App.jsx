import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { AccountPage } from './pages/AccountPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { AccountRecoveryPage } from './pages/AccountRecoveryPage';
import { LandingContentPage } from './pages/LandingContentPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { BlogListPage } from './pages/BlogListPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { AdminBlogsPage } from './pages/AdminBlogsPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/forgot-password" element={<AccountRecoveryPage mode="forgot" />} />
          <Route path="/reset-password" element={<AccountRecoveryPage mode="reset" />} />
          <Route path="/verify-email" element={<AccountRecoveryPage mode="verify" />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/datasets/:datasetId" element={<DashboardPage />} />
            <Route path="/dashboard/conversations/:conversationId" element={<DashboardPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/landing-content" element={<LandingContentPage />} />
            <Route path="/admin/landing-content/:section" element={<LandingContentPage />} />
            <Route path="/admin/blogs" element={<AdminBlogsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
