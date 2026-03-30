import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .sp { font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; }
  .sp-header { margin-bottom: 28px; }
  .sp-title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.6px; }
  .sp-subtitle { font-size: 14px; color: #94a3b8; margin-top: 4px; font-weight: 500; }
  .sp-grid { display: grid; grid-template-columns: 360px 1fr; gap: 20px; align-items: start; }
  .sp-form { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .sp-form-title { font-size: 13px; font-weight: 700; color: #94a3b8; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
  .sp-field { margin-bottom: 16px; }
  .sp-label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #94a3b8; margin-bottom: 7px; }
  .sp-input, .sp-select { width: 100%; padding: 11px 14px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; color: #1e293b; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; transition: all 0.15s; box-sizing: border-box; font-weight: 500; }
  .sp-input:focus, .sp-select:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
  .sp-input::placeholder { color: #cbd5e1; }
  .sp-select option { background: #fff; color: #1e293b; }
  .sp-total-preview { padding: 12px 14px; background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 10px; font-size: 14px; font-weight: 700; color: #6366f1; margin-bottom: 16px; display: flex; justify-content: space-between; }
  .sp-btn { width: 100%; padding: 12px; background: #6366f1; border: none; border-radius: 10px; color: #fff; font-size: 15px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.15s; box-shadow: 0 2px 8px rgba(99,102,241,0.25); }
  .sp-btn:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(99,102,241,0.35); }
  .sp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .sp-list-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .sp-list-header { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fafafa; }
  .sp-list-title { font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
  .sp-list-count { font-size: 12px; color: #94a3b8; font-weight: 600; }
  .sp-item { padding: 14px 20px; border-bottom: 1px solid #f8fafc; display: flex; justify-content: space-between; align-items: center; transition: background 0.15s; gap: 12px; }
  .sp-item:last-child { border-bottom: none; }
  .sp-item:hover { background: #f8fafc; }
  .sp-item-name { font-size: 14px; font-weight: 600; color: #1e293b; }
  .sp-item-detail { font-size: 12px; color: #94a3b8; margin-top: 3px; font-weight: 500; }
  .sp-item-total { font-size: 15px; font-weight: 800; color: #6366f1; text-align: right; }
  .sp-item-profit { font-size: 12px; color: #059669; text-align: right; margin-top: 2px; font-weight: 600; }
  .sp-empty { padding: 40px; text-align: center; color: #cbd5e1; font-size: 14px; font-weight: 500; }
  .sp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
  .sp-stat { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: box-shadow 0.2s, transform 0.2s; }
  .sp-stat:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
  .sp-stat-label { font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; }
  .sp-stat-value { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
  .sp-stat-value.accent { color: #6366f1; }
  .sp-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .sp-success { background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .sp-demo-notice { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
  .sp-btn-invoice { padding: 5px 12px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 7px; font-size: 11px; font-weight: 700; color: #6366f1; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s; white-space: nowrap; flex-shrink: 0; }
  .sp-btn-invoice:hover { background: #eef2ff; border-color: #c7d2fe; }

  .inv-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
  .inv-modal { background: #fff; border-radius: 20px; width: 560px; max-width: 95vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 60px rgba(0,0,0,0.2); }
  .inv-actions { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; }
  .inv-btn-print { padding: 9px 20px; background: #6366f1; border: none; border-radius: 9px; color: #fff; font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; box-shadow: 0 2px 8px rgba(99,102,241,0.25); }
  .inv-btn-close { padding: 9px 16px; background: #f1f5f9; border: none; border-radius: 9px; color: #64748b; font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; }
  .inv-doc { padding: 40px; font-family: 'Plus Jakarta Sans', sans-serif; }
  .inv-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; }
  .inv-logo { font-size: 22px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.5px; }
  .inv-tag { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
  .inv-number { text-align: right; }
  .inv-number-label { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
  .inv-number-val { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px; }
  .inv-divider { height: 1px; background: #f1f5f9; margin: 0 0 28px; }
  .inv-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  .inv-meta-label { font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
  .inv-meta-val { font-size: 14px; color: #1e293b; font-weight: 600; }
  .inv-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .inv-table th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
  .inv-table td { padding: 12px 14px; font-size: 14px; color: #475569; border-bottom: 1px solid #f8fafc; font-weight: 500; }
  .inv-table tr:last-child td { border-bottom: none; }
  .inv-total-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; }
  .inv-total-row { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; font-weight: 500; margin-bottom: 8px; }
  .inv-total-row.main { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 0; padding-top: 10px; border-top: 1px solid #e2e8f0; margin-top: 4px; }
  .inv-total-row.main span:last-child { color: #6366f1; }
  .inv-footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #cbd5e1; font-weight: 500; }

  @media print {
    body * { visibility: hidden; }
    .inv-doc, .inv-doc * { visibility: visible; }
    .inv-doc { position: fixed; top: 0; left: 0; width: 100%; padding: 32px; }
    .inv-actions { display: none !important; }
  }
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
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const user = useAuthStore((s) => s.user);
  const isDemo = user?.role === 'DEMO';

  const fetchSales = async () => {
    try { const r = await api.get('/sales/me'); setSales(r.data || []); } catch {}
  };

  const fetchProducts = async () => {
    try { const r = await api.get('/products'); setProducts(r.data || []); } catch {}
  };

  const fetchBusiness = async () => {
    try { const r = await api.get('/businesses/me'); setBusiness(r.data); } catch {}
  };

  useEffect(() => { fetchSales(); fetchProducts(); fetchBusiness(); }, []);

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
      fetchSales(); fetchProducts();
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
            <div className="sp-stat-value" style={{ color: '#059669' }}>{totalProfit.toFixed(2)} ₺</div>
          </div>
          <div className="sp-stat">
            <div className="sp-stat-label">Toplam Adet</div>
            <div className="sp-stat-value">{totalCount}</div>
          </div>
        </div>

        {isDemo ? (
          <div className="sp-demo-notice">
            👁️ Demo hesabında yalnızca görüntüleme yapılabilir. Satış kaydetmek için kayıt olun.
          </div>
        ) : null}

        <div className="sp-grid" style={isDemo ? { gridTemplateColumns: '1fr' } : {}}>
          {!isDemo && (
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
          )}

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
                  const itemName = s.product?.name || s.description || 'Satış';
                  return (
                    <div key={s.id} className="sp-item">
                      <div style={{ flex: 1 }}>
                        <div className="sp-item-name">{itemName}</div>
                        <div className="sp-item-detail">
                          {s.quantity} adet × {s.unitPrice} ₺
                          {s.date ? ` · ${new Date(s.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div>
                          <div className="sp-item-total">{(s.total || 0).toFixed(2)} ₺</div>
                          <div className="sp-item-profit">+{profit.toFixed(2)} ₺ kâr</div>
                        </div>
                        <button className="sp-btn-invoice" onClick={() => setSelectedInvoice(s)}>🧾 Fatura</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedInvoice && (
        <div className="inv-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="inv-modal" onClick={e => e.stopPropagation()}>
            <div className="inv-actions">
              <button className="inv-btn-close" onClick={() => setSelectedInvoice(null)}>✕ Kapat</button>
              <button className="inv-btn-print" onClick={() => window.print()}>🖨️ Yazdır / PDF</button>
            </div>
            <div className="inv-doc">
              <div className="inv-head">
                <div>
                  <div className="inv-logo">{business?.name || 'Corepanel'}</div>
                  <div className="inv-tag">{business?.sector ? business.sector + ' · ' : ''}Satış Faturası</div>
                </div>
                <div className="inv-number">
                  <div className="inv-number-label">Fatura No</div>
                  <div className="inv-number-val">#{String(selectedInvoice.id).padStart(6, '0')}</div>
                </div>
              </div>
              <div className="inv-divider" />
              <div className="inv-meta">
                <div>
                  <div className="inv-meta-label">Tarih</div>
                  <div className="inv-meta-val">{new Date(selectedInvoice.date || selectedInvoice.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <div>
                  <div className="inv-meta-label">Saat</div>
                  <div className="inv-meta-val">{new Date(selectedInvoice.date || selectedInvoice.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                {selectedInvoice.description && (
                  <div style={{ gridColumn: '1/-1' }}>
                    <div className="inv-meta-label">Not</div>
                    <div className="inv-meta-val">{selectedInvoice.description}</div>
                  </div>
                )}
              </div>
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Ürün / Hizmet</th>
                    <th style={{ textAlign: 'center' }}>Adet</th>
                    <th style={{ textAlign: 'right' }}>Birim Fiyat</th>
                    <th style={{ textAlign: 'right' }}>Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ color: '#0f172a', fontWeight: 600 }}>{selectedInvoice.product?.name || selectedInvoice.description || 'Ürün/Hizmet'}</td>
                    <td style={{ textAlign: 'center' }}>{selectedInvoice.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{(selectedInvoice.unitPrice || 0).toFixed(2)} ₺</td>
                    <td style={{ textAlign: 'right', color: '#6366f1', fontWeight: 700 }}>{(selectedInvoice.total || 0).toFixed(2)} ₺</td>
                  </tr>
                </tbody>
              </table>
              <div className="inv-total-box">
                <div className="inv-total-row"><span>Ara Toplam</span><span>{(selectedInvoice.total || 0).toFixed(2)} ₺</span></div>
                <div className="inv-total-row"><span>KDV (%0)</span><span>0.00 ₺</span></div>
                <div className="inv-total-row main"><span>GENEL TOPLAM</span><span>{(selectedInvoice.total || 0).toFixed(2)} ₺</span></div>
              </div>
              <div className="inv-footer">Corepanel Yönetim Sistemi · Bu belge elektronik ortamda oluşturulmuştur.</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}