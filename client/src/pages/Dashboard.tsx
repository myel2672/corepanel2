import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
  .db-page { font-family: 'Nunito', sans-serif; color: rgba(255,255,255,0.85); }
  .db-header { margin-bottom: 28px; }
  .db-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
  .db-subtitle { font-size: 14px; color: rgba(255,255,255,0.3); margin-top: 4px; }
  .db-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
  .db-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
  .db-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; transition: border-color 0.2s; }
  .db-card:hover { border-color: rgba(99,102,241,0.3); }
  .db-card-label { font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 12px; }
  .db-card-value { font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -1px; }
  .db-card-value.accent { background: linear-gradient(135deg, #6366f1, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .db-card-value.green { color: #34d399; }
  .db-card-sub { font-size: 13px; color: rgba(255,255,255,0.3); margin-top: 6px; }
  .db-card-profit { font-size: 15px; font-weight: 700; color: #34d399; margin-top: 8px; }
  .db-wide { grid-column: 1 / -1; }
  .db-two-thirds { grid-column: span 2; }
  .db-half { grid-column: span 1; }
  .db-alarm-title { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.6); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .db-alarm-ok { font-size: 14px; color: rgba(255,255,255,0.25); }
  .db-alarm-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .db-alarm-item:last-child { border-bottom: none; }
  .db-alarm-name { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7); }
  .db-alarm-badge { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.25); color: #f87171; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
  .db-top-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .db-top-item:last-child { border-bottom: none; }
  .db-top-name { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7); }
  .db-top-sold { font-size: 13px; font-weight: 700; color: #a78bfa; }
  .db-loading { display: flex; align-items: center; justify-content: center; height: 200px; color: rgba(255,255,255,0.3); font-size: 14px; }
  .db-chart-title { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontFamily: 'Nunito, sans-serif' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>{label}</div>
        <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 15 }}>{payload[0].value.toFixed(2)} ₺</div>
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
            <div className="db-card">
              <div className="db-card-label">İşletmeler</div>
              <div className="db-card-value accent">{summary.totalBusinesses ?? 0}</div>
              <div className="db-card-sub">Kayıtlı işletme</div>
            </div>
            <div className="db-card">
              <div className="db-card-label">Müşteriler</div>
              <div className="db-card-value">{summary.totalCustomers ?? 0}</div>
              <div className="db-card-sub">Toplam kayıt</div>
            </div>
            <div className="db-card">
              <div className="db-card-label">Siparişler</div>
              <div className="db-card-value">{summary.totalOrders ?? 0}</div>
              <div className="db-card-sub">Tüm zamanlar</div>
            </div>
            <div className="db-card">
              <div className="db-card-label">Toplam Ciro</div>
              <div className="db-card-value green">{(summary.totalSales ?? 0).toFixed(2)} ₺</div>
              <div className="db-card-sub">Kâr: {(summary.profit ?? 0).toFixed(2)} ₺</div>
            </div>
          </div>

          <div className="db-grid-3">
            <div className="db-card db-two-thirds">
              <div className="db-chart-title">Son 7 Günlük Satış</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={summary.dailySales ?? []}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="db-card db-half">
              <div className="db-card-label">Ürünler</div>
              <div className="db-card-value">{summary.totalProducts ?? 0}</div>
              <div className="db-card-sub">Sistemdeki toplam ürün</div>
            </div>
            <div className="db-card db-wide">
              <div className="db-chart-title">Son 6 Aylık Satış</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={summary.monthlySales ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
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
            <div className="db-card">
              <div className="db-card-label">Toplam Sipariş</div>
              <div className="db-card-value">{summary.totalOrders ?? 0}</div>
              <div className="db-card-sub">Tüm zamanlar</div>
            </div>
            <div className="db-card">
              <div className="db-card-label">Toplam Satış</div>
              <div className="db-card-value accent">{(summary.totalSales ?? 0).toFixed(2)} ₺</div>
              <div className="db-card-sub">Maliyet: {(summary.totalCost ?? 0).toFixed(2)} ₺</div>
              <div className="db-card-profit">↑ Kâr: {(summary.profit ?? 0).toFixed(2)} ₺</div>
            </div>
            <div className="db-card">
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
            <div className="db-card db-two-thirds">
              <div className="db-chart-title">Son 7 Günlük Satış</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={summary.dailySales ?? []}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="db-card db-half">
              <div className="db-alarm-title">
                <span style={{ color: '#f87171' }}>⚠</span>
                Stok Alarmı
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>(stok &lt; 5)</span>
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
            <div className="db-card db-wide">
              <div className="db-chart-title">Son 6 Aylık Satış</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={summary.monthlySales ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
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