import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .ap {
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #1e293b;
  }
  .ap-header {
    margin-bottom: 24px;
  }
  .ap-title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.8px;
    color: #0f172a;
  }
  .ap-subtitle {
    margin-top: 6px;
    font-size: 14px;
    color: #94a3b8;
    font-weight: 500;
  }
  .ap-card {
    max-width: 720px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 18px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .ap-card-title {
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #94a3b8;
    margin-bottom: 8px;
  }
  .ap-card-text {
    font-size: 14px;
    line-height: 1.7;
    color: #475569;
    margin-bottom: 22px;
  }
  .ap-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .ap-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .ap-field.full {
    grid-column: 1 / -1;
  }
  .ap-label {
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }
  .ap-input {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    background: #f8fafc;
    color: #0f172a;
    font-size: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none;
    transition: all 0.15s ease;
  }
  .ap-input:focus {
    background: #fff;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
  }
  .ap-note {
    margin-top: 8px;
    font-size: 12px;
    color: #94a3b8;
    line-height: 1.6;
  }
  .ap-error,
  .ap-success,
  .ap-warning {
    border-radius: 12px;
    padding: 13px 16px;
    margin-bottom: 18px;
    font-size: 13px;
    font-weight: 600;
  }
  .ap-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
  }
  .ap-success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #059669;
  }
  .ap-warning {
    background: #fffbeb;
    border: 1px solid #fde68a;
    color: #b45309;
  }
  .ap-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 22px;
  }
  .ap-btn {
    border: none;
    border-radius: 12px;
    padding: 12px 18px;
    background: #6366f1;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s ease;
    box-shadow: 0 4px 14px rgba(99,102,241,0.25);
  }
  .ap-btn:hover:not(:disabled) {
    background: #4f46e5;
    transform: translateY(-1px);
  }
  .ap-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    .ap-card {
      padding: 18px;
    }
    .ap-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const isDemo = user?.role === 'DEMO';

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Tüm alanları doldurun.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Yeni şifre ve tekrar alanı eşleşmiyor.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setSuccess(res.data?.message || 'Şifre güncellendi. Tekrar giriş yapılıyor.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      window.setTimeout(() => {
        logout();
        navigate('/login?passwordChanged=true', { replace: true });
      }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Şifre değiştirilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ap">
        <div className="ap-header">
          <div className="ap-title">Hesabım</div>
          <div className="ap-subtitle">Şifrenizi güvenli şekilde güncelleyin.</div>
        </div>

        <div className="ap-card">
          <div className="ap-card-title">Şifre Değiştir</div>
          <div className="ap-card-text">
            Mevcut şifrenizi doğrulayın, yeni şifrenizi kaydedin. Güvenlik için işlem sonunda yeniden giriş yapmanızı isteyeceğiz.
          </div>

          {isDemo && (
            <div className="ap-warning">
              Demo hesapta şifre değiştirme kapalı. Gerçek kullanıcı hesaplarında bu alan kullanılabilir.
            </div>
          )}

          {error && <div className="ap-error">{error}</div>}
          {success && <div className="ap-success">{success}</div>}

          <div className="ap-grid">
            <div className="ap-field full">
              <label className="ap-label">E-posta</label>
              <input className="ap-input" value={user?.email || ''} disabled />
            </div>

            <div className="ap-field full">
              <label className="ap-label">Mevcut Şifre</label>
              <input
                className="ap-input"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading || isDemo}
              />
            </div>

            <div className="ap-field">
              <label className="ap-label">Yeni Şifre</label>
              <input
                className="ap-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading || isDemo}
              />
            </div>

            <div className="ap-field">
              <label className="ap-label">Yeni Şifre Tekrar</label>
              <input
                className="ap-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || isDemo}
                onKeyDown={(e) => e.key === 'Enter' && !isDemo && handleSubmit()}
              />
            </div>
          </div>

          <div className="ap-note">
            En az 6 karakter kullanın ve mevcut şifrenizden farklı bir şifre belirleyin.
          </div>

          <div className="ap-actions">
            <button className="ap-btn" onClick={handleSubmit} disabled={loading || isDemo}>
              {loading ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
