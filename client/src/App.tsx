import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import BusinessSignup from './pages/BusinessSignup';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import ReportsPage from './pages/ReportsPage';
import AcceptInvite from './pages/AcceptInvite';
import SalesPage from './pages/SalesPage';
import MainAdminDashboard from './pages/MainAdminDashboard';
import BusinessPanel from './pages/BusinessPanel';
import CustomersPage from './pages/CustomersPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import LandingPage from './pages/LandingPage';
import AccountPage from './pages/AccountPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function BusinessDataRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  return user?.role === 'MAIN_ADMIN' ? <Navigate to="/admin" replace /> : <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<BusinessSignup />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<BusinessDataRoute><OrdersPage /></BusinessDataRoute>} />
          <Route path="/products" element={<BusinessDataRoute><ProductsPage /></BusinessDataRoute>} />
          <Route path="/sales" element={<BusinessDataRoute><SalesPage /></BusinessDataRoute>} />
          <Route path="/admin" element={<MainAdminDashboard />} />
          <Route path="/business" element={<BusinessPanel />} />
          <Route path="/customers" element={<BusinessDataRoute><CustomersPage /></BusinessDataRoute>} />
          <Route path="/reports" element={<BusinessDataRoute><ReportsPage /></BusinessDataRoute>} />
          <Route path="/account" element={<AccountPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
