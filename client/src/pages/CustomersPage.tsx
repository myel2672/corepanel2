import { useState, useEffect } from 'react';
import api from '../api/axios';

interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
  orders?: any[];
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .cp-page { font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; }
  .cp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
  .cp-title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.6px; }
  .cp-subtitle { font-size: 13px; color: #94a3b8; margin-top: 3px; font-weight: 500; }
  .cp-btn { padding: 10px 22px; background: #6366f1; border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; box-shadow: 0 2px 8px rgba(99,102,241,0.25); transition: all 0.15s; }
  .cp-btn:hover { background: #4f46e5; transform: translateY(-1px); }
  .cp-btn-sm { padding: 6px 14px; font-size: 12px; border-radius: 8px; border: none; cursor: pointer; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s; }
  .cp-btn-view { background: #f8fafc; color: #6366f1; border: 1.5px solid #e2e8f0; }
  .cp-btn-view:hover { background: #eef2ff; border-color: #c7d2fe; }
  .cp-btn-edit { background: #eef2ff; color: #6366f1; border: 1px solid #c7d2fe; }
  .cp-btn-edit:hover { background: #e0e7ff; }
  .cp-btn-del { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
  .cp-btn-del:hover { background: #fee2e2; }
  .cp-search { width: 100%; padding: 11px 16px; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; color: #1e293b; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; margin-bottom: 20px; box-sizing: border-box; transition: all 0.2s; font-weight: 500; }
  .cp-search:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
  .cp-search::placeholder { color: #cbd5e1; }
  .cp-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .cp-table { width: 100%; border-collapse: collapse; }
  .cp-table th { padding: 13px 20px; text-align: left; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid #f1f5f9; background: #fafafa; }
  .cp-table td { padding: 15px 20px; color: #475569; font-size: 14px; border-bottom: 1px solid #f8fafc; font-weight: 500; }
  .cp-table tr:last-child td { border-bottom: none; }
  .cp-table tr:hover td { background: #f8fafc; }
  .cp-name { font-weight: 700; color: #0f172a; cursor: pointer; }
  .cp-name:hover { color: #6366f1; }
  .cp-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #eef2ff; color: #6366f1; border: 1px solid #c7d2fe; }
  .cp-empty { text-align: center; padding: 60px; color: #cbd5e1; font-size: 15px; font-weight: 500; }
  .cp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .cp-stat { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: box-shadow 0.2s, transform 0.2s; }
  .cp-stat:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
  .cp-stat-val { font-size: 28px; font-weight: 800; color: #6366f1; letter-spacing: -0.8px; }
  .cp-stat-lbl { font-size: 12px; color: #94a3b8; margin-top: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

  /* MODAL ORTAK */
  .cp-modal-bg { position: fixed; inset: 0; background: rgba(15,23,42,0.4); display: flex; align-items: center; justify-content: center; z-index: 999; backdrop-filter: blur(4px); }
  .cp-modal { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 36px; width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
  .cp-modal-title { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 24px; letter-spacing: -0.4px; }
  .cp-input { width: 100%; padding: 11px 14px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; color: #1e293b; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; margin-bottom: 14px; box-sizing: border-box; transition: all 0.2s; font-weight: 500; }
  .cp-input:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
  .cp-input::placeholder { color: #cbd5e1; }
  .cp-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; display: block; }
  .cp-modal-footer { display: flex; gap: 10px; margin-top: 8px; }
  .cp-btn-cancel { padding: 10px 20px; background: #f1f5f9; border: none; border-radius: 10px; color: #64748b; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; flex: 1; transition: all 0.15s; }
  .cp-btn-cancel:hover { background: #e2e8f0; }
  .cp-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-bottom: 14px; }

  /* DETAY MODAL */
  .cp-detail-modal { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; width: 520px; max-width: 95vw; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
  .cp-detail-header { padding: 28px 32px 20px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 16px; }
  .cp-detail-avatar { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #6366f1, #818cf8); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: #fff; flex-shrink: 0; }
  .cp-detail-name { font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.4px; }
  .cp-detail-since { font-size: 12px; color: #94a3b8; margin-top: 3px; font-weight: 500; }
  .cp-detail-body { padding: 24px 32px; }
  .cp-detail-section { margin-bottom: 24px; }
  .cp-detail-section-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px; }
  .cp-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .cp-detail-field { background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 10px; padding: 12px 14px; }
  .cp-detail-field-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
  .cp-detail-field-val { font-size: 14px; font-weight: 600; color: #1e293b; }
  .cp-detail-field-empty { font-size: 13px; color: #cbd5e1; font-weight: 500; }
  .cp-detail-field.full { grid-column: 1 / -1; }
  .cp-order-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 10px; margin-bottom: 8px; }
  .cp-order-item:last-child { margin-bottom: 0; }
  .cp-order-name { font-size: 13px; font-weight: 600; color: #334155; }
  .cp-order-date { font-size: 11px; color: #94a3b8; margin-top: 2px; font-weight: 500; }
  .cp-order-total { font-size: 13px; font-weight: 700; color: #6366f1; }
  .cp-order-empty { font-size: 13px; color: #cbd5e1; text-align: center; padding: 20px; font-weight: 500; }
  .cp-detail-footer { padding: 16px 32px; border-top: 1px solid #f1f5f9; display: flex; gap: 10px; justify-content: flex-end; }
`;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch { setError('Müşteriler yüklenemedi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleSubmit = async () => {
    if (!form.name) { setError('İsim zorunludur'); return; }
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, form);
      } else {
        await api.post('/customers', form);
      }
      setForm({ name: '', phone: '', email: '', address: '' });
      setShowForm(false);
      setEditingCustomer(null);
      fetchCustomers();
    } catch { setError('İşlem başarısız'); }
  };

  const handleEdit = (c: Customer) => {
    setEditingCustomer(c);
    setForm({ name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '' });
    setShowDetail(false);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/customers/${id}`);
      setShowDetail(false);
      fetchCustomers();
    } catch { setError('Silinemedi'); }
  };

  const openDetail = (c: Customer) => {
    setDetailCustomer(c);
    setShowDetail(true);
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search)) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <style>{styles}</style>
      <div className="cp-page">
        <div className="cp-header">
          <div>
            <div className="cp-title">Müşteriler</div>
            <div className="cp-subtitle">{customers.length} müşteri kayıtlı</div>
          </div>
          <button className="cp-btn" onClick={() => { setShowForm(true); setEditingCustomer(null); setForm({ name: '', phone: '', email: '', address: '' }); setError(''); }}>
            + Yeni Müşteri
          </button>
        </div>

        <div className="cp-stats">
          <div className="cp-stat">
            <div className="cp-stat-val">{customers.length}</div>
            <div className="cp-stat-lbl">Toplam Müşteri</div>
          </div>
          <div className="cp-stat">
            <div className="cp-stat-val" style={{ color: '#059669' }}>{customers.filter(c => c.orders && c.orders.length > 0).length}</div>
            <div className="cp-stat-lbl">Siparişi Olan</div>
          </div>
          <div className="cp-stat">
            <div className="cp-stat-val" style={{ color: '#94a3b8' }}>{customers.filter(c => !c.orders || c.orders.length === 0).length}</div>
            <div className="cp-stat-lbl">Henüz Sipariş Yok</div>
          </div>
        </div>

        <input className="cp-search" placeholder="İsim, telefon veya e-posta ile ara..." value={search} onChange={e => setSearch(e.target.value)} />

        {error && <div className="cp-error">{error}</div>}

        <div className="cp-card">
          {loading ? (
            <div className="cp-empty">Yükleniyor...</div>
          ) : filtered.length === 0 ? (
            <div className="cp-empty">Henüz müşteri yok</div>
          ) : (
            <table className="cp-table">
              <thead>
                <tr>
                  <th>Müşteri</th>
                  <th>Telefon</th>
                  <th>E-Posta</th>
                  <th>Sipariş</th>
                  <th>Kayıt Tarihi</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td><span className="cp-name" onClick={() => openDetail(c)}>{c.name}</span></td>
                    <td>{c.phone || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    <td>{c.email || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    <td><span className="cp-badge">{c.orders?.length || 0} sipariş</span></td>
                    <td>{new Date(c.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td style={{ display: 'flex', gap: '8px' }}>
                      <button className="cp-btn-sm cp-btn-view" onClick={() => openDetail(c)}>Detay</button>
                      <button className="cp-btn-sm cp-btn-edit" onClick={() => handleEdit(c)}>Düzenle</button>
                      <button className="cp-btn-sm cp-btn-del" onClick={() => handleDelete(c.id)}>Sil</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* DETAY MODAL */}
      {showDetail && detailCustomer && (
        <div className="cp-modal-bg" onClick={() => setShowDetail(false)}>
          <div className="cp-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="cp-detail-header">
              <div className="cp-detail-avatar">{detailCustomer.name[0].toUpperCase()}</div>
              <div>
                <div className="cp-detail-name">{detailCustomer.name}</div>
                <div className="cp-detail-since">
                  {new Date(detailCustomer.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} tarihinden beri müşteri
                </div>
              </div>
            </div>

            <div className="cp-detail-body">
              {/* İletişim bilgileri */}
              <div className="cp-detail-section">
                <div className="cp-detail-section-title">İletişim Bilgileri</div>
                <div className="cp-detail-grid">
                  <div className="cp-detail-field">
                    <div className="cp-detail-field-label">Telefon</div>
                    {detailCustomer.phone
                      ? <div className="cp-detail-field-val">{detailCustomer.phone}</div>
                      : <div className="cp-detail-field-empty">Belirtilmedi</div>}
                  </div>
                  <div className="cp-detail-field">
                    <div className="cp-detail-field-label">E-Posta</div>
                    {detailCustomer.email
                      ? <div className="cp-detail-field-val">{detailCustomer.email}</div>
                      : <div className="cp-detail-field-empty">Belirtilmedi</div>}
                  </div>
                  <div className="cp-detail-field full">
                    <div className="cp-detail-field-label">Adres</div>
                    {detailCustomer.address
                      ? <div className="cp-detail-field-val">{detailCustomer.address}</div>
                      : <div className="cp-detail-field-empty">Belirtilmedi</div>}
                  </div>
                </div>
              </div>

              {/* Sipariş geçmişi */}
              <div className="cp-detail-section">
                <div className="cp-detail-section-title">
                  Sipariş Geçmişi ({detailCustomer.orders?.length || 0})
                </div>
                {!detailCustomer.orders || detailCustomer.orders.length === 0 ? (
                  <div className="cp-order-empty">Henüz sipariş yok</div>
                ) : (
                  detailCustomer.orders.map((o: any) => (
                    <div key={o.id} className="cp-order-item">
                      <div>
                        <div className="cp-order-name">{o.product?.name || `Sipariş #${o.id}`}</div>
                        <div className="cp-order-date">
                          {new Date(o.createdAt).toLocaleDateString('tr-TR')} · {o.quantity} adet
                        </div>
                      </div>
                      <div className="cp-order-total">
                        {o.product ? (o.quantity * o.product.price).toFixed(2) : '—'} ₺
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="cp-detail-footer">
              <button className="cp-btn-cancel" onClick={() => setShowDetail(false)}>Kapat</button>
              <button className="cp-btn-sm cp-btn-edit" style={{ padding: '9px 18px', fontSize: 13 }} onClick={() => handleEdit(detailCustomer)}>Düzenle</button>
              <button className="cp-btn-sm cp-btn-del" style={{ padding: '9px 18px', fontSize: 13 }} onClick={() => handleDelete(detailCustomer.id)}>Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <div className="cp-modal-bg" onClick={() => setShowForm(false)}>
          <div className="cp-modal" onClick={e => e.stopPropagation()}>
            <div className="cp-modal-title">{editingCustomer ? 'Müşteriyi Düzenle' : 'Yeni Müşteri'}</div>
            {error && <div className="cp-error">{error}</div>}
            <label className="cp-label">İsim *</label>
            <input className="cp-input" placeholder="Ad Soyad" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <label className="cp-label">Telefon</label>
            <input className="cp-input" placeholder="05xx xxx xx xx" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <label className="cp-label">E-Posta</label>
            <input className="cp-input" placeholder="ornek@mail.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <label className="cp-label">Adres</label>
            <input className="cp-input" placeholder="Mahalle, sokak, no..." value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <div className="cp-modal-footer">
              <button className="cp-btn-cancel" onClick={() => setShowForm(false)}>İptal</button>
              <button className="cp-btn" style={{ flex: 2 }} onClick={handleSubmit}>{editingCustomer ? 'Güncelle' : 'Kaydet'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}