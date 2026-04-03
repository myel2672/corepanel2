import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import Pagination from '../components/Pagination';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .op { font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; }
  .op-title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.6px; margin-bottom: 6px; }
  .op-subtitle { font-size: 14px; color: #94a3b8; margin-bottom: 28px; font-weight: 500; }
  .op-form { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .op-field { display: flex; flex-direction: column; gap: 6px; }
  .op-label { font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #94a3b8; }
  .op-input, .op-select { padding: 10px 14px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; color: #1e293b; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; transition: all 0.15s; font-weight: 500; }
  .op-input:focus, .op-select:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
  .op-input::placeholder { color: #cbd5e1; }
  .op-select option { background: #fff; color: #1e293b; }
  .op-btn { padding: 10px 20px; background: #6366f1; border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.15s; white-space: nowrap; box-shadow: 0 2px 8px rgba(99,102,241,0.25); }
  .op-btn:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(99,102,241,0.35); }
  .op-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .op-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .op-th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #94a3b8; border-bottom: 1px solid #f1f5f9; background: #fafafa; }
  .op-td { padding: 14px 16px; font-size: 14px; color: #475569; border-bottom: 1px solid #f8fafc; font-weight: 500; }
  .op-tr:hover .op-td { background: #f8fafc; }
  .op-tr:last-child .op-td { border-bottom: none; }
  .op-empty { padding: 40px; text-align: center; color: #cbd5e1; font-size: 14px; font-weight: 500; }
  .op-loading { display: flex; align-items: center; justify-content: center; height: 200px; color: #94a3b8; font-size: 14px; font-weight: 500; }
  .op-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .op-success { background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .op-demo-notice { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .op-status-select { padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; }
  .op-status-text { padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; }
  .op-customer-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #f0fdf4; color: #059669; border: 1px solid #bbf7d0; }
  .op-customer-meta { display: flex; flex-direction: column; gap: 4px; }
  .op-customer-address { font-size: 12px; color: #94a3b8; line-height: 1.4; max-width: 240px; }
  .op-btn-invoice { padding: 5px 12px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 7px; font-size: 11px; font-weight: 700; color: #6366f1; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s; white-space: nowrap; }
  .op-btn-invoice:hover { background: #eef2ff; border-color: #c7d2fe; }

  /* FATURA MODAL */
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

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Bekliyor', PROCESSING: 'İşlemde', SHIPPED: 'Kargolandı',
  DELIVERED: 'Teslim Edildi', COMPLETED: 'Tamamlandı', CANCELLED: 'İptal',
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING:    { bg: '#fff7ed', color: '#ea580c' },
  PROCESSING: { bg: '#eef2ff', color: '#6366f1' },
  SHIPPED:    { bg: '#f5f3ff', color: '#7c3aed' },
  DELIVERED:  { bg: '#ecfdf5', color: '#059669' },
  COMPLETED:  { bg: '#ecfdf5', color: '#059669' },
  CANCELLED:  { bg: '#fef2f2', color: '#dc2626' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const user = useAuthStore((s) => s.user);
  const isDemo = user?.role === 'DEMO';
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [quantity, setQuantity] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0, hasNext: false, hasPrev: false });

  const fetchOrders = async (p = page) => {
    try {
      const res = await api.get('/orders', { params: { page: p, limit: 20 } });
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setFormError('Siparişler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try { const res = await api.get('/products'); setProducts(res.data); } catch {}
  };

  const fetchCustomers = async () => {
    try { const res = await api.get('/customers'); setCustomers(res.data); } catch {}
  };

  const fetchBusiness = async () => {
    try { const r = await api.get('/businesses/me'); setBusiness(r.data); } catch {}
  };

  useEffect(() => { fetchOrders(); fetchProducts(); fetchCustomers(); fetchBusiness(); }, []);
  useEffect(() => { fetchOrders(page); }, [page]);

  const handleAddOrder = async () => {
    if (!selectedProduct) { setFormError('Lütfen ürün seçin.'); return; }
    if (!quantity || parseInt(quantity) < 1) { setFormError('Geçerli bir adet girin.'); return; }
    const product = products.find(p => String(p.id) === selectedProduct);
    if (product && product.stock < parseInt(quantity)) {
      setFormError(`Stok yetersiz. Mevcut: ${product.stock}`); return;
    }
    setAddLoading(true); setFormError(''); setFormSuccess('');
    try {
      await api.post('/orders', {
        productId: Number(selectedProduct),
        quantity: parseInt(quantity),
        customerId: selectedCustomer ? Number(selectedCustomer) : null,
      });
      setSelectedProduct(''); setQuantity(''); setSelectedCustomer('');
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
        <div className="op-subtitle">{pagination.total} sipariş listeleniyor · Müşteri bazlı takip edilen sipariş akışı</div>

        {formError && <div className="op-error">{formError}</div>}
        {formSuccess && <div className="op-success">✓ {formSuccess}</div>}

        {isDemo && (
          <div className="op-demo-notice">
            👁️ Demo hesabında yalnızca görüntüleme yapılabilir. Sipariş oluşturmak için kayıt olun.
          </div>
        )}

        {!isDemo && (
          <div className="op-form">
            <div className="op-field">
              <span className="op-label">Ürün Seç</span>
              <select className="op-select" style={{ width: 220 }} value={selectedProduct} onChange={e => { setSelectedProduct(e.target.value); setFormError(''); }}>
                <option value="">— Ürün seçin —</option>
                {products.map(p => (
                  <option key={p.id} value={String(p.id)}>{p.name} — {p.price} ₺ (Stok: {p.stock})</option>
                ))}
              </select>
            </div>
            <div className="op-field">
              <span className="op-label">Müşteri (Sipariş Takibi İçin)</span>
              <select className="op-select" style={{ width: 200 }} value={selectedCustomer} onChange={e => { setSelectedCustomer(e.target.value); setFormError(''); }}>
                <option value="">— Müşteri seçin —</option>
                {customers.map(c => (
                  <option key={c.id} value={String(c.id)}>{c.name}{c.phone ? ` · ${c.phone}` : ''}</option>
                ))}
              </select>
            </div>
            <div className="op-field">
              <span className="op-label">Adet</span>
              <input className="op-input" style={{ width: 90 }} placeholder="1" type="number" min="1" value={quantity} onChange={e => { setQuantity(e.target.value); setFormError(''); }} />
            </div>
            <button className="op-btn" onClick={handleAddOrder} disabled={addLoading}>
              {addLoading ? 'Oluşturuluyor...' : '+ Sipariş Oluştur'}
            </button>
          </div>
        )}

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
                  <th className="op-th"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const total = order.product ? order.quantity * order.product.price : 0;
                  const sc = STATUS_COLORS[order.status] || { bg: '#f1f5f9', color: '#64748b' };
                  return (
                    <tr key={order.id} className="op-tr">
                      <td className="op-td" style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 700 }}>#{order.id}</td>
                      <td className="op-td" style={{ color: '#0f172a', fontWeight: 700 }}>{order.product?.name ?? '—'}</td>
                      <td className="op-td">
                        {order.customer ? (
                          <div className="op-customer-meta">
                            <span className="op-customer-badge">👤 {order.customer.name}</span>
                            {order.customer.address ? (
                              <span className="op-customer-address">{order.customer.address}</span>
                            ) : null}
                          </div>
                        ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                      </td>
                      <td className="op-td" style={{ fontWeight: 600 }}>{order.quantity}</td>
                      <td className="op-td" style={{ color: '#6366f1', fontWeight: 800 }}>{total.toFixed(2)} ₺</td>
                      <td className="op-td" style={{ color: '#94a3b8', fontSize: 13 }}>
                        {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="op-td">
                        {isDemo ? (
                          <span className="op-status-text" style={{ background: sc.bg, color: sc.color }}>
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                        ) : (
                          <select
                            className="op-status-select"
                            value={order.status}
                            onChange={e => handleStatusChange(order.id, e.target.value)}
                            style={{ background: sc.bg, color: sc.color }}
                          >
                            {Object.entries(STATUS_LABELS).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="op-td">
                        <button className="op-btn-invoice" onClick={() => setSelectedInvoice(order)}>
                          🧾 Fatura
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          onPageChange={setPage}
        />
      </div>

      {/* FATURA MODAL */}
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
                  <div className="inv-tag">{business?.sector ? business.sector + ' · ' : ''}Sipariş Faturası</div>
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
                  <div className="inv-meta-val">{new Date(selectedInvoice.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <div>
                  <div className="inv-meta-label">Saat</div>
                  <div className="inv-meta-val">{new Date(selectedInvoice.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                {selectedInvoice.customer && (
                  <div style={{ gridColumn: '1/-1' }}>
                    <div className="inv-meta-label">Müşteri</div>
                    <div className="inv-meta-val">{selectedInvoice.customer.name}{selectedInvoice.customer.phone ? ` · ${selectedInvoice.customer.phone}` : ''}</div>
                  </div>
                )}
                {selectedInvoice.customer && (
                  <div style={{ gridColumn: '1/-1' }}>
                    <div className="inv-meta-label">Adres</div>
                    <div className="inv-meta-val">{selectedInvoice.customer.address || 'Adres belirtilmedi'}</div>
                  </div>
                )}
                <div style={{ gridColumn: '1/-1' }}>
                  <div className="inv-meta-label">Durum</div>
                  <div className="inv-meta-val">{STATUS_LABELS[selectedInvoice.status] || selectedInvoice.status}</div>
                </div>
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
                    <td style={{ color: '#0f172a', fontWeight: 600 }}>{selectedInvoice.product?.name || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{selectedInvoice.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{(selectedInvoice.product?.price || 0).toFixed(2)} ₺</td>
                    <td style={{ textAlign: 'right', color: '#6366f1', fontWeight: 700 }}>{(selectedInvoice.quantity * (selectedInvoice.product?.price || 0)).toFixed(2)} ₺</td>
                  </tr>
                </tbody>
              </table>
              <div className="inv-total-box">
                <div className="inv-total-row"><span>Ara Toplam</span><span>{(selectedInvoice.quantity * (selectedInvoice.product?.price || 0)).toFixed(2)} ₺</span></div>
                <div className="inv-total-row"><span>KDV (%0)</span><span>0.00 ₺</span></div>
                <div className="inv-total-row main"><span>GENEL TOPLAM</span><span>{(selectedInvoice.quantity * (selectedInvoice.product?.price || 0)).toFixed(2)} ₺</span></div>
              </div>
              <div className="inv-footer">Corepanel Yönetim Sistemi · Bu belge elektronik ortamda oluşturulmuştur.</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
