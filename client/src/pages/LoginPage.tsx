import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) { setError('E-posta ve şifre gereklidir.'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.user, res.data.token, res.data.refreshToken);
      navigate('/dashboard');
    } catch {
      setError('E-posta veya şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; }

        .login-page {
          min-height: 100vh;
          display: flex;
        }

        /* ── SOL PANEL ── */
        .login-left {
          flex: 1;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          position: relative;
          overflow: hidden;
        }
        .login-left::before {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          top: -200px; right: -200px;
        }
        .login-left::after {
          content: '';
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          bottom: -100px; left: -100px;
        }
        .login-left-logo {
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          position: relative;
          z-index: 1;
        }
        .login-left-logo span {
          display: inline-block;
          width: 8px; height: 8px;
          background: #a5f3fc;
          border-radius: 50%;
          margin-left: 2px;
          vertical-align: middle;
          margin-bottom: 3px;
        }
        .login-left-content {
          position: relative;
          z-index: 1;
        }
        .login-left-tag {
          display: inline-block;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 20px;
          margin-bottom: 24px;
        }
        .login-left-title {
          font-size: 38px;
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          letter-spacing: -1px;
          margin-bottom: 20px;
        }
        .login-left-title em {
          font-style: normal;
          color: #a5f3fc;
        }
        .login-left-desc {
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          line-height: 1.7;
          max-width: 380px;
          font-weight: 400;
        }
        .login-left-features {
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          z-index: 1;
        }
        .login-left-feature {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255,255,255,0.8);
          font-size: 13px;
          font-weight: 500;
        }
        .login-left-feature-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #a5f3fc;
          flex-shrink: 0;
        }

        /* ── SAĞ PANEL ── */
        .login-right {
          width: 480px;
          min-width: 480px;
          background: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
        }
        .login-form-wrap {
          width: 100%;
          max-width: 360px;
        }
        .login-form-title {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.6px;
          margin-bottom: 6px;
        }
        .login-form-subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin-bottom: 36px;
          font-weight: 500;
        }
        .login-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .login-input {
          width: 100%;
          padding: 12px 16px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          color: #1e293b;
          font-size: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500;
          outline: none;
          transition: all 0.15s;
          margin-bottom: 18px;
        }
        .login-input:focus {
          border-color: #6366f1;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
        }
        .login-input::placeholder { color: #cbd5e1; }
        .login-btn {
          width: 100%;
          padding: 13px;
          background: #6366f1;
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          margin-top: 4px;
          box-shadow: 0 4px 14px rgba(99,102,241,0.3);
        }
        .login-btn:hover:not(:disabled) {
          background: #4f46e5;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.4);
        }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .login-forgot {
          text-align: center;
          margin-top: 16px;
        }
        .login-forgot a {
          font-size: 13px;
          color: #94a3b8;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }
        .login-forgot a:hover { color: #6366f1; }
        .login-footer {
          margin-top: 40px;
          font-size: 12px;
          color: #cbd5e1;
          text-align: center;
          font-weight: 500;
        }

        /* ── MOBİL ── */
        @media (max-width: 768px) {
          .login-left { display: none; }
          .login-right {
            width: 100%;
            min-width: 0;
            padding: 32px 24px;
          }
          .login-form-wrap { max-width: 100%; }
        }
      `}</style>

      <div className="login-page">
        {/* Sol panel */}
        <div className="login-left">
          <div className="login-left-logo">
            Corepanel<span />
          </div>

          <div className="login-left-content">
            <div className="login-left-tag">İşletme Yönetim Sistemi</div>
            <div className="login-left-title">
              İşletmenizi<br />
              <em>akıllıca</em> yönetin.
            </div>
            <div className="login-left-desc">
              Satışlarınızı takip edin, stoklarınızı yönetin, personelinizi organize edin — hepsi tek panelden.
            </div>
          </div>

          <div className="login-left-features">
            <div className="login-left-feature">
              <div className="login-left-feature-dot" />
              Gerçek zamanlı satış ve sipariş takibi
            </div>
            <div className="login-left-feature">
              <div className="login-left-feature-dot" />
              Stok alarmları ve düşük stok uyarıları
            </div>
            <div className="login-left-feature">
              <div className="login-left-feature-dot" />
              Personel daveti ve yetki yönetimi
            </div>
            <div className="login-left-feature">
              <div className="login-left-feature-dot" />
              Detaylı kâr/zarar ve ciro raporları
            </div>
          </div>
        </div>

        {/* Sağ panel */}
        <div className="login-right">
          <div className="login-form-wrap">
            <div className="login-form-title">Tekrar hoş geldiniz 👋</div>
            <div className="login-form-subtitle">Hesabınıza giriş yapın</div>

            {error && <div className="login-error">{error}</div>}

            <label className="login-label">E-Posta</label>
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

            <button className="login-btn" onClick={handleLogin} disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
            </button>

            <div className="login-forgot">
              <Link to="/forgot-password">Şifremi unuttum</Link>
            </div>

            <div className="login-footer">
              Corepanel v1.0 · Tüm hakları saklıdır
            </div>
          </div>
        </div>
      </div>
    </>
  );
}