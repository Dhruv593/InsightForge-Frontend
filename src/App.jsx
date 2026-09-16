import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { AccountPage } from './pages/AccountPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { AccountRecoveryPage } from './pages/AccountRecoveryPage';
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
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/datasets/:datasetId" element={<DashboardPage />} />
            <Route path="/dashboard/conversations/:conversationId" element={<DashboardPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
