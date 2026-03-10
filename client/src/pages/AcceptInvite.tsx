import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
  .ai-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f0f1a; font-family: 'Nunito', sans-serif; padding: 20px; }
  .ai-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 40px; width: 100%; max-width: 420px; }
  .ai-logo { font-size: 22px; font-weight: 800; background: linear-gradient(135deg,#6366f1,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; margin-bottom: 28px; }
  .ai-title { font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 6px; }
  .ai-sub { font-size: 14px; color: rgba(255,255,255,0.35); margin-bottom: 28px; }
  .ai-biz { display: inline-block; background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2); color: #a78bfa; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-bottom: 24px; }
  .ai-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 8px; }
  .ai-input { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: rgba(255,255,255,0.85); font-size: 14px; font-family: 'Nunito', sans-serif; outline: none; box-sizing: border-box; margin-bottom: 14px; transition: all 0.15s; }
  .ai-input:focus { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.08); }
  .ai-input::placeholder { color: rgba(255,255,255,0.2); }
  .ai-btn { width: 100%; padding: 13px; background: linear-gradient(135deg, #6366f1, #7c3aed); border: none; border-radius: 12px; color: #fff; font-size: 15px; font-weight: 800; font-family: 'Nunito', sans-serif; cursor: pointer; margin-top: 4px; transition: all 0.15s; }
  .ai-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .ai-msg-success { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); color: #34d399; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .ai-msg-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .ai-email-row { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 12px 14px; margin-bottom: 20px; }
  .ai-email-text { font-size: 14px; color: rgba(255,255,255,0.6); }
`;

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  const [inviteInfo, setInviteInfo] = useState<{ email: string; businessName: string } | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setInvalid(true); return; }
    api.get(`/invites/check/${token}`)
      .then(r => setInviteInfo(r.data))
      .catch(() => setInvalid(true));
  }, [token]);

  const handleSubmit = async () => {
    setError('');
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalıdır.'); return; }
    if (password !== password2) { setError('Şifreler eşleşmiyor.'); return; }
    setLoading(true);
    try {
      await api.post('/invites/accept', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Hesap oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ai-wrap">
        <div className="ai-card">
          <div className="ai-logo">Corepanel</div>

          {invalid ? (
            <>
              <div className="ai-title">Geçersiz Davet</div>
              <div className="ai-sub">Bu davet linki geçersiz veya süresi dolmuş.</div>
              <button className="ai-btn" onClick={() => navigate('/login')}>Giriş Sayfasına Dön</button>
            </>
          ) : !inviteInfo ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Yükleniyor...</div>
          ) : success ? (
            <>
              <div className="ai-msg-success">✓ Hesabınız oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...</div>
            </>
          ) : (
            <>
              <div className="ai-title">Daveti Kabul Et</div>
              <div className="ai-sub">Hesabınızı oluşturmak için şifrenizi belirleyin.</div>
              <div className="ai-biz">🏢 {inviteInfo.businessName}</div>

              <div className="ai-email-row">
                <span style={{ fontSize: 18 }}>✉️</span>
                <span className="ai-email-text">{inviteInfo.email}</span>
              </div>

              {error && <div className="ai-msg-error">{error}</div>}

              <div className="ai-label">Yeni Şifre</div>
              <input
                className="ai-input"
                type="password"
                placeholder="En az 6 karakter"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <div className="ai-label">Şifre Tekrar</div>
              <input
                className="ai-input"
                type="password"
                placeholder="Şifreyi tekrar girin"
                value={password2}
                onChange={e => setPassword2(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button className="ai-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Oluşturuluyor...' : 'Hesabı Oluştur'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}