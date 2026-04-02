import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend
} from 'recharts';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .rp { font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; }
  .rp-header { margin-bottom: 28px; }
  .rp-title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.6px; }
  .rp-subtitle { font-size: 14px; color: #94a3b8; margin-top: 4px; font-weight: 500; }

  /* FİLTRE */
  .rp-filter { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px 24px; margin-bottom: 24px; display: flex; gap: 14px; align-items: flex-end; flex-wrap: wrap; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .rp-filter-field { display: flex; flex-direction: column; gap: 6px; }
  .rp-filter-label { font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #94a3b8; }
  .rp-filter-input { padding: 9px 14px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; color: #1e293b; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; transition: all 0.15s; font-weight: 500; }
  .rp-filter-input:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
  .rp-filter-select { padding: 9px 14px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; color: #1e293b; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; font-weight: 500; }
  .rp-btn { padding: 10px 20px; background: #6366f1; border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.15s; box-shadow: 0 2px 8px rgba(99,102,241,0.25); }
  .rp-btn:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); }
  .rp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .rp-btn-export { padding: 10px 20px; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px; color: #059669; font-size: 14px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
  .rp-btn-export:hover { background: #ecfdf5; border-color: #a7f3d0; }

  /* STAT KARTLARI */
  .rp-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
  .rp-stat { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); position: relative; overflow: hidden; transition: box-shadow 0.2s, transform 0.2s; }
  .rp-stat:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08); transform: translateY(-1px); }
  .rp-stat::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 16px 16px 0 0; }
  .rp-stat.c1::after { background: linear-gradient(90deg, #6366f1, #818cf8); }
  .rp-stat.c2::after { background: linear-gradient(90deg, #10b981, #34d399); }
  .rp-stat.c3::after { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
  .rp-stat.c4::after { background: linear-gradient(90deg, #ec4899, #f472b6); }
  .rp-stat-label { font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #94a3b8; margin-bottom: 10px; }
  .rp-stat-val { font-size: 26px; font-weight: 800; letter-spacing: -0.8px; color: #0f172a; }
  .rp-stat-val.v1 { color: #6366f1; }
  .rp-stat-val.v2 { color: #059669; }
  .rp-stat-val.v3 { color: #d97706; }
  .rp-stat-val.v4 { color: #db2777; }
  .rp-stat-sub { font-size: 12px; color: #94a3b8; margin-top: 5px; font-weight: 500; }

  /* KARTLAR */
  .rp-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 16px; }
  .rp-card-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 20px; }
  .rp-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }

  /* TABLO */
  .rp-table { width: 100%; border-collapse: collapse; }
  .rp-th { padding: 11px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid #f1f5f9; background: #fafafa; }
  .rp-td { padding: 13px 16px; font-size: 13px; color: #475569; border-bottom: 1px solid #f8fafc; font-weight: 500; }
  .rp-tr:last-child .rp-td { border-bottom: none; }
  .rp-tr:hover .rp-td { background: #f8fafc; }
  .rp-badge-sale { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; background: #eef2ff; color: #6366f1; }
  .rp-badge-order { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; background: #ecfdf5; color: #059669; }
  .rp-empty { padding: 40px; text-align: center; color: #cbd5e1; font-size: 14px; font-weight: 500; }
  .rp-loading { display: flex; align-items: center; justify-content: center; height: 200px; color: #94a3b8; font-size: 14px; font-weight: 500; }
  .rp-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }

  /* TOOLTIP */
  .rp-tooltip { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); font-family: 'Plus Jakarta Sans', sans-serif; }
  .rp-tooltip-label { color: #94a3b8; font-size: 11px; margin-bottom: 6px; font-weight: 600; }
  .rp-tooltip-row { font-size: 13px; font-weight: 600; margin-bottom: 2px; }

  /* HIZLI ARALIKLAR */
  .rp-quick { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 0; }
  .rp-quick-btn { padding: 6px 14px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 12px; font-weight: 700; color: #64748b; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s; }
  .rp-quick-btn:hover, .rp-quick-btn.active { background: #eef2ff; border-color: #c7d2fe; color: #6366f1; }
`;

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rp-tooltip">
      <div className="rp-tooltip-label">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="rp-tooltip-row" style={{ color: p.color }}>
          {p.name}: {p.value?.toFixed(2)} ₺
        </div>
      ))}
    </div>
  );
};

const toInputDate = (d: Date) => d.toISOString().slice(0, 10);

export default function ReportsPage() {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState(toInputDate(thirtyDaysAgo));
  const [endDate, setEndDate] = useState(toInputDate(today));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get(`/reports/summary?startDate=${startDate}&endDate=${endDate}`);
      setData(res.data);
    } catch {
      setError('Rapor yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const setQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(toInputDate(start));
    setEndDate(toInputDate(end));
  };

  const handleExport = async () => {
    setExportLoading(true);
    setError('');
    try {
      const res = await api.get(`/reports/export?startDate=${startDate}&endDate=${endDate}&type=all`, {
        responseType: 'blob',
      });
      const blob = res.data instanceof Blob
        ? res.data
        : new Blob([res.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
      const contentDisposition = res.headers['content-disposition'];
      const fileNameMatch = typeof contentDisposition === 'string'
        ? contentDisposition.match(/filename="([^"]+)"/i)
        : null;
      const fileName = fileNameMatch?.[1] || `corepanel_rapor_${startDate}_${endDate}.xlsx`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Export başarısız.');
    } finally {
      setExportLoading(false);
    }
  };

  const allRows = [
    ...(data?.salesList || []).map((s: any) => ({
      type: 'sale', date: s.date, name: s.product?.name || s.description || '—',
      customer: '—', qty: s.quantity, price: s.unitPrice, total: s.total,
      profit: (s.total || 0) - (s.unitCost || 0) * (s.quantity || 1),
    })),
    ...(data?.ordersList || []).map((o: any) => ({
      type: 'order', date: o.createdAt, name: o.product?.name || '—',
      customer: o.customer?.name || '—', qty: o.quantity,
      price: o.product?.price || 0, total: o.quantity * (o.product?.price || 0),
      profit: o.quantity * (o.product?.price || 0) * 0.4,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <style>{styles}</style>
      <div className="rp">
        <div className="rp-header">
          <div className="rp-title">Raporlar</div>
          <div className="rp-subtitle">Satış ve sipariş analizleri</div>
        </div>

        {error && <div className="rp-error">{error}</div>}

        {/* FİLTRE */}
        <div className="rp-filter">
          <div className="rp-filter-field">
            <span className="rp-filter-label">Başlangıç</span>
            <input type="date" className="rp-filter-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="rp-filter-field">
            <span className="rp-filter-label">Bitiş</span>
            <input type="date" className="rp-filter-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="rp-filter-field">
            <span className="rp-filter-label">Hızlı Aralık</span>
            <div className="rp-quick">
              {[7, 30, 90].map(d => (
                <button key={d} className="rp-quick-btn" onClick={() => setQuickRange(d)}>Son {d} Gün</button>
              ))}
            </div>
          </div>
          <button className="rp-btn" onClick={fetchReport} disabled={loading}>
            {loading ? 'Yükleniyor...' : '🔍 Rapor Getir'}
          </button>
          <button className="rp-btn-export" onClick={handleExport} disabled={exportLoading}>
            {exportLoading ? 'İndiriliyor...' : '📥 Excel İndir'}
          </button>
        </div>

        {loading && <div className="rp-loading">Rapor hazırlanıyor...</div>}

        {!loading && data && (
          <>
            {/* STAT KARTLARI */}
            <div className="rp-stats">
              <div className="rp-stat c1">
                <div className="rp-stat-label">Toplam Ciro</div>
                <div className="rp-stat-val v1">{(data.total?.revenue || 0).toFixed(2)} ₺</div>
                <div className="rp-stat-sub">{(data.sales?.count || 0) + (data.orders?.count || 0)} işlem</div>
              </div>
              <div className="rp-stat c2">
                <div className="rp-stat-label">Net Kâr</div>
                <div className="rp-stat-val v2">{(data.total?.profit || 0).toFixed(2)} ₺</div>
                <div className="rp-stat-sub">
                  {data.total?.revenue > 0 ? `%${((data.total.profit / data.total.revenue) * 100).toFixed(1)} marj` : '—'}
                </div>
              </div>
              <div className="rp-stat c3">
                <div className="rp-stat-label">Manuel Satış</div>
                <div className="rp-stat-val v3">{(data.sales?.revenue || 0).toFixed(2)} ₺</div>
                <div className="rp-stat-sub">{data.sales?.count || 0} kayıt</div>
              </div>
              <div className="rp-stat c4">
                <div className="rp-stat-label">Sipariş Geliri</div>
                <div className="rp-stat-val v4">{(data.orders?.revenue || 0).toFixed(2)} ₺</div>
                <div className="rp-stat-sub">{data.orders?.count || 0} sipariş</div>
              </div>
            </div>

            {/* GRAFİKLER */}
            <div className="rp-grid2">
              <div className="rp-card">
                <div className="rp-card-title">Günlük Ciro (Satış + Sipariş)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data.dailySeries || []}>
                    <defs>
                      <linearGradient id="rg1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="total" name="Toplam" stroke="#6366f1" strokeWidth={2.5} fill="url(#rg1)" dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="rp-card">
                <div className="rp-card-title">Satış vs Sipariş Karşılaştırması</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.dailySeries || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend />
                    <Bar dataKey="saleTotal" name="Satış" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="orderTotal" name="Sipariş" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* DETAY TABLO */}
            <div className="rp-card">
              <div className="rp-card-title">İşlem Detayları ({allRows.length} kayıt)</div>
              {allRows.length === 0 ? (
                <div className="rp-empty">Bu tarih aralığında işlem bulunamadı</div>
              ) : (
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th className="rp-th">Tür</th>
                      <th className="rp-th">Tarih</th>
                      <th className="rp-th">Ürün</th>
                      <th className="rp-th">Müşteri</th>
                      <th className="rp-th">Adet</th>
                      <th className="rp-th">Toplam</th>
                      <th className="rp-th">Kâr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRows.map((row, i) => (
                      <tr key={i} className="rp-tr">
                        <td className="rp-td">
                          {row.type === 'sale'
                            ? <span className="rp-badge-sale">Satış</span>
                            : <span className="rp-badge-order">Sipariş</span>
                          }
                        </td>
                        <td className="rp-td">{new Date(row.date).toLocaleDateString('tr-TR')}</td>
                        <td className="rp-td" style={{ color: '#0f172a', fontWeight: 600 }}>{row.name}</td>
                        <td className="rp-td">{row.customer}</td>
                        <td className="rp-td">{row.qty}</td>
                        <td className="rp-td" style={{ color: '#6366f1', fontWeight: 700 }}>{(row.total || 0).toFixed(2)} ₺</td>
                        <td className="rp-td" style={{ color: '#059669', fontWeight: 600 }}>+{(row.profit || 0).toFixed(2)} ₺</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
