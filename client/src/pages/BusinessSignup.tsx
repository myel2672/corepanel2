import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const SECTORS = [
  'Kuaför',
  'Restoran',
  'Kafe',
  'Market',
  'Eczane',
  'Tekstil',
  'Otomotiv',
  'Teknoloji',
  'Diğer',
];

export default function BusinessSignup() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
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

  const setField = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleBack = () => {
    navigate(token ? '/dashboard' : '/login');
  };

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        :root {
          --signup-bg: #08111f;
          --signup-panel: rgba(10, 20, 36, 0.88);
          --signup-card: rgba(255, 255, 255, 0.92);
          --signup-line: rgba(148, 163, 184, 0.16);
          --signup-muted: #64748b;
          --signup-title: #0f172a;
          --signup-primary: #4f46e5;
          --signup-accent: #14b8a6;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background:
            radial-gradient(circle at top left, rgba(79,70,229,.24), transparent 32%),
            linear-gradient(180deg, #08111f 0%, #0b1322 100%);
        }
        .signup-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: minmax(340px, .96fr) minmax(360px, 1.04fr);
        }
        .signup-left {
          padding: 44px clamp(28px, 5vw, 64px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #e2e8f0;
          background:
            radial-gradient(circle at top right, rgba(20,184,166,.16), transparent 30%),
            linear-gradient(180deg, #08111f 0%, #0b1322 100%);
        }
        .signup-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -.06em;
          color: #f8fafc;
        }
        .signup-brand-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: linear-gradient(135deg, #67e8f9, var(--signup-accent));
        }
        .signup-kicker {
          display: inline-flex;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(79,70,229,.16);
          border: 1px solid rgba(129,140,248,.24);
          color: #c7d2fe;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 22px;
        }
        .signup-copy h1 {
          margin: 0 0 18px;
          font-family: 'Syne', sans-serif;
          font-size: clamp(42px, 7vw, 74px);
          line-height: .98;
          letter-spacing: -.08em;
          color: #f8fafc;
        }
        .signup-copy h1 span {
          background: linear-gradient(135deg, #93c5fd, #67e8f9 42%, #2dd4bf);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .signup-copy p {
          margin: 0;
          max-width: 560px;
          color: #a8b6ca;
          font-size: 18px;
          line-height: 1.82;
        }
        .signup-points { display: grid; gap: 14px; margin-top: 34px; }
        .signup-point {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #dbe6f3;
          font-size: 15px;
          font-weight: 600;
        }
        .signup-point-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: rgba(20,184,166,.94);
        }
        .signup-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 36px 24px;
          background: linear-gradient(180deg, rgba(248,250,252,.96), rgba(255,255,255,.92));
        }
        .signup-card {
          width: min(480px, 100%);
          padding: 32px;
          border-radius: 30px;
          background: var(--signup-card);
          border: 1px solid rgba(148, 163, 184, 0.16);
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);
        }
        .signup-back {
          border: none;
          background: none;
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
          padding: 0;
          margin-bottom: 18px;
          cursor: pointer;
        }
        .signup-back:hover { color: var(--signup-primary); }
        .signup-card h2 {
          margin: 0 0 8px;
          color: var(--signup-title);
          font-size: 38px;
          font-family: 'Syne', sans-serif;
          line-height: .98;
          letter-spacing: -.06em;
        }
        .signup-card p {
          margin: 0 0 24px;
          color: var(--signup-muted);
          line-height: 1.72;
        }
        .signup-alert {
          padding: 14px 16px;
          border-radius: 16px;
          margin-bottom: 18px;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.6;
        }
        .signup-alert.error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }
        .signup-alert.success {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #059669;
        }
        .signup-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .signup-field { margin-bottom: 16px; }
        .signup-field.full { grid-column: 1 / -1; }
        .signup-label {
          display: block;
          margin-bottom: 8px;
          color: #64748b;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .signup-input, .signup-select {
          width: 100%;
          padding: 15px 16px;
          border-radius: 16px;
          border: 1px solid #dbe4ef;
          background: #f8fafc;
          color: #0f172a;
          font-size: 15px;
          font-family: inherit;
          outline: none;
          transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
        }
        .signup-input:focus, .signup-select:focus {
          background: #fff;
          border-color: #818cf8;
          box-shadow: 0 0 0 4px rgba(79,70,229,.08);
        }
        .signup-btn {
          width: 100%;
          margin-top: 6px;
          border: none;
          border-radius: 16px;
          padding: 15px 18px;
          font-family: inherit;
          font-size: 15px;
          font-weight: 800;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(135deg, var(--signup-primary), #6366f1 58%, var(--signup-accent) 150%);
          box-shadow: 0 18px 34px rgba(79,70,229,.28);
        }
        .signup-btn:disabled { opacity: .65; cursor: not-allowed; }
        @media (max-width: 920px) {
          .signup-page { grid-template-columns: 1fr; }
          .signup-left { display: none; }
          .signup-grid { grid-template-columns: 1fr; }
          .signup-card { padding: 28px 22px; }
        }
      `}</style>

      <div className="signup-page">
        <div className="signup-left">
          <div className="signup-brand">
            Corepanel
            <span className="signup-brand-dot" />
          </div>

          <div className="signup-copy">
            <div className="signup-kicker">İşletme kaydı</div>
            <h1>
              Panelinize <span>düzenli</span> bir başlangıç yapın.
            </h1>
            <p>
              İşletme kaydı, yönetici hesabı ve onay sürecini aynı düzende tamamlayın. Sonraki kullanım
              adımları daha temiz ve daha profesyonel hissettirsin.
            </p>

            <div className="signup-points">
              <div className="signup-point">
                <span className="signup-point-dot" />
                İşletme ve yönetici bilgileri aynı akışta tamamlanır.
              </div>
              <div className="signup-point">
                <span className="signup-point-dot" />
                MAIN_ADMIN onayı sonrası erişim açılır.
              </div>
              <div className="signup-point">
                <span className="signup-point-dot" />
                Sonraki satış, sipariş ve rapor kullanımı hazır hale gelir.
              </div>
            </div>
          </div>

          <div style={{ color: '#7c8ba1', fontSize: 14 }}>Corepanel • 2026</div>
        </div>

        <div className="signup-right">
          <div className="signup-card">
            <button className="signup-back" onClick={handleBack}>
              ← {token ? 'Panele dön' : 'Giriş ekranına dön'}
            </button>

            <h2>İşletme kaydı</h2>
            <p>Panel kullanımı için işletme ve yönetici bilgilerini girin.</p>

            {error && <div className="signup-alert error">{error}</div>}

            {success ? (
              <div className="signup-alert success">
                Kayıt başarılı. MAIN_ADMIN onayı sonrası giriş yapabilirsiniz.
              </div>
            ) : (
              <>
                <div className="signup-grid">
                  <div className="signup-field full">
                    <label className="signup-label">İşletme adı</label>
                    <input
                      className="signup-input"
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      placeholder="İşletme adını girin"
                    />
                  </div>

                  <div className="signup-field full">
                    <label className="signup-label">Sektör</label>
                    <select
                      className="signup-select"
                      value={form.sector}
                      onChange={(e) => setField('sector', e.target.value)}
                    >
                      {SECTORS.map((sector) => (
                        <option key={sector} value={sector}>
                          {sector}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="signup-field full">
                    <label className="signup-label">Yönetici adı</label>
                    <input
                      className="signup-input"
                      value={form.adminName}
                      onChange={(e) => setField('adminName', e.target.value)}
                      placeholder="Ad soyad"
                    />
                  </div>

                  <div className="signup-field full">
                    <label className="signup-label">E-posta</label>
                    <input
                      className="signup-input"
                      type="email"
                      value={form.adminEmail}
                      onChange={(e) => setField('adminEmail', e.target.value)}
                      placeholder="ornek@isletme.com"
                    />
                  </div>

                  <div className="signup-field full">
                    <label className="signup-label">Şifre</label>
                    <input
                      className="signup-input"
                      type="password"
                      value={form.adminPassword}
                      onChange={(e) => setField('adminPassword', e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button className="signup-btn" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Kayıt oluşturuluyor...' : 'Kaydı tamamla'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
