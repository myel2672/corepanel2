import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const SECTORS = ['Kuaför', 'Restoran', 'Kafe', 'Market', 'Eczane', 'Tekstil', 'Otomotiv', 'Teknoloji', 'Diğer'];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Nunito', sans-serif; }
  .bs-page {
    min-height: 100vh;
    background: #0f1117;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    position: relative;
    overflow: hidden;
  }
  .bs-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; pointer-events: none; }
  .bs-orb1 { width: 400px; height: 400px; background: #6366f1; top: -100px; right: -100px; }
  .bs-orb2 { width: 300px; height: 300px; background: #a78bfa; bottom: -80px; left: -80px; }
  .bs-card {
    position: relative;
    width: 100%;
    max-width: 520px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    padding: 48px 40px;
  }
  .bs-back {
    font-size: 13px;
    color: rgba(255,255,255,0.3);
    text-decoration: none;
    margin-bottom: 28px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: color 0.15s;
    cursor: pointer;
    background: none;
    border: none;
    font-family: 'Nunito', sans-serif;
    font-weight: 600;
    padding: 0;
  }
  .bs-back:hover { color: rgba(255,255,255,0.6); }
  .bs-title { font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 4px; letter-spacing: -0.5px; }
  .bs-subtitle { font-size: 14px; color: rgba(255,255,255,0.3); margin-bottom: 32px; }
  .bs-section { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 14px; margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06); }
  .bs-section:first-of-type { margin-top: 0; padding-top: 0; border-top: none; }
  .bs-label { font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 7px; display: block; }
  .bs-input, .bs-select {
    width: 100%;
    padding: 12px 15px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 11px;
    color: rgba(255,255,255,0.85);
    font-size: 14px;
    font-family: 'Nunito', sans-serif;
    font-weight: 500;
    outline: none;
    transition: all 0.15s;
    margin-bottom: 16px;
  }
  .bs-select { appearance: none; cursor: pointer; }
  .bs-input:focus, .bs-select:focus { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.07); }
  .bs-input::placeholder { color: rgba(255,255,255,0.18); }
  .bs-btn {
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
    margin-top: 8px;
    transition: all 0.15s;
  }
  .bs-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.3); }
  .bs-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .bs-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .bs-success { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); color: #34d399; padding: 16px; border-radius: 12px; font-size: 14px; font-weight: 600; text-align: center; margin-top: 8px; }
`;

export default function BusinessSignup() {
  const navigate = useNavigate();
  // Token kontrolü: giriş yapmış kullanıcı → /dashboard, değilse → /login
  const token = useAuthStore((s) => s.token);

  const handleBack = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const [form, setForm] = useState({
    name: '',
    sector: 'Kuaför',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const setField = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name || !form.adminName || !form.adminEmail || !form.adminPassword) {
      setError('Tüm alanları doldurunuz.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/businesses/register', form);
      setSuccess(true);
    } catch {
      setError('Kayıt sırasında hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="bs-page">
        <div className="bs-orb bs-orb1" />
        <div className="bs-orb bs-orb2" />
        <div className="bs-card">
          {/* ← Düzeltme: <a href> yerine useNavigate + token kontrolü */}
          <button className="bs-back" onClick={handleBack}>
            &#8592; {token ? 'Panele dön' : 'Giriş sayfasına dön'}
          </button>

          <div className="bs-title">İşletme Kaydı</div>
          <div className="bs-subtitle">Corepanel'e işletmenizi kaydedin</div>

          {error && <div className="bs-error">{error}</div>}

          {success ? (
            <div className="bs-success">
              ✓ Kayıt başarılı! Yönetici onayından sonra giriş yapabilirsiniz.
              <br /><br />
              <button
                className="bs-btn"
                style={{ marginTop: 0 }}
                onClick={() => navigate('/login')}
              >
                Giriş Sayfasına Git
              </button>
            </div>
          ) : (
            <>
              <div className="bs-section">İşletme Bilgileri</div>
              <label className="bs-label">İşletme Adı</label>
              <input
                className="bs-input"
                placeholder="İşletme adını girin"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
              />
              <label className="bs-label">Sektör</label>
              <select
                className="bs-select"
                value={form.sector}
                onChange={(e) => setField('sector', e.target.value)}
              >
                {SECTORS.map((s) => <option key={s}>{s}</option>)}
              </select>

              <div className="bs-section">Yönetici Bilgileri</div>
              <label className="bs-label">Ad Soyad</label>
              <input
                className="bs-input"
                placeholder="Yönetici adı"
                value={form.adminName}
                onChange={(e) => setField('adminName', e.target.value)}
              />
              <label className="bs-label">E-Posta</label>
              <input
                className="bs-input"
                type="email"
                placeholder="ornek@isletme.com"
                value={form.adminEmail}
                onChange={(e) => setField('adminEmail', e.target.value)}
              />
              <label className="bs-label">Şifre</label>
              <input
                className="bs-input"
                type="password"
                placeholder="••••••••"
                value={form.adminPassword}
                onChange={(e) => setField('adminPassword', e.target.value)}
              />

              <button
                className="bs-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
