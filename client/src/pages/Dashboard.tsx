import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/dashboard/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Dashboard yuklenemedi', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []);

  if (loading) return <div>Yukleniyor...</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      {summary ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div style={{ padding: 16, background: '#fff', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>Toplam Sipariş</div>
            <div style={{ fontSize: 24 }}>{summary.totalOrders}</div>
          </div>
          <div style={{ padding: 16, background: '#fff', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>Toplam Satis</div>
            <div style={{ fontSize: 24 }}>{summary.totalSales?.toFixed(2)} TL</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Maliyet: {summary.totalCost?.toFixed(2)} TL</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>Kar: {summary.profit?.toFixed(2)} TL</div>
          </div>
          <div style={{ padding: 16, background: '#fff', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>En Cok Satanlar</div>
            <div>
              {summary.top.map((t: any) => (
                <div key={t.product?.id}>{t.product?.name} — {t.sold}</div>
              ))}
            </div>
            {/* Improved SVG bar chart with axes and tooltips */}
            <div style={{ marginTop: 12 }}>
              <svg viewBox="0 0 200 120" width="100%" height={160} preserveAspectRatio="none">
                {/* axes */}
                <line x1={20} y1={10} x2={20} y2={90} stroke="#ccc" />
                <line x1={20} y1={90} x2={190} y2={90} stroke="#ccc" />
                {/* bars */}
                {summary.top.map((t: any, i: number) => {
                  const max = Math.max(...summary.top.map((x: any) => x.sold || 0), 1);
                  const barMaxHeight = 70;
                  const barHeight = (t.sold / max) * barMaxHeight;
                  const gap = 10;
                  const barWidth = (160 / Math.max(summary.top.length, 1)) - gap;
                  const x = 20 + i * (barWidth + gap) + gap/2;
                  const y = 90 - barHeight;
                  return (
                    <g key={i}>
                      <rect x={x} y={y} width={barWidth} height={barHeight} fill="#3182ce" rx={3} />
                      <title>{`${t.product?.name || 'Product'} — ${t.sold}`}</title>
                      <text x={x + barWidth/2} y={95} fontSize={8} fill="#222" textAnchor="middle">{t.product?.name?.slice(0,10)}</text>
                      <text x={x + barWidth/2} y={y - 4} fontSize={8} fill="#222" textAnchor="middle">{t.sold}</text>
                    </g>
                  );
                })}
                {/* y-axis labels */}
                <text x={6} y={18} fontSize={8} fill="#666">{Math.ceil(Math.max(...summary.top.map((x: any) => x.sold || 0),1))}</text>
                <text x={6} y={94} fontSize={8} fill="#666">0</text>
              </svg>
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1', padding: 16, background: '#fff', borderRadius: 8 }}>
            <div style={{ fontSize: 14, marginBottom: 8 }}>Stok Alarm (stok &lt; 5)</div>
            {summary.lowStock.length === 0 ? <div>Herhangi bir urun stok alarminda degil.</div> : (
              <ul>
                {summary.lowStock.map((p: any) => (
                  <li key={p.id}>{p.name} — Stok: {p.stock}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div>Ozet yok</div>
      )}
    </div>
  );
}
