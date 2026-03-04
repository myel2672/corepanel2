import { useEffect, useState } from 'react';
import api from '../api/axios';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
  .ma { font-family: 'Nunito', sans-serif; color: rgba(255,255,255,0.85); }
  .ma-header { margin-bottom: 28px; }
  .ma-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
  .ma-subtitle { font-size: 14px; color: rgba(255,255,255,0.3); margin-top: 4px; }
  .ma-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
  .ma-stat { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px 24px; }
  .ma-stat-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 10px; }
  .ma-stat-value { font-size: 32px; font-weight: 800; color: #fff; }
  .ma-stat-value.purple { background: linear-gradient(135deg,#6366f1,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .ma-stat-value.green { color: #34d399; }
  .ma-stat-value.orange { color: #fb923c; }
  .ma-section-title { font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 14px; }
  .ma-list { display: grid; gap: 12px; }
  .ma-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: border-color 0.15s;
  }
  .ma-card:hover { border-color: rgba(99,102,241,0.25); }
  .ma-card-left { display: flex; align-items: center; gap: 16px; }
  .ma-avatar {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #a78bfa);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 800; color: #fff;
    flex-shrink: 0;
  }
  .ma-biz-name { font-size: 15px; font-weight: 700; color: #fff; }
  .ma-biz-sector { font-size: 13px; color: rgba(255,255,255,0.3); margin-top: 2px; }
  .ma-biz-date { font-size: 12px; color: rgba(255,255,255,0.2); margin-top: 4px; }
  .ma-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
  }
  .ma-badge-approved { background: rgba(52,211,153,0.12); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
  .ma-badge-pending { background: rgba(251,146,60,0.12); color: #fb923c; border: 1px solid rgba(251,146,60,0.2); }
  .ma-actions { display: flex; gap: 8px; align-items: center; }
  .ma-btn {
    padding: 8px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Nunito', sans-serif;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
  }
  .ma-btn-approve { background: rgba(52,211,153,0.15); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
  .ma-btn-approve:hover { background: rgba(52,211,153,0.25); }
  .ma-btn-reject { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
  .ma-btn-reject:hover { background: rgba(239,68,68,0.2); }
  .ma-empty { padding: 40px; text-align: center; color: rgba(255,255,255,0.2); font-size: 14px; }
  .ma-loading { display: flex; align-items: center; justify-content: center; height: 200px; color: rgba(255,255,255,0.3); font-size: 14px; }
`;

export default function MainAdminDashboard() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    try {
      const r = await api.get('/businesses');
      setList(r.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchList(); }, []);

  const approve = async (id: string) => {
    try { await api.put(`/businesses/${id}/approve`); fetchList(); } catch { }
  };

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="ma-loading">Yükleniyor...</div>
    </>
  );

  const approved = list.filter(b => b.isApproved);
  const pending = list.filter(b => !b.isApproved);

  return (
    <>
      <style>{styles}</style>
      <div className="ma">
        <div className="ma-header">
          <div className="ma-title">İşletmeler</div>
          <div className="ma-subtitle">Sisteme kayıtlı tüm işletmeleri yönetin</div>
        </div>

        <div className="ma-stats">
          <div className="ma-stat">
            <div className="ma-stat-label">Toplam İşletme</div>
            <div className="ma-stat-value purple">{list.length}</div>
          </div>
          <div className="ma-stat">
            <div className="ma-stat-label">Onaylı</div>
            <div className="ma-stat-value green">{approved.length}</div>
          </div>
          <div className="ma-stat">
            <div className="ma-stat-label">Onay Bekliyor</div>
            <div className="ma-stat-value orange">{pending.length}</div>
          </div>
        </div>

        {pending.length > 0 && (
          <>
            <div className="ma-section-title">⚠ Onay Bekleyen İşletmeler</div>
            <div className="ma-list" style={{ marginBottom: 28 }}>
              {pending.map(b => (
                <div key={b.id} className="ma-card">
                  <div className="ma-card-left">
                    <div className="ma-avatar">{b.name[0]?.toUpperCase()}</div>
                    <div>
                      <div className="ma-biz-name">{b.name}</div>
                      <div className="ma-biz-sector">{b.sector}</div>
                      <div className="ma-biz-date">{new Date(b.createdAt).toLocaleDateString('tr-TR')}</div>
                    </div>
                  </div>
                  <div className="ma-actions">
                    <span className="ma-badge ma-badge-pending">Bekliyor</span>
                    <button className="ma-btn ma-btn-approve" onClick={() => approve(b.id)}>Onayla</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="ma-section-title">✓ Onaylı İşletmeler</div>
        <div className="ma-list">
          {approved.length === 0 ? (
            <div className="ma-empty">Henüz onaylı işletme yok</div>
          ) : (
            approved.map(b => (
              <div key={b.id} className="ma-card">
                <div className="ma-card-left">
                  <div className="ma-avatar">{b.name[0]?.toUpperCase()}</div>
                  <div>
                    <div className="ma-biz-name">{b.name}</div>
                    <div className="ma-biz-sector">{b.sector}</div>
                    <div className="ma-biz-date">{new Date(b.createdAt).toLocaleDateString('tr-TR')}</div>
                  </div>
                </div>
                <div className="ma-actions">
                  <span className="ma-badge ma-badge-approved">✓ Onaylı</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}