import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function BusinessPanel() {
  const [me, setMe] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string,string>>({});
  const [period, setPeriod] = useState<'daily'|'monthly'>('daily');
  const [range, setRange] = useState<number>(30);

  const fetch = async () => {
    try {
      const r = await api.get('/businesses/me');
      setMe(r.data);
      const s = await api.get('/sales/me');
      setSales(s.data || []);
      const rep = await api.get(`/reports/sales/summary?period=${period}&range=${range}`);
      setSeries(rep.data.series || []);
      // fetch products for mapping
      const p = await api.get('/products');
      const map: Record<string,string> = {};
      (p.data || []).forEach((x: any) => { map[x.id] = x.name; });
      setProductsMap(map);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetch(); }, []);

  const totalToday = sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).reduce((a, b) => a + (b.total || 0), 0);

  const downloadCSV = async () => {
    try {
      const r = await api.get(`/reports/sales/export?period=${period}&range=${range}`, { responseType: 'blob' as any });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales_${period}_${range}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error('CSV download failed', err); }
  };

  // compute sector-specific metrics
  const customersToday = sales.filter(s => s.category === 'service' && new Date(s.date).toDateString() === new Date().toDateString()).reduce((a,b)=>a+(b.quantity||0),0);
  const totalKg = sales.reduce((a,b)=>a+(b.quantity||0),0);
  const profitTotal = sales.reduce((a,b)=>a+((b.total || 0) - ((b.unitCost||0)*(b.quantity||0))),0);

  // bakkal top products
  const productCounts: Record<string, number> = {};
  sales.forEach(s => { if (s.productId) productCounts[s.productId] = (productCounts[s.productId]||0) + (s.quantity||0); });
  const topProducts = Object.keys(productCounts).map(id => ({ id, qty: productCounts[id], name: productsMap[id] || id })).sort((a,b)=>b.qty-a.qty).slice(0,5);

  const chartData = series.map((s: any) => ({ date: s.label, total: s.total }));

  return (
    <div>
      <h2>İşletme Paneli</h2>
      {me && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1 / -1', padding: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 13, color: '#444' }}>Periyot:</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value as any)} style={{ padding: 6 }}>
              <option value="daily">Günlük</option>
              <option value="monthly">Aylık</option>
            </select>
            <label style={{ fontSize: 13, color: '#444' }}>Aralık:</label>
            <input type="number" value={range} onChange={(e) => setRange(Number(e.target.value) || 1)} style={{ width: 80, padding: 6 }} />
            <button onClick={() => fetch()} style={{ padding: 8 }}>Uygula</button>
            <div style={{ flex: 1 }} />
            <button onClick={downloadCSV} style={{ padding: 8 }}>CSV İndir</button>
          </div>
          <div style={{ padding: 12, background: '#fff', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>İşletme</div>
            <div style={{ fontSize: 18 }}>{me.name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{me.sector}</div>
            <div style={{ marginTop: 12, width: '100%', height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#3182ce" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ padding: 12, background: '#fff', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>Bugünkü Satış</div>
            <div style={{ fontSize: 22 }}>{totalToday?.toFixed(2)} TL</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>Bugünkü müşteri (kuaför): {customersToday}</div>
          </div>
          <div style={{ gridColumn: '1 / -1', padding: 12, background: '#fff', borderRadius: 8 }}>
            <h3>Son Satışlar</h3>
            <ul>
              {sales.map(s => <li key={s.id}>{(s.description || productsMap[s.productId] || s.productId)} — {s.quantity} × {s.unitPrice} = {s.total} — {new Date(s.date).toLocaleString()}</li>)}
            </ul>
          </div>
          {/* Sector-specific quick insights */}
          <div style={{ gridColumn: '1 / -1', padding: 12, background: '#fff', borderRadius: 8 }}>
            <h3>Sektör Özetleri</h3>
            {me.sector === 'Kuafor' && (
              <div>Günlük müşteri sayısı: <b>{customersToday}</b> — Bugünkü kazanç: <b>{totalToday.toFixed(2)} TL</b></div>
            )}
            {me.sector === 'Kasap' && (
              <div>Satılan toplam kg (tahmini): <b>{totalKg} kg</b> — Kar: <b>{profitTotal.toFixed(2)} TL</b></div>
            )}
            {me.sector === 'Bakkal' && (
              <div>
                En çok satılan ürün:
                <ol>
                  {topProducts.map(tp => <li key={tp.id}>{tp.name} — {tp.qty}</li>)}
                </ol>
              </div>
            )}
            {me.sector === 'Galerici' && (
              <div>Satılan araç sayısı: <b>{sales.length}</b> — Toplam kar: <b>{profitTotal.toFixed(2)} TL</b></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
