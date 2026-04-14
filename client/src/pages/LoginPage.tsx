import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const APPROVAL_PENDING_MESSAGE =
  'İşletme onayı bekleniyor. MAIN_ADMIN onayı sonrası giriş yapabilirsiniz.';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const passwordChanged = searchParams.get('passwordChanged') === 'true';
  const approvalPending = searchParams.get('approvalPending') === 'true';

  const handleLogin = async () => {
    if (!email || !password) {
      setError('E-posta ve şifre gereklidir.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.user, res.data.token, res.data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError(APPROVAL_PENDING_MESSAGE);
      } else {
        setError(err?.response?.data?.message || 'Giriş başarısız.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/demo-login');
      setAuth(res.data.user, res.data.token, res.data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError(APPROVAL_PENDING_MESSAGE);
      } else {
        setError(err?.response?.data?.message || 'Demo girişi başarısız.');
      }
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        :root {
          --login-bg: #07111f;
          --login-card: rgba(9, 18, 32, 0.9);
          --login-panel: rgba(255, 255, 255, 0.92);
          --login-line: rgba(148, 163, 184, 0.18);
          --login-text: #e2e8f0;
          --login-muted: #94a3b8;
          --login-title: #0f172a;
          --login-primary: #4f46e5;
          --login-accent: #14b8a6;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background:
            radial-gradient(circle at top left, rgba(79,70,229,.22), transparent 32%),
            linear-gradient(180deg, #07111f 0%, #0b1322 100%);
        }
        .login-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: minmax(360px, 1.05fr) minmax(360px, 0.95fr);
        }
        .login-left {
          padding: 44px clamp(28px, 5vw, 64px);
          background:
            radial-gradient(circle at top right, rgba(103,232,249,.14), transparent 28%),
            linear-gradient(180deg, #08111f 0%, #0b1322 100%);
          color: var(--login-text);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .login-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -.06em;
          color: #f8fafc;
        }
        .login-brand-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: linear-gradient(135deg, #67e8f9, var(--login-accent));
        }
        .login-copy {
          max-width: 560px;
        }
        .login-kicker {
          display: inline-flex;
          padding: 10px 16px;
          border-radius: 999px;
          margin-bottom: 22px;
          background: rgba(79,70,229,.16);
          border: 1px solid rgba(129,140,248,.24);
          color: #c7d2fe;
          font-size: 13px;
          font-weight: 700;
        }
        .login-copy h1 {
          margin: 0 0 18px;
          font-family: 'Syne', sans-serif;
          font-size: clamp(46px, 7vw, 80px);
          line-height: .98;
          letter-spacing: -.08em;
          color: #f8fafc;
        }
        .login-copy h1 span {
          background: linear-gradient(135deg, #93c5fd, #67e8f9 44%, #2dd4bf);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .login-copy p {
          margin: 0;
          color: #a8b6ca;
          font-size: 18px;
          line-height: 1.82;
        }
        .login-points {
          display: grid;
          gap: 14px;
          margin-top: 34px;
          max-width: 520px;
        }
        .login-point {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #d7e3f3;
          font-size: 15px;
          font-weight: 600;
        }
        .login-point-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: rgba(20,184,166,.94);
          box-shadow: 0 0 12px rgba(20,184,166,.45);
        }
        .login-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 36px 24px;
          background:
            linear-gradient(180deg, rgba(248,250,252,.96), rgba(255,255,255,.92));
        }
        .login-card {
          width: min(430px, 100%);
          padding: 32px;
          border-radius: 30px;
          background: var(--login-panel);
          border: 1px solid rgba(148, 163, 184, 0.16);
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);
        }
        .login-card h2 {
          margin: 0 0 8px;
          color: var(--login-title);
          font-size: 40px;
          font-family: 'Syne', sans-serif;
          letter-spacing: -.06em;
          line-height: .98;
        }
        .login-card p {
          margin: 0 0 24px;
          color: #64748b;
          line-height: 1.72;
        }
        .login-alert {
          padding: 14px 16px;
          border-radius: 16px;
          margin-bottom: 18px;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.6;
        }
        .login-alert.error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }
        .login-alert.success {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #059669;
        }
        .login-label {
          display: block;
          margin-bottom: 8px;
          color: #64748b;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .08em;
        }
        .login-input {
          width: 100%;
          padding: 15px 16px;
          border-radius: 16px;
          border: 1px solid #dbe4ef;
          background: #f8fafc;
          color: #0f172a;
          font-size: 15px;
          font-family: inherit;
          margin-bottom: 16px;
          outline: none;
          transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
        }
        .login-input:focus {
          background: #fff;
          border-color: #818cf8;
          box-shadow: 0 0 0 4px rgba(79,70,229,.08);
        }
        .login-btn, .login-demo-btn {
          width: 100%;
          border-radius: 16px;
          padding: 15px 18px;
          font-family: inherit;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .login-btn {
          border: none;
          color: #fff;
          background: linear-gradient(135deg, var(--login-primary), #6366f1 58%, var(--login-accent) 150%);
          box-shadow: 0 18px 34px rgba(79,70,229,.28);
        }
        .login-demo-btn {
          margin-top: 10px;
          border: 1px solid #dbe4ef;
          background: #fff;
          color: #0f172a;
        }
        .login-btn:hover, .login-demo-btn:hover { transform: translateY(-1px); }
        .login-btn:disabled, .login-demo-btn:disabled { opacity: .65; cursor: not-allowed; transform: none; }
        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 16px 0;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 700;
        }
        .login-divider::before, .login-divider::after {
          content: '';
          height: 1px;
          flex: 1;
          background: #e2e8f0;
        }
        .login-links {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 18px;
          font-size: 14px;
        }
        .login-links a {
          color: #64748b;
          text-decoration: none;
          font-weight: 600;
        }
        .login-links a:hover { color: var(--login-primary); }
        .login-footer {
          margin-top: 22px;
          color: #94a3b8;
          font-size: 13px;
        }
        @media (max-width: 920px) {
          .login-page { grid-template-columns: 1fr; }
          .login-left { display: none; }
          .login-right { min-height: 100vh; }
          .login-card { padding: 28px 22px; }
        }
      `}</style>

      <div className="login-page">
        <div className="login-left">
          <div className="login-brand">
            Corepanel
            <span className="login-brand-dot" />
          </div>

          <div className="login-copy">
            <div className="login-kicker">İşletme yönetim sistemi</div>
            <h1>
              İşletmenizi <span>akıllıca</span> yönetin.
            </h1>
            <p>
              Sipariş, satış, stok ve rapor tarafını aynı akışta bir araya getiren daha olgun ve daha
              kontrollü bir panel deneyimi.
            </p>

            <div className="login-points">
              <div className="login-point">
                <span className="login-point-dot" />
                Sipariş ve satış akışı aynı yapıda ama net rollerle ilerler.
              </div>
              <div className="login-point">
                <span className="login-point-dot" />
                İşletme onayı, tahsilat ve panel kullanımı daha düzenli görünür.
              </div>
              <div className="login-point">
                <span className="login-point-dot" />
                Demo ve canlı kullanım aynı marka diliyle tutarlı ilerler.
              </div>
            </div>
          </div>

            <div style={{ color: '#7c8ba1', fontSize: 14 }}>Corepanel • 2026</div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <h2>Tekrar hoş geldiniz</h2>
            <p>Hesabınıza giriş yapın veya demo hesabı ile paneli hızlıca inceleyin.</p>

            {error && <div className="login-alert error">{error}</div>}
            {!error && approvalPending && (
              <div className="login-alert error">{APPROVAL_PENDING_MESSAGE}</div>
            )}
            {!error && passwordChanged && (
              <div className="login-alert success">
                Şifreniz güncellendi. Yeni şifrenizle tekrar giriş yapabilirsiniz.
              </div>
            )}

            <label className="login-label">E-posta</label>
            <input
              className="login-input"
              type="email"
              placeholder="ornek@sirket.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />

            <label className="login-label">Şifre</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />

            <button className="login-btn" onClick={handleLogin} disabled={loading || demoLoading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>

            <div className="login-divider">veya</div>

            <button
              className="login-demo-btn"
              onClick={handleDemo}
              disabled={loading || demoLoading}
            >
              {demoLoading ? 'Yükleniyor...' : 'Demo Hesabıyla Dene'}
            </button>

            <div className="login-links">
              <Link to="/forgot-password">Şifremi unuttum</Link>
              <Link to="/register">İşletme kaydı oluştur</Link>
            </div>

            <div className="login-footer">Corepanel v1.0 • Tüm hakları saklıdır.</div>
          </div>
        </div>
      </div>
    </>
  );
}
