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
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Nunito', sans-serif; }
        .login-page {
          min-height: 100vh;
          background: #0f1117;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .login-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          pointer-events: none;
        }
        .orb1 { width: 500px; height: 500px; background: #6366f1; top: -150px; left: -150px; }
        .orb2 { width: 400px; height: 400px; background: #a78bfa; bottom: -100px; right: -100px; }
        .login-card {
          position: relative;
          width: 420px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 48px 40px;
          backdrop-filter: blur(20px);
        }
        .login-logo {
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #6366f1, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .login-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.35);
          margin-bottom: 36px;
          font-weight: 500;
        }
        .login-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: rgba(255,255,255,0.4);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .login-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: rgba(255,255,255,0.9);
          font-size: 14px;
          font-family: 'Nunito', sans-serif;
          font-weight: 500;
          outline: none;
          transition: all 0.15s;
          margin-bottom: 20px;
        }
        .login-input:focus {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.08);
        }
        .login-input::placeholder { color: rgba(255,255,255,0.2); }
        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Nunito', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          margin-top: 4px;
          letter-spacing: 0.3px;
        }
        .login-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.35); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          color: #f87171;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .login-hint {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          text-align: center;
        }
      `}</style>

      <div className="login-page">
        <div className="login-bg-orb orb1" />
        <div className="login-bg-orb orb2" />

        <div className="login-card">
          <div className="login-logo">Corepanel</div>
          <div className="login-subtitle">Yönetim paneline hoş geldiniz</div>

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
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>

          <div style={{textAlign:'center', marginTop: 16}}>
            <Link to="/forgot-password" style={{fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none'}}>
              Şifremi unuttum
            </Link>
          </div>

          <div className="login-hint">Corepanel v1.0 · Tüm hakları saklıdır</div>
        </div>
      </div>
    </>
  );
}