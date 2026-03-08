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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
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
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch { setError('Silinemedi'); }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search)) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
        .cp-page { min-height: 100vh; background: #0f1117; padding: 32px; font-family: 'Nunito', sans-serif; }
        .cp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
        .cp-title { font-size: 24px; font-weight: 800; color: #fff; }
        .cp-subtitle { font-size: 13px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .cp-btn { padding: 10px 20px; background: linear-gradient(135deg,#6366f1,#7c3aed); border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Nunito', sans-serif; }
        .cp-btn:hover { opacity: 0.9; }
        .cp-btn-sm { padding: 6px 14px; font-size: 12px; border-radius: 8px; border: none; cursor: pointer; font-weight: 700; font-family: 'Nunito', sans-serif; }
        .cp-btn-edit { background: rgba(99,102,241,0.15); color: #818cf8; }
        .cp-btn-del { background: rgba(239,68,68,0.1); color: #f87171; }
        .cp-search { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-size: 14px; font-family: 'Nunito', sans-serif; outline: none; margin-bottom: 20px; }
        .cp-search::placeholder { color: rgba(255,255,255,0.25); }
        .cp-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; }
        .cp-table { width: 100%; border-collapse: collapse; }
        .cp-table th { padding: 14px 20px; text-align: left; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .cp-table td { padding: 16px 20px; color: rgba(255,255,255,0.8); font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .cp-table tr:last-child td { border-bottom: none; }
        .cp-table tr:hover td { background: rgba(255,255,255,0.02); }
        .cp-name { font-weight: 700; color: #fff; }
        .cp-badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: rgba(99,102,241,0.15); color: #818cf8; }
        .cp-empty { text-align: center; padding: 60px; color: rgba(255,255,255,0.25); font-size: 15px; }
        .cp-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 999; }
        .cp-modal { background: #1a1d27; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 36px; width: 440px; }
        .cp-modal-title { font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 24px; }
        .cp-input { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 14px; font-family: 'Nunito', sans-serif; outline: none; margin-bottom: 14px; box-sizing: border-box; }
        .cp-input::placeholder { color: rgba(255,255,255,0.25); }
        .cp-input:focus { border-color: rgba(99,102,241,0.5); }
        .cp-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; display: block; }
        .cp-modal-footer { display: flex; gap: 10px; margin-top: 8px; }
        .cp-btn-cancel { padding: 10px 20px; background: rgba(255,255,255,0.06); border: none; border-radius: 10px; color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Nunito', sans-serif; flex: 1; }
        .cp-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 14px; }
        .cp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .cp-stat { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; }
        .cp-stat-val { font-size: 28px; font-weight: 800; color: #fff; }
        .cp-stat-lbl { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 4px; font-weight: 600; }
      `}</style>

      <div className="cp-page">
        <div className="cp-header">
          <div>
            <div className="cp-title">Müşteriler</div>
            <div className="cp-subtitle">{customers.length} müşteri kayıtlı</div>
          </div>
          <button className="cp-btn" onClick={() => { setShowForm(true); setEditingCustomer(null); setForm({ name: '', phone: '', email: '', address: '' }); }}>
            + Yeni Müşteri
          </button>
        </div>

        <div className="cp-stats">
          <div className="cp-stat">
            <div className="cp-stat-val">{customers.length}</div>
            <div className="cp-stat-lbl">Toplam Müşteri</div>
          </div>
          <div className="cp-stat">
            <div className="cp-stat-val">{customers.filter(c => c.orders && c.orders.length > 0).length}</div>
            <div className="cp-stat-lbl">Siparişi Olan</div>
          </div>
          <div className="cp-stat">
            <div className="cp-stat-val">{customers.filter(c => !c.orders || c.orders.length === 0).length}</div>
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
                    <td><span className="cp-name">{c.name}</span></td>
                    <td>{c.phone || <span style={{color:'rgba(255,255,255,0.2)'}}>—</span>}</td>
                    <td>{c.email || <span style={{color:'rgba(255,255,255,0.2)'}}>—</span>}</td>
                    <td><span className="cp-badge">{c.orders?.length || 0} sipariş</span></td>
                    <td>{new Date(c.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td style={{display:'flex', gap:'8px'}}>
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

      {showForm && (
        <div className="cp-modal-bg" onClick={() => setShowForm(false)}>
          <div className="cp-modal" onClick={e => e.stopPropagation()}>
            <div className="cp-modal-title">{editingCustomer ? 'Müşteriyi Düzenle' : 'Yeni Müşteri'}</div>
            {error && <div className="cp-error">{error}</div>}
            <label className="cp-label">İsim *</label>
            <input className="cp-input" placeholder="Ad Soyad" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <label className="cp-label">Telefon</label>
            <input className="cp-input" placeholder="05xx xxx xx xx" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            <label className="cp-label">E-Posta</label>
            <input className="cp-input" placeholder="ornek@mail.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <label className="cp-label">Adres</label>
            <input className="cp-input" placeholder="Adres..." value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            <div className="cp-modal-footer">
              <button className="cp-btn-cancel" onClick={() => setShowForm(false)}>İptal</button>
              <button className="cp-btn" style={{flex:2}} onClick={handleSubmit}>{editingCustomer ? 'Güncelle' : 'Kaydet'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}