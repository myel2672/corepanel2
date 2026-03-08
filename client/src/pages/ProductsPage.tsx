import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
  .pp { font-family: 'Nunito', sans-serif; color: rgba(255,255,255,0.85); }
  .pp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
  .pp-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
  .pp-add-form { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; }
  .pp-field { display: flex; flex-direction: column; gap: 6px; }
  .pp-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.3); }
  .pp-input, .pp-select { padding: 10px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: rgba(255,255,255,0.85); font-size: 14px; font-family: 'Nunito', sans-serif; outline: none; transition: all 0.15s; width: 140px; }
  .pp-input:focus, .pp-select:focus { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.08); }
  .pp-input::placeholder { color: rgba(255,255,255,0.2); }
  .pp-select option { background: #1a1a2e; color: #fff; }
  .pp-btn { padding: 10px 20px; background: linear-gradient(135deg, #6366f1, #7c3aed); border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 700; font-family: 'Nunito', sans-serif; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .pp-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.3); }
  .pp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .pp-btn-sm { padding: 6px 14px; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; font-family: 'Nunito', sans-serif; cursor: pointer; transition: all 0.15s; }
  .pp-btn-edit { background: rgba(99,102,241,0.15); color: #a78bfa; border: 1px solid rgba(99,102,241,0.2); }
  .pp-btn-save { background: rgba(52,211,153,0.15); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
  .pp-btn-cancel { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.1); }
  .pp-btn-delete { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
  .pp-table { width: 100%; border-collapse: collapse; }
  .pp-th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.25); border-bottom: 1px solid rgba(255,255,255,0.06); }
  .pp-td { padding: 14px 16px; font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.7); border-bottom: 1px solid rgba(255,255,255,0.04); }
  .pp-tr:hover .pp-td { background: rgba(255,255,255,0.02); }
  .pp-stock-low { color: #f87171; font-weight: 700; }
  .pp-stock-ok { color: #34d399; font-weight: 700; }
  .pp-edit-input { padding: 6px 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; color: rgba(255,255,255,0.85); font-size: 13px; font-family: 'Nunito', sans-serif; outline: none; width: 100%; }
  .pp-actions { display: flex; gap: 6px; }
  .pp-empty { padding: 40px; text-align: center; color: rgba(255,255,255,0.2); font-size: 14px; }
  .pp-loading { display: flex; align-items: center; justify-content: center; height: 200px; color: rgba(255,255,255,0.3); font-size: 14px; }
  .pp-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; }
  .pp-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .pp-success { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); color: #34d399; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
`;

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCostPrice, setEditCostPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isMainAdmin = user?.role === 'MAIN_ADMIN';
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MAIN_ADMIN';

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch {
      setFormError('Ürünler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const res = await api.get('/businesses');
      setBusinesses(res.data);
    } catch { console.error('İşletmeler yüklenemedi'); }
  };

  useEffect(() => {
    fetchProducts();
    if (isMainAdmin) fetchBusinesses();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) { setFormError('Ürün adı zorunludur.'); return; }
    if (!price || isNaN(parseFloat(price))) { setFormError('Geçerli bir fiyat girin.'); return; }
    if (!stock || isNaN(parseInt(stock))) { setFormError('Geçerli bir stok girin.'); return; }
    if (isMainAdmin && !selectedBusinessId) { setFormError('Lütfen bir işletme seçin.'); return; }

    setAddLoading(true); setFormError(''); setFormSuccess('');
    try {
      const payload: any = {
        name: name.trim(),
        price: parseFloat(price),
        costPrice: costPrice ? parseFloat(costPrice) : 0,
        stock: parseInt(stock),
      };
      if (isMainAdmin) payload.businessId = Number(selectedBusinessId);

      await api.post('/products', payload);
      setName(''); setPrice(''); setCostPrice(''); setStock(''); setSelectedBusinessId('');
      setFormSuccess('Ürün eklendi.');
      fetchProducts();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Ürün eklenemedi.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    setFormError(''); setFormSuccess('');
    try {
      await api.delete(`/products/${id}`);
      setFormSuccess('Ürün silindi.');
      fetchProducts();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Ürün silinemedi.');
    }
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditCostPrice(String(p.costPrice ?? ''));
    setEditStock(String(p.stock));
  };

  const saveEdit = async (id: number) => {
    setFormError(''); setFormSuccess('');
    try {
      await api.put(`/products/${id}`, {
        name: editName,
        price: parseFloat(editPrice),
        costPrice: parseFloat(editCostPrice || '0'),
        stock: parseInt(editStock),
      });
      setEditingId(null);
      setFormSuccess('Ürün güncellendi.');
      fetchProducts();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Ürün güncellenemedi.');
    }
  };

  if (loading) return (<><style>{styles}</style><div className="pp-loading">Yükleniyor...</div></>);

  return (
    <>
      <style>{styles}</style>
      <div className="pp">
        <div className="pp-header">
          <div className="pp-title">Ürünler</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{products.length} ürün</div>
        </div>

        {formError && <div className="pp-error">{formError}</div>}
        {formSuccess && <div className="pp-success">✓ {formSuccess}</div>}

        {canEdit && (
          <div className="pp-add-form">
            {/* MAIN_ADMIN için işletme seçici */}
            {isMainAdmin && (
              <div className="pp-field">
                <span className="pp-label">İşletme</span>
                <select
                  className="pp-select"
                  style={{ width: 180 }}
                  value={selectedBusinessId}
                  onChange={e => { setSelectedBusinessId(e.target.value); setFormError(''); }}
                >
                  <option value="">— Seçin —</option>
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="pp-field">
              <span className="pp-label">Ürün Adı</span>
              <input className="pp-input" style={{ width: 180 }} placeholder="Ürün adı" value={name} onChange={e => { setName(e.target.value); setFormError(''); }} />
            </div>
            <div className="pp-field">
              <span className="pp-label">Fiyat (₺)</span>
              <input className="pp-input" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} type="number" min="0" />
            </div>
            <div className="pp-field">
              <span className="pp-label">Maliyet (₺)</span>
              <input className="pp-input" placeholder="0.00" value={costPrice} onChange={e => setCostPrice(e.target.value)} type="number" min="0" />
            </div>
            <div className="pp-field">
              <span className="pp-label">Stok</span>
              <input className="pp-input" style={{ width: 100 }} placeholder="0" value={stock} onChange={e => setStock(e.target.value)} type="number" min="0" />
            </div>
            <button className="pp-btn" onClick={handleAdd} disabled={addLoading}>
              {addLoading ? 'Ekleniyor...' : '+ Ürün Ekle'}
            </button>
          </div>
        )}

        <div className="pp-card">
          {products.length === 0 ? (
            <div className="pp-empty">Henüz ürün eklenmemiş</div>
          ) : (
            <table className="pp-table">
              <thead>
                <tr>
                  <th className="pp-th">Ürün Adı</th>
                  {isMainAdmin && <th className="pp-th">İşletme</th>}
                  <th className="pp-th">Fiyat</th>
                  <th className="pp-th">Maliyet</th>
                  <th className="pp-th">Kâr Marjı</th>
                  <th className="pp-th">Stok</th>
                  {canEdit && <th className="pp-th">İşlemler</th>}
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const margin = p.costPrice ? (((p.price - p.costPrice) / p.price) * 100).toFixed(0) : null;
                  return (
                    <tr key={p.id} className="pp-tr">
                      <td className="pp-td" style={{ color: '#fff', fontWeight: 600 }}>
                        {editingId === p.id
                          ? <input className="pp-edit-input" value={editName} onChange={e => setEditName(e.target.value)} />
                          : p.name}
                      </td>
                      {isMainAdmin && (
                        <td className="pp-td" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                          {businesses.find(b => b.id === p.businessId)?.name ?? `#${p.businessId}`}
                        </td>
                      )}
                      <td className="pp-td">
                        {editingId === p.id
                          ? <input className="pp-edit-input" value={editPrice} onChange={e => setEditPrice(e.target.value)} type="number" />
                          : <span style={{ color: '#a78bfa', fontWeight: 700 }}>{p.price} ₺</span>}
                      </td>
                      <td className="pp-td">
                        {editingId === p.id
                          ? <input className="pp-edit-input" value={editCostPrice} onChange={e => setEditCostPrice(e.target.value)} type="number" />
                          : p.costPrice ? `${p.costPrice} ₺` : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                      </td>
                      <td className="pp-td">
                        {margin ? <span style={{ color: '#34d399', fontWeight: 700 }}>%{margin}</span> : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                      </td>
                      <td className="pp-td">
                        {editingId === p.id
                          ? <input className="pp-edit-input" style={{ width: 80 }} value={editStock} onChange={e => setEditStock(e.target.value)} type="number" />
                          : <span className={p.stock < 5 ? 'pp-stock-low' : 'pp-stock-ok'}>{p.stock}</span>}
                      </td>
                      {canEdit && (
                        <td className="pp-td">
                          <div className="pp-actions">
                            {editingId === p.id ? (
                              <>
                                <button className="pp-btn-sm pp-btn-save" onClick={() => saveEdit(p.id)}>Kaydet</button>
                                <button className="pp-btn-sm pp-btn-cancel" onClick={() => setEditingId(null)}>İptal</button>
                              </>
                            ) : (
                              <>
                                <button className="pp-btn-sm pp-btn-edit" onClick={() => startEdit(p)}>Düzenle</button>
                                <button className="pp-btn-sm pp-btn-delete" onClick={() => handleDelete(p.id)}>Sil</button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}