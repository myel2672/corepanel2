import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Nunito', sans-serif; }
  .fp-page { min-height: 100vh; background: #0f1117; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
  .fp-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; pointer-events: none; }
  .fp-orb1 { width: 400px; height: 400px; background: #6366f1; top: -100px; left: -100px; }
  .fp-orb2 { width: 300px; height: 300px; background: #a78bfa; bottom: -80px; right: -80px; }
  .fp-card { position: relative; width: 420px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 48px 40px; }
  .fp-logo { font-size: 22px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 24px; }
  .fp-title { font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 6px; }
  .fp-subtitle { font-size: 14px; color: rgba(255,255,255,0.3); margin-bottom: 32px; line-height: 1.5; }
  .fp-label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 7px; }
  .fp-input { width: 100%; padding: 12px 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 11px; color: rgba(255,255,255,0.85); font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 500; outline: none; transition: all 0.15s; margin-bottom: 20px; }
  .fp-input:focus { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.07); }
  .fp-input::placeholder { color: rgba(255,255,255,0.18); }
  .fp-btn { width: 100%; padding: 13px; background: linear-gradient(135deg, #6366f1, #7c3aed); border: none; border-radius: 12px; color: #fff; font-size: 15px; font-weight: 700; font-family: 'Nunito', sans-serif; cursor: pointer; transition: all 0.15s; }
  .fp-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.3); }
  .fp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .fp-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .fp-success { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); color: #34d399; padding: 16px; border-radius: 12px; font-size: 14px; font-weight: 600; text-align: center; }
  .fp-back { display: block; text-align: center; margin-top: 20px; font-size: 13px; color: rgba(255,255,255,0.3); text-decoration: none; transition: color 0.15s; }
  .fp-back:hover { color: rgba(255,255,255,0.6); }
`;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email) { setError('E-posta zorunludur.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch {
      setError('İstek gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="fp-page">
        <div className="fp-orb fp-orb1" />
        <div className="fp-orb fp-orb2" />
        <div className="fp-card">
          <div className="fp-logo">Corepanel</div>
          <div className="fp-title">Şifremi Unuttum</div>
          <div className="fp-subtitle">E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.</div>

          {error && <div className="fp-error">{error}</div>}

          {success ? (
            <div className="fp-success">
              ✓ E-posta gönderildi! Gelen kutunuzu kontrol edin.
            </div>
          ) : (
            <>
              <label className="fp-label">E-Posta</label>
              <input
                className="fp-input"
                type="email"
                placeholder="ornek@sirket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button className="fp-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
              </button>
            </>
          )}

          <Link className="fp-back" to="/login">← Giriş sayfasına dön</Link>
        </div>
      </div>
    </>
  );
}