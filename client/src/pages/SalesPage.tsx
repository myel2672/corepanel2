import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
  .sp { font-family: 'Nunito', sans-serif; color: rgba(255,255,255,0.85); }
  .sp-header { margin-bottom: 28px; }
  .sp-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
  .sp-subtitle { font-size: 14px; color: rgba(255,255,255,0.3); margin-top: 4px; }
  .sp-grid { display: grid; grid-template-columns: 360px 1fr; gap: 20px; align-items: start; }
  .sp-form { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; }
  .sp-form-title { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.6); margin-bottom: 20px; }
  .sp-field { margin-bottom: 16px; }
  .sp-label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 7px; }
  .sp-input, .sp-select { width: 100%; padding: 11px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: rgba(255,255,255,0.85); font-size: 14px; font-family: 'Nunito', sans-serif; outline: none; transition: all 0.15s; box-sizing: border-box; }
  .sp-input:focus, .sp-select:focus { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.08); }
  .sp-input::placeholder { color: rgba(255,255,255,0.2); }
  .sp-select option { background: #1a1a2e; }
  .sp-total-preview { padding: 12px 14px; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.15); border-radius: 10px; font-size: 14px; font-weight: 700; color: #a78bfa; margin-bottom: 16px; display: flex; justify-content: space-between; }
  .sp-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #6366f1, #7c3aed); border: none; border-radius: 10px; color: #fff; font-size: 15px; font-weight: 700; font-family: 'Nunito', sans-serif; cursor: pointer; transition: all 0.15s; }
  .sp-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.3); }
  .sp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .sp-list-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; }
  .sp-list-header { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; }
  .sp-list-title { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.6); }
  .sp-list-count { font-size: 12px; color: rgba(255,255,255,0.25); }
  .sp-item { padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center; }
  .sp-item:last-child { border-bottom: none; }
  .sp-item:hover { background: rgba(255,255,255,0.02); }
  .sp-item-name { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.8); }
  .sp-item-detail { font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 3px; }
  .sp-item-total { font-size: 15px; font-weight: 800; color: #a78bfa; }
  .sp-item-profit { font-size: 12px; color: #34d399; text-align: right; margin-top: 2px; }
  .sp-empty { padding: 40px; text-align: center; color: rgba(255,255,255,0.2); font-size: 14px; }
  .sp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
  .sp-stat { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; }
  .sp-stat-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 8px; }
  .sp-stat-value { font-size: 22px; font-weight: 800; color: #fff; }
  .sp-stat-value.accent { background: linear-gradient(135deg,#6366f1,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .sp-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .sp-success { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); color: #34d399; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
`;

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [description, setDescription] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const user = useAuthStore((s) => s.user);

  const fetchSales = async () => {
    try {
      // ✅ /sales/me → backend token'dan businessId alıp filtreler
      const r = await api.get('/sales/me');
      setSales(r.data || []);
    } catch (err: any) {
      console.error('Satışlar yüklenemedi:', err?.response?.data || err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      // ✅ Backend token'dan businessId alıyor
      const r = await api.get('/products');
      setProducts(r.data || []);
    } catch { console.error('Ürünler yüklenemedi'); }
  };

  useEffect(() => { fetchSales(); fetchProducts(); }, []);

  const handleProductChange = (id: string) => {
    setProductId(id);
    setFormError('');
    const p = products.find((x: any) => x.id === id);
    if (p) { setUnitPrice(p.price); setUnitCost(p.costPrice || 0); }
  };

  const handleCreate = async () => {
    if (!productId) { setFormError('Lütfen ürün seçin.'); return; }
    if (quantity < 1) { setFormError('Adet en az 1 olmalıdır.'); return; }
    if (unitPrice <= 0) { setFormError('Geçerli bir birim fiyat girin.'); return; }

    setSaveLoading(true); setFormError(''); setFormSuccess('');
    try {
      await api.post('/sales', { productId, quantity, unitPrice, unitCost, description });
      setProductId(''); setQuantity(1); setUnitPrice(0); setUnitCost(0); setDescription('');
      setFormSuccess('Satış başarıyla kaydedildi.');
      fetchSales(); fetchProducts(); // stok güncellemesi için
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Satış kaydedilemedi.');
    } finally {
      setSaveLoading(false);
    }
  };

  const totalRevenue = sales.reduce((a: number, s: any) => a + (s.total || 0), 0);
  const totalProfit = sales.reduce((a: number, s: any) => a + ((s.total || 0) - (s.unitCost || 0) * (s.quantity || 0)), 0);
  const totalCount = sales.reduce((a: number, s: any) => a + (s.quantity || 0), 0);
  const previewTotal = quantity * unitPrice;

  return (
    <>
      <style>{styles}</style>
      <div className="sp">
        <div className="sp-header">
          <div className="sp-title">Satışlar</div>
          <div className="sp-subtitle">İşletmenizin satış kayıtları</div>
        </div>

        {formError && <div className="sp-error">{formError}</div>}
        {formSuccess && <div className="sp-success">✓ {formSuccess}</div>}

        <div className="sp-stats">
          <div className="sp-stat">
            <div className="sp-stat-label">Toplam Satış</div>
            <div className="sp-stat-value accent">{totalRevenue.toFixed(2)} ₺</div>
          </div>
          <div className="sp-stat">
            <div className="sp-stat-label">Toplam Kâr</div>
            <div className="sp-stat-value" style={{ color: '#34d399' }}>{totalProfit.toFixed(2)} ₺</div>
          </div>
          <div className="sp-stat">
            <div className="sp-stat-label">Toplam Adet</div>
            <div className="sp-stat-value">{totalCount}</div>
          </div>
        </div>

        <div className="sp-grid">
          <div className="sp-form">
            <div className="sp-form-title">Yeni Satış Ekle</div>
            <div className="sp-field">
              <label className="sp-label">Ürün</label>
              <select className="sp-select" value={productId} onChange={e => handleProductChange(e.target.value)}>
                <option value="">— Ürün seçin —</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>
                ))}
              </select>
            </div>
            <div className="sp-field">
              <label className="sp-label">Açıklama (opsiyonel)</label>
              <input className="sp-input" placeholder="Satış notu..." value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="sp-field">
                <label className="sp-label">Adet</label>
                <input className="sp-input" type="number" min={1} value={quantity} onChange={e => { setQuantity(Number(e.target.value)); setFormError(''); }} />
              </div>
              <div className="sp-field">
                <label className="sp-label">Birim Fiyat (₺)</label>
                <input className="sp-input" type="number" min={0} value={unitPrice} onChange={e => { setUnitPrice(Number(e.target.value)); setFormError(''); }} />
              </div>
            </div>
            <div className="sp-field">
              <label className="sp-label">Maliyet (₺)</label>
              <input className="sp-input" type="number" min={0} value={unitCost} onChange={e => setUnitCost(Number(e.target.value))} />
            </div>
            {previewTotal > 0 && (
              <div className="sp-total-preview">
                <span>Toplam</span>
                <span>{previewTotal.toFixed(2)} ₺</span>
              </div>
            )}
            <button className="sp-btn" onClick={handleCreate} disabled={saveLoading}>
              {saveLoading ? 'Kaydediliyor...' : 'Satışı Kaydet'}
            </button>
          </div>

          <div>
            <div className="sp-list-card">
              <div className="sp-list-header">
                <div className="sp-list-title">Son Satışlar</div>
                <div className="sp-list-count">{sales.length} kayıt</div>
              </div>
              {sales.length === 0 ? (
                <div className="sp-empty">Henüz satış kaydı yok</div>
              ) : (
                sales.slice().reverse().map((s: any) => {
                  const profit = (s.total || 0) - (s.unitCost || 0) * (s.quantity || 0);
                  // ✅ Ürün adını göster: backend artık product include ediyor
                  const itemName = s.product?.name || s.description || 'Satış';
                  return (
                    <div key={s.id} className="sp-item">
                      <div>
                        <div className="sp-item-name">{itemName}</div>
                        <div className="sp-item-detail">
                          {s.quantity} adet × {s.unitPrice} ₺
                          {s.date ? ` · ${new Date(s.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}
                        </div>
                      </div>
                      <div>
                        <div className="sp-item-total">{(s.total || 0).toFixed(2)} ₺</div>
                        <div className="sp-item-profit">+{profit.toFixed(2)} ₺ kâr</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
