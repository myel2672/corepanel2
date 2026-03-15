import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .db-page { font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; }
  .db-header { margin-bottom: 28px; }
  .db-title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.6px; }
  .db-subtitle { font-size: 14px; color: #94a3b8; margin-top: 4px; font-weight: 500; }
  .db-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
  .db-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
  .db-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: box-shadow 0.2s, transform 0.2s; position: relative; overflow: hidden; }
  .db-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08); transform: translateY(-1px); }
  .db-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 16px 16px 0 0; }
  .db-card.c1::after { background: linear-gradient(90deg, #6366f1, #818cf8); }
  .db-card.c2::after { background: linear-gradient(90deg, #10b981, #34d399); }
  .db-card.c3::after { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
  .db-card.c4::after { background: linear-gradient(90deg, #ec4899, #f472b6); }
  .db-card-label { font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #94a3b8; margin-bottom: 12px; }
  .db-card-value { font-size: 30px; font-weight: 800; color: #0f172a; letter-spacing: -1px; }
  .db-card-value.accent { color: #6366f1; }
  .db-card-value.green { color: #059669; }
  .db-card-value.orange { color: #d97706; }
  .db-card-value.pink { color: #db2777; }
  .db-card-sub { font-size: 12px; color: #94a3b8; margin-top: 6px; font-weight: 500; }
  .db-card-profit { font-size: 13px; font-weight: 700; color: #059669; margin-top: 6px; }
  .db-card-breakdown { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
  .db-pill { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
  .db-pill-order { background: #eef2ff; color: #6366f1; }
  .db-pill-sale { background: #ecfdf5; color: #059669; }
  .db-wide { grid-column: 1 / -1; }
  .db-two-thirds { grid-column: span 2; }
  .db-half { grid-column: span 1; }
  .db-alarm-title { font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .db-alarm-ok { font-size: 13px; color: #059669; font-weight: 600; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px 12px; border-radius: 8px; }
  .db-alarm-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
  .db-alarm-item:last-child { border-bottom: none; }
  .db-alarm-name { font-size: 13px; font-weight: 600; color: #334155; }
  .db-alarm-badge { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
  .db-top-item { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid #f1f5f9; }
  .db-top-item:last-child { border-bottom: none; }
  .db-top-name { font-size: 13px; font-weight: 600; color: #334155; }
  .db-top-sold { font-size: 12px; font-weight: 700; color: #6366f1; background: #eef2ff; padding: 2px 8px; border-radius: 6px; }
  .db-loading { display: flex; align-items: center; justify-content: center; height: 200px; color: #94a3b8; font-size: 14px; font-weight: 500; }
  .db-chart-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 20px; }
`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4, fontWeight: 600 }}>{label}</div>
        <div style={{ color: '#6366f1', fontWeight: 800, fontSize: 15 }}>{payload[0].value.toFixed(2)} ₺</div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/summary');
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, [location.pathname]);

  if (loading) return (<><style>{styles}</style><div className="db-loading">Yükleniyor...</div></>);

  const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const chartProps = {
    cartesianGrid: <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />,
    xAxis: <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} axisLine={false} tickLine={false} />,
    yAxis: <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} axisLine={false} tickLine={false} />,
  };

  if (summary?.isMainAdmin) {
    return (
      <>
        <style>{styles}</style>
        <div className="db-page">
          <div className="db-header">
            <div className="db-title">Sistem Genel Bakış</div>
            <div className="db-subtitle">{today}</div>
          </div>

          <div className="db-grid">
            <div className="db-card c1">
              <div className="db-card-label">İşletmeler</div>
              <div className="db-card-value accent">{summary.totalBusinesses ?? 0}</div>
              <div className="db-card-sub">Kayıtlı işletme</div>
            </div>
            <div className="db-card c2">
              <div className="db-card-label">Müşteriler</div>
              <div className="db-card-value">{summary.totalCustomers ?? 0}</div>
              <div className="db-card-sub">Toplam kayıt</div>
            </div>
            <div className="db-card c3">
              <div className="db-card-label">Siparişler</div>
              <div className="db-card-value orange">{summary.totalOrders ?? 0}</div>
              <div className="db-card-sub">Tüm zamanlar</div>
            </div>
            <div className="db-card c4">
              <div className="db-card-label">Toplam Ciro</div>
              <div className="db-card-value green">{(summary.totalSales ?? 0).toFixed(2)} ₺</div>
              <div className="db-card-breakdown">
                <span className="db-pill db-pill-order">Sipariş: {(summary.orderRevenue ?? 0).toFixed(2)} ₺</span>
                <span className="db-pill db-pill-sale">Satış: {(summary.saleRevenue ?? 0).toFixed(2)} ₺</span>
              </div>
            </div>
          </div>

          <div className="db-grid-3">
            <div className="db-card db-two-thirds">
              <div className="db-chart-title">Son 7 Günlük Ciro (Sipariş + Satış)</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={summary.dailySales ?? []}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {chartProps.cartesianGrid}
                  {chartProps.xAxis}
                  {chartProps.yAxis}
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} fill="url(#grad1)" dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="db-card db-half">
              <div className="db-card-label">Ürünler</div>
              <div className="db-card-value">{summary.totalProducts ?? 0}</div>
              <div className="db-card-sub">Sistemdeki toplam ürün</div>
            </div>
            <div className="db-card db-wide">
              <div className="db-chart-title">Son 6 Aylık Ciro (Sipariş + Satış)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={summary.monthlySales ?? []}>
                  {chartProps.cartesianGrid}
                  {chartProps.xAxis}
                  {chartProps.yAxis}
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="db-page">
        <div className="db-header">
          <div className="db-title">Genel Bakış</div>
          <div className="db-subtitle">{today}</div>
        </div>

        {summary ? (
          <div className="db-grid-3">
            <div className="db-card c3">
              <div className="db-card-label">Toplam İşlem</div>
              <div className="db-card-value orange">{(summary.totalOrders ?? 0) + (summary.totalSalesCount ?? 0)}</div>
              <div className="db-card-breakdown">
                <span className="db-pill db-pill-order">Sipariş: {summary.totalOrders ?? 0}</span>
                <span className="db-pill db-pill-sale">Satış: {summary.totalSalesCount ?? 0}</span>
              </div>
            </div>
            <div className="db-card c2">
              <div className="db-card-label">Toplam Satış</div>
              <div className="db-card-value green">{(summary.saleRevenue ?? 0).toFixed(2)} ₺</div>
              <div className="db-card-sub">Manuel eklenen satışlar</div>
            </div>
            <div className="db-card c1">
              <div className="db-card-label">Toplam Ciro</div>
              <div className="db-card-value accent">{(summary.totalSales ?? 0).toFixed(2)} ₺</div>
              <div className="db-card-profit">↑ Kâr: {(summary.profit ?? 0).toFixed(2)} ₺</div>
            </div>

            <div className="db-card db-two-thirds">
              <div className="db-chart-title">Son 7 Günlük Ciro (Sipariş + Satış)</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={summary.dailySales ?? []}>
                  <defs>
                    <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {chartProps.cartesianGrid}
                  {chartProps.xAxis}
                  {chartProps.yAxis}
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} fill="url(#grad2)" dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="db-card db-half">
              <div className="db-alarm-title">
                <span style={{ color: '#ef4444' }}>⚠</span>
                Stok Alarmı
              </div>
              {summary.lowStock?.length === 0 ? (
                <div className="db-alarm-ok">✓ Tüm ürünlerin stoğu yeterli</div>
              ) : (
                summary.lowStock?.map((p: any) => (
                  <div key={p.id} className="db-alarm-item">
                    <span className="db-alarm-name">{p.name}</span>
                    <span className="db-alarm-badge">Stok: {p.stock}</span>
                  </div>
                ))
              )}
            </div>

            <div className="db-card db-half">
              <div className="db-card-label">En Çok Satanlar</div>
              {summary.top?.length === 0 ? (
                <div className="db-alarm-ok">Henüz satış yok</div>
              ) : (
                summary.top?.map((t: any) => (
                  <div key={t.product?.id} className="db-top-item">
                    <span className="db-top-name">{t.product?.name}</span>
                    <span className="db-top-sold">{t.sold} adet</span>
                  </div>
                ))
              )}
            </div>

            <div className="db-card db-wide">
              <div className="db-chart-title">Son 6 Aylık Ciro (Sipariş + Satış)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={summary.monthlySales ?? []}>
                  {chartProps.cartesianGrid}
                  {chartProps.xAxis}
                  {chartProps.yAxis}
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="db-card">
            <div className="db-alarm-ok">Veri yüklenemedi</div>
          </div>
        )}
      </div>
    </>
  );
}