import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const BusinessSignup = lazy(() => import('./pages/BusinessSignup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const AcceptInvite = lazy(() => import('./pages/AcceptInvite'));
const SalesPage = lazy(() => import('./pages/SalesPage'));
const MainAdminDashboard = lazy(() => import('./pages/MainAdminDashboard'));
const BusinessPanel = lazy(() => import('./pages/BusinessPanel'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const BillingPage = lazy(() => import('./pages/BillingPage'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function BusinessDataRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  return user?.role === 'MAIN_ADMIN' ? <Navigate to="/admin" replace /> : <>{children}</>;
}

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
    <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const LazyPage = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LazyPage><LandingPage /></LazyPage>} />
        <Route path="/login" element={<LazyPage><LoginPage /></LazyPage>} />
        <Route path="/register" element={<LazyPage><BusinessSignup /></LazyPage>} />
        <Route path="/accept-invite" element={<LazyPage><AcceptInvite /></LazyPage>} />
        <Route path="/forgot-password" element={<LazyPage><ForgotPassword /></LazyPage>} />
        <Route path="/reset-password" element={<LazyPage><ResetPassword /></LazyPage>} />
        <Route path="/verify-email" element={<LazyPage><VerifyEmail /></LazyPage>} />
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/dashboard" element={<LazyPage><Dashboard /></LazyPage>} />
          <Route path="/orders" element={<LazyPage><BusinessDataRoute><OrdersPage /></BusinessDataRoute></LazyPage>} />
          <Route path="/products" element={<LazyPage><BusinessDataRoute><ProductsPage /></BusinessDataRoute></LazyPage>} />
          <Route path="/sales" element={<LazyPage><BusinessDataRoute><SalesPage /></BusinessDataRoute></LazyPage>} />
          <Route path="/admin" element={<LazyPage><MainAdminDashboard /></LazyPage>} />
          <Route path="/business" element={<LazyPage><BusinessPanel /></LazyPage>} />
          <Route path="/customers" element={<LazyPage><BusinessDataRoute><CustomersPage /></BusinessDataRoute></LazyPage>} />
          <Route path="/reports" element={<LazyPage><BusinessDataRoute><ReportsPage /></BusinessDataRoute></LazyPage>} />
          <Route path="/billing" element={<LazyPage><BusinessDataRoute><BillingPage /></BusinessDataRoute></LazyPage>} />
          <Route path="/account" element={<LazyPage><AccountPage /></LazyPage>} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
