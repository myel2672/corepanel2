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
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="main-admin" element={<MainAdminDashboard />} />
          <Route path="products" element={<ProductsPage />} />
           <Route path="orders" element={<OrdersPage />} />
           <Route path="business" element={<BusinessPanel />} />
           <Route path="sales" element={<SalesPage />} />
        </Route>
        <Route path="business-signup" element={<BusinessSignup />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}