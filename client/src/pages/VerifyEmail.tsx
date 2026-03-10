import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Nunito', sans-serif; }
  .ve-page { min-height: 100vh; background: #0f1117; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
  .ve-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; pointer-events: none; }
  .ve-orb1 { width: 400px; height: 400px; background: #6366f1; top: -100px; left: -100px; }
  .ve-orb2 { width: 300px; height: 300px; background: #a78bfa; bottom: -80px; right: -80px; }
  .ve-card { position: relative; width: 420px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 48px 40px; text-align: center; }
  .ve-logo { font-size: 22px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 32px; }
  .ve-icon { font-size: 48px; margin-bottom: 16px; }
  .ve-title { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 8px; }
  .ve-text { font-size: 14px; color: rgba(255,255,255,0.3); margin-bottom: 28px; line-height: 1.6; }
  .ve-btn { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #6366f1, #7c3aed); border: none; border-radius: 12px; color: #fff; font-size: 14px; font-weight: 700; font-family: 'Nunito', sans-serif; cursor: pointer; text-decoration: none; transition: all 0.15s; }
  .ve-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.3); }
  .ve-loading { color: rgba(255,255,255,0.3); font-size: 14px; }
`;

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <>
      <style>{styles}</style>
      <div className="ve-page">
        <div className="ve-orb ve-orb1" />
        <div className="ve-orb ve-orb2" />
        <div className="ve-card">
          <div className="ve-logo">Corepanel</div>
          {status === 'loading' && <div className="ve-loading">Doğrulanıyor...</div>}
          {status === 'success' && (
            <>
              <div className="ve-icon">✅</div>
              <div className="ve-title">E-posta Doğrulandı!</div>
              <div className="ve-text">E-posta adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz.</div>
              <Link className="ve-btn" to="/login">Giriş Yap</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="ve-icon">❌</div>
              <div className="ve-title">Doğrulama Başarısız</div>
              <div className="ve-text">Link geçersiz veya süresi dolmuş. Tekrar doğrulama e-postası göndermek için giriş yapın.</div>
              <Link className="ve-btn" to="/login">Giriş Yap</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}