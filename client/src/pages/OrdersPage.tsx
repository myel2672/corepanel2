import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
  .op { font-family: 'Nunito', sans-serif; color: rgba(255,255,255,0.85); }
  .op-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 8px; }
  .op-subtitle { font-size: 14px; color: rgba(255,255,255,0.3); margin-bottom: 28px; }
  .op-form { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; }
  .op-field { display: flex; flex-direction: column; gap: 6px; }
  .op-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.3); }
  .op-input, .op-select { padding: 10px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: rgba(255,255,255,0.85); font-size: 14px; font-family: 'Nunito', sans-serif; outline: none; transition: all 0.15s; }
  .op-input:focus, .op-select:focus { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.08); }
  .op-input::placeholder { color: rgba(255,255,255,0.2); }
  .op-select option { background: #1a1a2e; color: #fff; }
  .op-btn { padding: 10px 20px; background: linear-gradient(135deg, #6366f1, #7c3aed); border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 700; font-family: 'Nunito', sans-serif; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .op-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.3); }
  .op-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .op-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; }
  .op-th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.25); border-bottom: 1px solid rgba(255,255,255,0.06); }
  .op-td { padding: 14px 16px; font-size: 14px; color: rgba(255,255,255,0.7); border-bottom: 1px solid rgba(255,255,255,0.04); }
  .op-tr:hover .op-td { background: rgba(255,255,255,0.02); }
  .op-empty { padding: 40px; text-align: center; color: rgba(255,255,255,0.2); font-size: 14px; }
  .op-status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; border: none; cursor: pointer; font-family: 'Nunito', sans-serif; }
  .op-loading { display: flex; align-items: center; justify-content: center; height: 200px; color: rgba(255,255,255,0.3); font-size: 14px; }
  .op-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .op-success { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); color: #34d399; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
`;

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Bekliyor', PROCESSING: 'İşlemde', SHIPPED: 'Kargolandı',
  DELIVERED: 'Teslim Edildi', COMPLETED: 'Tamamlandı', CANCELLED: 'İptal',
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: 'rgba(251,146,60,0.15)', color: '#fb923c' },
  PROCESSING: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  SHIPPED: { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  DELIVERED: { bg: 'rgba(52,211,153,0.15)', color: '#34d399' },
  COMPLETED: { bg: 'rgba(52,211,153,0.15)', color: '#34d399' },
  CANCELLED: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch {
      setFormError('Siparişler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch { console.error('Ürünler yüklenemedi'); }
  };

  useEffect(() => { fetchOrders(); fetchProducts(); }, []);

  const handleAddOrder = async () => {
    if (!selectedProduct) { setFormError('Lütfen ürün seçin.'); return; }
    if (!quantity || parseInt(quantity) < 1) { setFormError('Geçerli bir adet girin.'); return; }
    const product = products.find(p => String(p.id) === selectedProduct);
    if (product && product.stock < parseInt(quantity)) {
      setFormError(`Stok yetersiz. Mevcut: ${product.stock}`); return;
    }
    setAddLoading(true); setFormError(''); setFormSuccess('');
    try {
      await api.post('/orders', { productId: Number(selectedProduct), quantity: parseInt(quantity) });
      setSelectedProduct(''); setQuantity('');
      setFormSuccess('Sipariş başarıyla oluşturuldu.');
      fetchOrders(); fetchProducts();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Sipariş oluşturulamadı.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch {
      setFormError('Durum güncellenemedi.');
    }
  };

  if (loading) return (<><style>{styles}</style><div className="op-loading">Yükleniyor...</div></>);

  return (
    <>
      <style>{styles}</style>
      <div className="op">
        <div className="op-title">Siparişler</div>
        <div className="op-subtitle">{orders.length} sipariş listeleniyor</div>

        {formError && <div className="op-error">{formError}</div>}
        {formSuccess && <div className="op-success">✓ {formSuccess}</div>}

        <div className="op-form">
          <div className="op-field">
            <span className="op-label">Ürün Seç</span>
            <select className="op-select" style={{ width: 260 }} value={selectedProduct} onChange={e => { setSelectedProduct(e.target.value); setFormError(''); }}>
              <option value="">— Ürün seçin —</option>
              {products.map(p => (
                <option key={p.id} value={String(p.id)}>{p.name} — {p.price} ₺ (Stok: {p.stock})</option>
              ))}
            </select>
          </div>
          <div className="op-field">
            <span className="op-label">Adet</span>
            <input className="op-input" style={{ width: 100 }} placeholder="1" type="number" min="1" value={quantity} onChange={e => { setQuantity(e.target.value); setFormError(''); }} />
          </div>
          <button className="op-btn" onClick={handleAddOrder} disabled={addLoading}>
            {addLoading ? 'Oluşturuluyor...' : '+ Sipariş Oluştur'}
          </button>
        </div>

        <div className="op-card">
          {orders.length === 0 ? (
            <div className="op-empty">Henüz sipariş bulunmuyor</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th className="op-th">#</th>
                  <th className="op-th">Ürün</th>
                  <th className="op-th">Müşteri</th>
                  <th className="op-th">Adet</th>
                  <th className="op-th">Toplam</th>
                  <th className="op-th">Tarih</th>
                  <th className="op-th">Durum</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const total = order.product ? order.quantity * order.product.price : 0;
                  const sc = STATUS_COLORS[order.status] || { bg: 'rgba(255,255,255,0.1)', color: '#fff' };
                  return (
                    <tr key={order.id} className="op-tr">
                      <td className="op-td" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>#{order.id}</td>
                      <td className="op-td" style={{ color: '#fff', fontWeight: 600 }}>{order.product?.name ?? '—'}</td>
                      <td className="op-td">{order.customer?.name ?? <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}</td>
                      <td className="op-td">{order.quantity}</td>
                      <td className="op-td" style={{ color: '#a78bfa', fontWeight: 700 }}>{total.toFixed(2)} ₺</td>
                      <td className="op-td" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                        {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="op-td">
                        <select className="op-status" value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)} style={{ background: sc.bg, color: sc.color }}>
                          {Object.entries(STATUS_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </td>
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