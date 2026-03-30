import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .pp { font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; }
  .pp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
  .pp-title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.6px; }
  .pp-add-form { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .pp-field { display: flex; flex-direction: column; gap: 6px; }
  .pp-label { font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #94a3b8; }
  .pp-input, .pp-select { padding: 10px 14px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; color: #1e293b; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; transition: all 0.15s; width: 140px; font-weight: 500; }
  .pp-input:focus, .pp-select:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
  .pp-input::placeholder { color: #cbd5e1; }
  .pp-select option { background: #fff; color: #1e293b; }
  .pp-btn { padding: 10px 20px; background: #6366f1; border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.15s; white-space: nowrap; box-shadow: 0 2px 8px rgba(99,102,241,0.25); }
  .pp-btn:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(99,102,241,0.35); }
  .pp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .pp-btn-sm { padding: 6px 14px; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
  .pp-btn-edit { background: #eef2ff; color: #6366f1; border: 1px solid #c7d2fe; }
  .pp-btn-edit:hover { background: #e0e7ff; }
  .pp-btn-save { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
  .pp-btn-cancel { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
  .pp-btn-delete { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
  .pp-btn-delete:hover { background: #fee2e2; }
  .pp-table { width: 100%; border-collapse: collapse; }
  .pp-th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #94a3b8; border-bottom: 1px solid #f1f5f9; background: #fafafa; }
  .pp-td { padding: 14px 16px; font-size: 14px; font-weight: 500; color: #475569; border-bottom: 1px solid #f8fafc; }
  .pp-tr:hover .pp-td { background: #f8fafc; }
  .pp-tr:last-child .pp-td { border-bottom: none; }
  .pp-stock-low { color: #ef4444; font-weight: 700; background: #fef2f2; padding: 2px 8px; border-radius: 6px; }
  .pp-stock-ok { color: #059669; font-weight: 700; background: #ecfdf5; padding: 2px 8px; border-radius: 6px; }
  .pp-edit-input { padding: 6px 10px; background: #f8fafc; border: 1.5px solid #c7d2fe; border-radius: 8px; color: #1e293b; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; width: 100%; font-weight: 500; }
  .pp-actions { display: flex; gap: 6px; }
  .pp-empty { padding: 40px; text-align: center; color: #cbd5e1; font-size: 14px; font-weight: 500; }
  .pp-loading { display: flex; align-items: center; justify-content: center; height: 200px; color: #94a3b8; font-size: 14px; font-weight: 500; }
  .pp-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .pp-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .pp-success { background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .pp-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
  .pp-badge-core { background: #eef2ff; color: #6366f1; border: 1px solid #c7d2fe; }
  .pp-badge-biz { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
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
  const isDemo = user?.role === 'DEMO';const fetchProducts = async () => {
    
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

    setAddLoading(true); setFormError(''); setFormSuccess('');
    try {
      const payload: any = {
        name: name.trim(),
        price: parseFloat(price),
        costPrice: costPrice ? parseFloat(costPrice) : 0,
        stock: parseInt(stock),
      };
      if (isMainAdmin && selectedBusinessId) {
        payload.businessId = Number(selectedBusinessId);
      }
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
          <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{products.length} ürün</div>
        </div>

        {formError && <div className="pp-error">{formError}</div>}
        {formSuccess && <div className="pp-success">✓ {formSuccess}</div>}

        {canEdit && (
          <div className="pp-add-form">
            {isMainAdmin && (
              <div className="pp-field">
                <span className="pp-label">İşletme (İsteğe Bağlı)</span>
                <select className="pp-select" style={{ width: 200 }} value={selectedBusinessId} onChange={e => { setSelectedBusinessId(e.target.value); setFormError(''); }}>
                  <option value="">— Kendi Ürünüm —</option>
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
                  const bizName = p.businessId === null
                    ? null
                    : businesses.find(b => b.id === p.businessId)?.name ?? `#${p.businessId}`;

                  return (
                    <tr key={p.id} className="pp-tr">
                      <td className="pp-td" style={{ color: '#0f172a', fontWeight: 700 }}>
                        {editingId === p.id
                          ? <input className="pp-edit-input" value={editName} onChange={e => setEditName(e.target.value)} />
                          : p.name}
                      </td>
                      {isMainAdmin && (
                        <td className="pp-td">
                          {bizName === null
                            ? <span className="pp-badge pp-badge-core">CorePanel</span>
                            : <span className="pp-badge pp-badge-biz">{bizName}</span>
                          }
                        </td>
                      )}
                      <td className="pp-td">
                        {editingId === p.id
                          ? <input className="pp-edit-input" value={editPrice} onChange={e => setEditPrice(e.target.value)} type="number" />
                          : <span style={{ color: '#6366f1', fontWeight: 700 }}>{p.price} ₺</span>}
                      </td>
                      <td className="pp-td">
                        {editingId === p.id
                          ? <input className="pp-edit-input" value={editCostPrice} onChange={e => setEditCostPrice(e.target.value)} type="number" />
                          : p.costPrice ? `${p.costPrice} ₺` : <span style={{ color: '#cbd5e1' }}>—</span>}
                      </td>
                      <td className="pp-td">
                        {margin
                          ? <span style={{ color: '#059669', fontWeight: 700 }}>%{margin}</span>
                          : <span style={{ color: '#cbd5e1' }}>—</span>}
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