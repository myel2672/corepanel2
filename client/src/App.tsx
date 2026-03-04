import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import Dashboard from './pages/Dashboard';
import BusinessSignup from './pages/BusinessSignup';
import MainAdminDashboard from './pages/MainAdminDashboard';
import BusinessPanel from './pages/BusinessPanel';
import SalesPage from './pages/SalesPage';
import { useAuthStore } from './store/authStore';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function RoleRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="business" element={
            <RoleRoute roles={['BUSINESS_ADMIN', 'STAFF']}>
              <BusinessPanel />
            </RoleRoute>
          } />
          <Route path="main-admin" element={
            <RoleRoute roles={['MAIN_ADMIN']}>
              <MainAdminDashboard />
            </RoleRoute>
          } />
        </Route>
        <Route path="/business-signup" element={<BusinessSignup />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
