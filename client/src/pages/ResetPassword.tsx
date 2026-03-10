import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Nunito', sans-serif; }
  .rp-page { min-height: 100vh; background: #0f1117; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
  .rp-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; pointer-events: none; }
  .rp-orb1 { width: 400px; height: 400px; background: #6366f1; top: -100px; left: -100px; }
  .rp-orb2 { width: 300px; height: 300px; background: #a78bfa; bottom: -80px; right: -80px; }
  .rp-card { position: relative; width: 420px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 48px 40px; }
  .rp-logo { font-size: 22px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 24px; }
  .rp-title { font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 6px; }
  .rp-subtitle { font-size: 14px; color: rgba(255,255,255,0.3); margin-bottom: 32px; }
  .rp-label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 7px; }
  .rp-input { width: 100%; padding: 12px 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 11px; color: rgba(255,255,255,0.85); font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 500; outline: none; transition: all 0.15s; margin-bottom: 16px; }
  .rp-input:focus { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.07); }
  .rp-input::placeholder { color: rgba(255,255,255,0.18); }
  .rp-btn { width: 100%; padding: 13px; background: linear-gradient(135deg, #6366f1, #7c3aed); border: none; border-radius: 12px; color: #fff; font-size: 15px; font-weight: 700; font-family: 'Nunito', sans-serif; cursor: pointer; transition: all 0.15s; margin-top: 4px; }
  .rp-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.3); }
  .rp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .rp-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .rp-success { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); color: #34d399; padding: 16px; border-radius: 12px; font-size: 14px; font-weight: 600; text-align: center; }
  .rp-invalid { text-align: center; color: rgba(255,255,255,0.3); font-size: 14px; padding: 20px 0; }
`;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <>
        <style>{styles}</style>
        <div className="rp-page">
          <div className="rp-card">
            <div className="rp-invalid">Geçersiz veya eksik token. Lütfen tekrar şifre sıfırlama isteği gönderin.</div>
          </div>
        </div>
      </>
    );
  }

  const handleSubmit = async () => {
    if (!password || !confirm) { setError('Tüm alanları doldurunuz.'); return; }
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalıdır.'); return; }
    if (password !== confirm) { setError('Şifreler eşleşmiyor.'); return; }

    setLoading(true); setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Şifre sıfırlanamadı. Link geçersiz veya süresi dolmuş olabilir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="rp-page">
        <div className="rp-orb rp-orb1" />
        <div className="rp-orb rp-orb2" />
        <div className="rp-card">
          <div className="rp-logo">Corepanel</div>
          <div className="rp-title">Yeni Şifre</div>
          <div className="rp-subtitle">Hesabınız için yeni bir şifre belirleyin.</div>

          {error && <div className="rp-error">{error}</div>}

          {success ? (
            <div className="rp-success">
              ✓ Şifreniz güncellendi! Giriş sayfasına yönlendiriliyorsunuz...
            </div>
          ) : (
            <>
              <label className="rp-label">Yeni Şifre</label>
              <input className="rp-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              <label className="rp-label">Şifre Tekrar</label>
              <input className="rp-input" type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
              <button className="rp-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Kaydediliyor...' : 'Şifremi Güncelle'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}