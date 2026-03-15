import { useEffect, useState } from 'react';
import api from '../api/axios';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .ma { font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; }
  .ma-header { margin-bottom: 28px; display: flex; align-items: flex-start; justify-content: space-between; }
  .ma-title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.6px; }
  .ma-subtitle { font-size: 14px; color: #94a3b8; margin-top: 4px; font-weight: 500; }
  .ma-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
  .ma-stat { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); position: relative; overflow: hidden; transition: box-shadow 0.2s, transform 0.2s; }
  .ma-stat:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08); transform: translateY(-2px); }
  .ma-stat::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 16px 16px 0 0; }
  .ma-stat.s1::after { background: linear-gradient(90deg, #6366f1, #818cf8); }
  .ma-stat.s2::after { background: linear-gradient(90deg, #10b981, #34d399); }
  .ma-stat.s3::after { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
  .ma-stat-label { font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #94a3b8; margin-bottom: 10px; }
  .ma-stat-value { font-size: 32px; font-weight: 800; letter-spacing: -1px; }
  .ma-stat-value.purple { color: #6366f1; }
  .ma-stat-value.green { color: #059669; }
  .ma-stat-value.orange { color: #d97706; }
  .ma-section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #94a3b8; margin-bottom: 14px; }
  .ma-list { display: grid; gap: 10px; }
  .ma-card { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; transition: border-color 0.15s, box-shadow 0.15s; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .ma-card:hover { border-color: #c7d2fe; box-shadow: 0 4px 16px rgba(99,102,241,0.08); }
  .ma-card-left { display: flex; align-items: center; gap: 14px; }
  .ma-avatar { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #818cf8); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: #fff; flex-shrink: 0; }
  .ma-biz-name { font-size: 15px; font-weight: 700; color: #0f172a; }
  .ma-biz-sector { font-size: 13px; color: #64748b; margin-top: 2px; font-weight: 500; }
  .ma-biz-date { font-size: 12px; color: #94a3b8; margin-top: 3px; font-weight: 500; }
  .ma-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .ma-badge-approved { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
  .ma-badge-pending { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
  .ma-actions { display: flex; gap: 8px; align-items: center; }
  .ma-btn { padding: 8px 18px; border-radius: 10px; font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; border: none; transition: all 0.15s; }
  .ma-btn-approve { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
  .ma-btn-approve:hover { background: #d1fae5; }
  .ma-btn-delete { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
  .ma-btn-delete:hover { background: #fee2e2; }
  .ma-btn-primary { background: #6366f1; color: #fff; border: none; box-shadow: 0 2px 8px rgba(99,102,241,0.25); }
  .ma-btn-primary:hover { background: #4f46e5; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(99,102,241,0.35); }
  .ma-empty { padding: 40px; text-align: center; color: #cbd5e1; font-size: 14px; font-weight: 500; }
  .ma-loading { display: flex; align-items: center; justify-content: center; height: 200px; color: #94a3b8; font-size: 14px; font-weight: 500; }
  .ma-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .ma-success { background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .ma-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
  .ma-modal { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px; width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
  .ma-modal-title { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 24px; letter-spacing: -0.4px; }
  .ma-field { margin-bottom: 16px; }
  .ma-label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #94a3b8; margin-bottom: 7px; }
  .ma-input, .ma-select { width: 100%; padding: 11px 14px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; color: #1e293b; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; transition: all 0.15s; box-sizing: border-box; font-weight: 500; }
  .ma-input:focus, .ma-select:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
  .ma-input::placeholder { color: #cbd5e1; }
  .ma-select option { background: #fff; color: #1e293b; }
  .ma-modal-actions { display: flex; gap: 10px; margin-top: 24px; }
  .ma-btn-cancel-modal { background: #f1f5f9; color: #64748b; border: none; flex: 1; }
  .ma-btn-cancel-modal:hover { background: #e2e8f0; }
  .ma-divider { height: 1px; background: #f1f5f9; margin: 24px 0; }
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
          : <>
              <span className="ma-badge ma-badge-pending">Bekliyor</span>
              <button className="ma-btn ma-btn-approve" onClick={() => approve(b.id)}>Onayla</button>
            </>
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
          <div className="ma-stat s1">
            <div className="ma-stat-label">Toplam İşletme</div>
            <div className="ma-stat-value purple">{list.length}</div>
          </div>
          <div className="ma-stat s2">
            <div className="ma-stat-label">Onaylı</div>
            <div className="ma-stat-value green">{approved.length}</div>
          </div>
          <div className="ma-stat s3">
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
            <div className="ma-divider" />
          </>
        )}

        <div className="ma-section-title">✓ Onaylı İşletmeler</div>
        <div className="ma-list">
          {approved.length === 0
            ? <div className="ma-empty">Henüz onaylı işletme yok</div>
            : approved.map(b => <BusinessCard key={b.id} b={b} />)
          }
        </div>

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