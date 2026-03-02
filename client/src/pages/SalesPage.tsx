import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [products, setProducts] = useState<any[]>([]);

  const fetch = async () => {
    try {
      const r = await api.get('/sales/me');
      setSales(r.data);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    try { const r = await api.get('/products'); setProducts(r.data); } catch (e) { }
  };

  useEffect(() => { fetch(); fetchProducts(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/sales', { productId, quantity, unitPrice, unitCost: 0 });
      setProductId(''); setQuantity(1); setUnitPrice(0);
      fetch();
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <h2>Satışlarım</h2>
      <div style={{ display: 'flex', gap: 12 }}>
        <form onSubmit={create} style={{ minWidth: 320, padding: 12, background: '#fff', borderRadius: 8 }}>
          <div>Ürün</div>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }}>
            <option value="">-- seç --</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div>Adet</div>
          <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
          <div>Birim Fiyat</div>
          <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
          <button type="submit" style={{ padding: 8 }}>Satış Ekle</button>
        </form>

        <div style={{ flex: 1 }}>
          <div style={{ padding: 12, background: '#fff', borderRadius: 8 }}>
            <h3>Son Satışlar</h3>
            <ul>
              {sales.map(s => (
                <li key={s.id}>{s.description || s.productId || 'Satış'} — {s.quantity} × {s.unitPrice} = {s.total} — {new Date(s.date).toLocaleString()}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
