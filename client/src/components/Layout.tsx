import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ width: 220, background: '#1e1e2e', color: '#fff', display: 'flex', flexDirection: 'column', padding: '24px 0' }}>
        <div style={{ padding: '0 24px 24px', fontSize: 20, fontWeight: 'bold', borderBottom: '1px solid #333' }}>
          Corepanel
        </div>
        <nav style={{ flex: 1, padding: '16px 0' }}>
          <Link to="/dashboard" style={{ display: 'block', padding: '10px 24px', color: '#ccc', textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/products" style={{ display: 'block', padding: '10px 24px', color: '#ccc', textDecoration: 'none' }}>Urunler</Link>
          <Link to="/orders" style={{ display: 'block', padding: '10px 24px', color: '#ccc', textDecoration: 'none' }}>Siparisler</Link>
          {user?.role === 'MAIN_ADMIN' && (
            <Link to="/main-admin" style={{ display: 'block', padding: '10px 24px', color: '#ccc', textDecoration: 'none' }}>İşletmeler</Link>
          )}
          {(user?.role === 'BUSINESS_ADMIN' || user?.role === 'STAFF') && (
            <Link to="/business" style={{ display: 'block', padding: '10px 24px', color: '#ccc', textDecoration: 'none' }}>İşletme Paneli</Link>
          )}
          <Link to="/business-signup" style={{ display: 'block', padding: '10px 24px', color: '#ccc', textDecoration: 'none' }}>İşletme Kaydı</Link>
        </nav>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #333' }}>
          <div style={{ fontSize: 13, color: '#aaa', marginBottom: 8 }}>{user?.name}</div>
          <button onClick={handleLogout} style={{ background: '#e53e3e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>
            Cikis
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', background: '#f7f7f7', padding: 32 }}>
        <Outlet />
      </div>
    </div>
  );
}