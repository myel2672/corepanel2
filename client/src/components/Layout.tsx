import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { to: '/dashboard', label: 'Panel', icon: '▦', roles: ['MAIN_ADMIN', 'ADMIN', 'STAFF'] },
  { to: '/products', label: 'Ürünler', icon: '◈', roles: ['MAIN_ADMIN', 'ADMIN', 'STAFF'] },
  { to: '/orders', label: 'Siparişler', icon: '◎', roles: ['MAIN_ADMIN', 'ADMIN', 'STAFF'] },
  { to: '/sales', label: 'Satışlar', icon: '◉', roles: ['MAIN_ADMIN', 'ADMIN', 'STAFF'] },
  { to: '/business', label: 'İşletme', icon: '◐', roles: ['ADMIN', 'STAFF'] },
  { to: '/main-admin', label: 'İşletmeler', icon: '❖', roles: ['MAIN_ADMIN'] },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filtered = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role ?? '')
  );

  // Düzeltme: name yoksa email'in ilk harfini, o da yoksa '?' göster
  const displayName = user?.name || user?.email || 'Kullanıcı';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Rol etiketi
  const roleLabel: Record<string, string> = {
    MAIN_ADMIN: 'Ana Yönetici',
    ADMIN: 'İşletme Yöneticisi',
    STAFF: 'Personel',
  };

  // ADMIN ve STAFF için "İşletme Kaydı" linki gösterilmez
  const showBusinessSignupLink = user?.role === 'MAIN_ADMIN';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Nunito', sans-serif; }

        .layout { display: flex; height: 100vh; background: #0f1117; }

        /* Sidebar */
        .sidebar {
          width: 240px;
          min-width: 240px;
          background: linear-gradient(180deg, #13151f 0%, #0d0f18 100%);
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(255,255,255,0.06);
          position: relative;
          z-index: 10;
        }
        .sidebar::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(180deg, transparent, rgba(99,102,241,0.4), transparent);
        }
        .sidebar-logo {
          padding: 28px 24px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar-logo-text {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #6366f1, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sidebar-logo-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          margin-top: 2px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
        .sidebar-nav-label {
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          padding: 8px 12px 4px;
          margin-top: 8px;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.15s ease;
          position: relative;
        }
        .nav-link:hover {
          background: rgba(99,102,241,0.1);
          color: rgba(255,255,255,0.85);
        }
        .nav-link.active {
          background: rgba(99,102,241,0.15);
          color: #a78bfa;
          font-weight: 700;
        }
        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 3px;
          background: linear-gradient(180deg, #6366f1, #a78bfa);
          border-radius: 0 4px 4px 0;
        }
        .nav-icon { font-size: 16px; width: 20px; text-align: center; }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .user-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.04);
          border-radius: 12px;
          margin-bottom: 10px;
        }
        .user-avatar {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #a78bfa);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #fff;
          flex-shrink: 0;
        }
        .user-info { min-width: 0; }
        .user-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-role { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 1px; }
        .logout-btn {
          width: 100%;
          padding: 9px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          color: #f87171;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Nunito', sans-serif;
          transition: all 0.15s ease;
          letter-spacing: 0.3px;
        }
        .logout-btn:hover { background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.4); }

        /* Main */
        .main-content {
          flex: 1;
          overflow-y: auto;
          background: #0f1117;
          padding: 32px 36px;
        }
        .main-content::-webkit-scrollbar { width: 6px; }
        .main-content::-webkit-scrollbar-track { background: transparent; }
        .main-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-text">Corepanel</div>
            <div className="sidebar-logo-sub">Yönetim Sistemi</div>
          </div>

          <nav className="sidebar-nav">
            <div className="sidebar-nav-label">Menü</div>
            {filtered.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link${location.pathname === item.to ? ' active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            {/* Sadece MAIN_ADMIN yeni işletme kaydedebilir */}
            {showBusinessSignupLink && (
              <>
                <div className="sidebar-nav-label">Diğer</div>
                <Link
                  to="/business-signup"
                  className={`nav-link${location.pathname === '/business-signup' ? ' active' : ''}`}
                >
                  <span className="nav-icon">✦</span>
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
          <Outlet />
        </main>
      </div>
    </>
  );
}
