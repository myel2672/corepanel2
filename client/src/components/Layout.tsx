import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import NotificationBell from './NotificationBell';

type NavItem = {
  to: string;
  label: string;
  icon: string;
  roles: string[];
};

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Panel', icon: '#', roles: ['MAIN_ADMIN', 'ADMIN', 'DEMO'] },
  { to: '/products', label: 'Ürünler', icon: 'P', roles: ['ADMIN', 'DEMO'] },
  { to: '/orders', label: 'Siparişler', icon: 'O', roles: ['ADMIN', 'STAFF', 'DEMO'] },
  { to: '/sales', label: 'Satışlar', icon: '$', roles: ['ADMIN', 'STAFF', 'DEMO'] },
  { to: '/customers', label: 'Müşteriler', icon: 'C', roles: ['ADMIN', 'DEMO'] },
  { to: '/reports', label: 'Raporlar', icon: 'R', roles: ['ADMIN', 'DEMO'] },
  { to: '/billing', label: 'Faturalandırma', icon: '₺', roles: ['ADMIN'] },
  { to: '/business', label: 'İşletme', icon: 'B', roles: ['ADMIN'] },
  { to: '/admin', label: 'İşletmeler', icon: '*', roles: ['MAIN_ADMIN'] },
  { to: '/account', label: 'Hesabım', icon: 'A', roles: ['MAIN_ADMIN', 'ADMIN', 'STAFF'] },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; }

  .layout { display: flex; height: 100vh; background: #f8fafc; overflow: hidden; }
  .mobile-topbar {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 56px;
    background: #fff;
    border-bottom: 1px solid #e2e8f0;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    z-index: 100;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
  .mobile-logo {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hamburger {
    width: 36px;
    height: 36px;
    border: none;
    background: #f1f5f9;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 0;
  }
  .hamburger span {
    display: block;
    width: 18px;
    height: 2px;
    background: #475569;
    border-radius: 2px;
    transition: all 0.25s;
  }
  .hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
  .hamburger.open span:nth-child(2) { opacity: 0; }
  .hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,0.4);
    z-index: 98;
    backdrop-filter: blur(2px);
  }
  .sidebar-overlay.visible { display: block; }
  .sidebar {
    width: 240px;
    min-width: 240px;
    background: #fff;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #e2e8f0;
    position: relative;
    z-index: 99;
    box-shadow: 2px 0 12px rgba(0,0,0,0.04);
    transition: transform 0.25s ease;
  }
  .sidebar-logo {
    padding: 26px 24px 22px;
    border-bottom: 1px solid #f1f5f9;
  }
  .sidebar-logo-text {
    font-size: 21px;
    font-weight: 800;
    letter-spacing: -0.6px;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .sidebar-logo-sub {
    font-size: 10px;
    color: #94a3b8;
    margin-top: 2px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-weight: 600;
  }
  .sidebar-nav {
    flex: 1;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
  }
  .sidebar-nav-label {
    font-size: 10px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #cbd5e1;
    padding: 8px 12px 4px;
    margin-top: 8px;
    font-weight: 700;
  }
  .nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 10px;
    color: #64748b;
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 500;
    transition: all 0.15s ease;
    position: relative;
  }
  .nav-link:hover { background: #f1f5f9; color: #1e293b; }
  .nav-link.active { background: #eef2ff; color: #6366f1; font-weight: 700; }
  .nav-link.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 22%;
    bottom: 22%;
    width: 3px;
    background: linear-gradient(180deg, #6366f1, #818cf8);
    border-radius: 0 4px 4px 0;
  }
  .nav-icon {
    width: 20px;
    text-align: center;
    opacity: 0.8;
    font-size: 12px;
    font-weight: 800;
  }
  .nav-link.active .nav-icon { opacity: 1; }
  .staff-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 10px 12px 4px;
    padding: 6px 12px;
    background: #eef2ff;
    border: 1px solid #c7d2fe;
    border-radius: 8px;
    font-size: 11px;
    color: #6366f1;
    font-weight: 700;
  }
  .sidebar-footer {
    padding: 14px;
    border-top: 1px solid #f1f5f9;
  }
  .user-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    margin-bottom: 10px;
  }
  .user-avatar {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
  }
  .user-info { min-width: 0; }
  .user-name {
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .user-role {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 1px;
    font-weight: 500;
  }
  .logout-btn {
    width: 100%;
    padding: 9px;
    background: #fff;
    border: 1.5px solid #fecaca;
    color: #ef4444;
    border-radius: 10px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all 0.15s ease;
  }
  .logout-btn:hover { background: #fef2f2; border-color: #fca5a5; }
  .main-content {
    flex: 1;
    overflow-y: auto;
    background: #f8fafc;
    padding: 32px 36px;
  }
  .main-content::-webkit-scrollbar { width: 5px; }
  .main-content::-webkit-scrollbar-track { background: transparent; }
  .main-content::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }
  .main-content::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
  @keyframes fadeInPage { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .topbar-right {
    position: sticky;
    top: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
    padding: 0 0 16px 0;
    z-index: 10;
  }
  @media (max-width: 768px) {
    .topbar-right { display: none; }
    .mobile-topbar { display: flex; }
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      transform: translateX(-100%);
      z-index: 99;
      width: 260px;
      min-width: 260px;
    }
    .sidebar.open { transform: translateX(0); }
    .main-content {
      padding: 16px;
      padding-top: 72px;
      width: 100%;
    }
    .layout { flex-direction: column; }
  }
`;

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageKey, setPageKey] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== pageKey) {
      setPageKey(location.pathname);
    }
  }, [location.pathname, pageKey]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const filteredItems = navItems.filter((item) => item.roles.includes(user?.role ?? ''));
  const displayName = user?.name || user?.email || 'Kullanıcı';
  const initials = displayName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleLabel: Record<string, string> = {
    MAIN_ADMIN: 'Ana Yönetici',
    ADMIN: 'İşletme Yöneticisi',
    STAFF: 'Personel',
    DEMO: 'Demo Hesabı',
  };

  const showBusinessSignupLink = user?.role === 'MAIN_ADMIN';

  return (
    <>
      <style>{styles}</style>

      <div className="mobile-topbar">
        <div className="mobile-logo">Corepanel</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NotificationBell />
          <button
            className={`hamburger${sidebarOpen ? ' open' : ''}`}
            onClick={() => setSidebarOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`sidebar-overlay${sidebarOpen ? ' visible' : ''}`} onClick={closeSidebar} />

      <div className="layout">
        <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="sidebar-logo">
            <div className="sidebar-logo-text">Corepanel</div>
            <div className="sidebar-logo-sub">Yönetim Sistemi</div>
          </div>

          <nav className="sidebar-nav">
            <div className="sidebar-nav-label">Menü</div>

            {user?.role === 'STAFF' && <div className="staff-badge">Personel Hesabı</div>}

            {filteredItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link${location.pathname === item.to ? ' active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            {showBusinessSignupLink && (
              <>
                <div className="sidebar-nav-label">Diğer</div>
                <Link
                  to="/register"
                  className={`nav-link${location.pathname === '/register' ? ' active' : ''}`}
                  onClick={closeSidebar}
                >
                  <span className="nav-icon">+</span>
                  İşletme Kaydı
                </Link>
              </>
            )}
          </nav>

          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">{initials}</div>
              <div className="user-info">
                <div className="user-name">{displayName}</div>
                <div className="user-role">{roleLabel[user?.role ?? ''] ?? user?.role}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Çıkış Yap</button>
          </div>
        </aside>

        <main className="main-content">
          <div className="topbar-right"><NotificationBell /></div>
          <div key={pageKey} style={{ animation: 'fadeInPage 0.2s ease' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
