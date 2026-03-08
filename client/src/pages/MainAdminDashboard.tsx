import { useEffect, useState } from 'react';
import api from '../api/axios';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
  .ma { font-family: 'Nunito', sans-serif; color: rgba(255,255,255,0.85); }
  .ma-header { margin-bottom: 28px; display: flex; align-items: center; justify-content: space-between; }
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
  .ma-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; transition: border-color 0.15s; }
  .ma-card:hover { border-color: rgba(99,102,241,0.25); }
  .ma-card-left { display: flex; align-items: center; gap: 16px; }
  .ma-avatar { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #a78bfa); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: #fff; flex-shrink: 0; }
  .ma-biz-name { font-size: 15px; font-weight: 700; color: #fff; }
  .ma-biz-sector { font-size: 13px; color: rgba(255,255,255,0.3); margin-top: 2px; }
  .ma-biz-date { font-size: 12px; color: rgba(255,255,255,0.2); margin-top: 4px; }
  .ma-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
  .ma-badge-approved { background: rgba(52,211,153,0.12); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
  .ma-badge-pending { background: rgba(251,146,60,0.12); color: #fb923c; border: 1px solid rgba(251,146,60,0.2); }
  .ma-actions { display: flex; gap: 8px; align-items: center; }
  .ma-btn { padding: 8px 18px; border-radius: 10px; font-size: 13px; font-weight: 700; font-family: 'Nunito', sans-serif; cursor: pointer; border: none; transition: all 0.15s; }
  .ma-btn-approve { background: rgba(52,211,153,0.15); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
  .ma-btn-approve:hover { background: rgba(52,211,153,0.25); }
  .ma-btn-delete { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
  .ma-btn-delete:hover { background: rgba(239,68,68,0.25); }
  .ma-btn-primary { background: linear-gradient(135deg, #6366f1, #7c3aed); color: #fff; border: none; }
  .ma-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.3); }
  .ma-empty { padding: 40px; text-align: center; color: rgba(255,255,255,0.2); font-size: 14px; }
  .ma-loading { display: flex; align-items: center; justify-content: center; height: 200px; color: rgba(255,255,255,0.3); font-size: 14px; }
  .ma-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .ma-success { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); color: #34d399; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .ma-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .ma-modal { background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; width: 100%; max-width: 480px; }
  .ma-modal-title { font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 24px; }
  .ma-field { margin-bottom: 16px; }
  .ma-label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 7px; }
  .ma-input, .ma-select { width: 100%; padding: 11px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: rgba(255,255,255,0.85); font-size: 14px; font-family: 'Nunito', sans-serif; outline: none; transition: all 0.15s; box-sizing: border-box; }
  .ma-input:focus, .ma-select:focus { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.08); }
  .ma-input::placeholder { color: rgba(255,255,255,0.2); }
  .ma-select option { background: #1a1a2e; }
  .ma-modal-actions { display: flex; gap: 10px; margin-top: 24px; }
  .ma-btn-cancel-modal { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.1); flex: 1; }
`;

const SECTORS = ['Kuaför', 'Restoran', 'Kafe', 'Market', 'Eczane', 'Tekstil', 'Otomotiv', 'Teknoloji', 'Diğer'];

export default function MainAdminDashboard() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', sector: 'Teknoloji', adminEmail: '', adminPassword: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchList = async () => {
    try {
      const r = await api.get('/businesses');
      setList(r.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchList(); }, []);

  const approve = async (id: number) => {
    try { await api.put(`/businesses/${id}/approve`); fetchList(); } catch { }
  };

  const deleteBusiness = async (id: number, name: string) => {
    if (!confirm(`"${name}" işletmesini silmek istediğinize emin misiniz? Tüm veriler silinecek.`)) return;
    try { await api.delete(`/businesses/${id}`); fetchList(); } catch { alert('Silme işlemi başarısız.'); }
  };

  const handleCreate = async () => {
    if (!form.name || !form.adminEmail || !form.adminPassword) {
      setFormError('İşletme adı, e-posta ve şifre zorunludur.'); return;
    }
    setSaveLoading(true); setFormError('');
    try {
      await api.post('/businesses/register', {
        name: form.name,
        sector: form.sector,
        adminName: form.name,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
      });
      setFormSuccess('İşletme oluşturuldu!');
      setForm({ name: '', sector: 'Teknoloji', adminEmail: '', adminPassword: '' });
      setShowModal(false);
      setFormSuccess('');
      fetchList();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'İşletme oluşturulamadı.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return (<><style>{styles}</style><div className="ma-loading">Yükleniyor...</div></>);

  const approved = list.filter(b => b.isApproved);
  const pending = list.filter(b => !b.isApproved);

  const BusinessCard = ({ b }: { b: any }) => (
    <div className="ma-card">
      <div className="ma-card-left">
        <div className="ma-avatar">{b.name[0]?.toUpperCase()}</div>
        <div>
          <div className="ma-biz-name">{b.name}</div>
          <div className="ma-biz-sector">{b.sector}</div>
          <div className="ma-biz-date">{new Date(b.createdAt).toLocaleDateString('tr-TR')}</div>
        </div>
      </div>
      <div className="ma-actions">
        {b.isApproved
          ? <span className="ma-badge ma-badge-approved">✓ Onaylı</span>
          : <><span className="ma-badge ma-badge-pending">Bekliyor</span>
             <button className="ma-btn ma-btn-approve" onClick={() => approve(b.id)}>Onayla</button></>
        }
        <button className="ma-btn ma-btn-delete" onClick={() => deleteBusiness(b.id, b.name)}>Sil</button>
      </div>
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="ma">
        <div className="ma-header">
          <div>
            <div className="ma-title">İşletmeler</div>
            <div className="ma-subtitle">Sisteme kayıtlı tüm işletmeleri yönetin</div>
          </div>
          <button className="ma-btn ma-btn-primary" onClick={() => { setShowModal(true); setFormError(''); }}>
            + Yeni İşletme
          </button>
        </div>

        {formSuccess && <div className="ma-success">✓ {formSuccess}</div>}

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
              {pending.map(b => <BusinessCard key={b.id} b={b} />)}
            </div>
          </>
        )}

        <div className="ma-section-title">✓ Onaylı İşletmeler</div>
        <div className="ma-list">
          {approved.length === 0
            ? <div className="ma-empty">Henüz onaylı işletme yok</div>
            : approved.map(b => <BusinessCard key={b.id} b={b} />)
          }
        </div>

        {/* Yeni İşletme Modal */}
        {showModal && (
          <div className="ma-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="ma-modal" onClick={e => e.stopPropagation()}>
              <div className="ma-modal-title">Yeni İşletme Ekle</div>
              {formError && <div className="ma-error">{formError}</div>}
              <div className="ma-field">
                <label className="ma-label">İşletme Adı</label>
                <input className="ma-input" placeholder="İşletme adı" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="ma-field">
                <label className="ma-label">Sektör</label>
                <select className="ma-select" value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}>
                  {SECTORS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="ma-field">
                <label className="ma-label">Yönetici E-Posta</label>
                <input className="ma-input" type="email" placeholder="yonetici@isletme.com" value={form.adminEmail} onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))} />
              </div>
              <div className="ma-field">
                <label className="ma-label">Yönetici Şifre</label>
                <input className="ma-input" type="password" placeholder="••••••••" value={form.adminPassword} onChange={e => setForm(f => ({ ...f, adminPassword: e.target.value }))} />
              </div>
              <div className="ma-modal-actions">
                <button className="ma-btn ma-btn-cancel-modal" onClick={() => setShowModal(false)}>İptal</button>
                <button className="ma-btn ma-btn-primary" style={{ flex: 2 }} onClick={handleCreate} disabled={saveLoading}>
                  {saveLoading ? 'Oluşturuluyor...' : 'İşletme Oluştur'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}