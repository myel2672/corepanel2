import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
  .bp { font-family: 'Nunito', sans-serif; color: rgba(255,255,255,0.85); }
  .bp-header { margin-bottom: 28px; display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .bp-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
  .bp-biz-name { font-size: 14px; color: rgba(255,255,255,0.3); margin-top: 4px; }
  .bp-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
  .bp-tab { padding: 8px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; font-family: 'Nunito', sans-serif; cursor: pointer; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.4); transition: all 0.15s; }
  .bp-tab.active { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3); color: #a78bfa; }
  .bp-controls {
    display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 10px 16px;
  }
  .bp-ctrl-label { font-size: 12px; color: rgba(255,255,255,0.3); font-weight: 600; }
  .bp-select, .bp-num-input {
    padding: 7px 12px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: rgba(255,255,255,0.85);
    font-size: 13px;
    font-family: 'Nunito', sans-serif;
    outline: none;
  }
  .bp-num-input { width: 70px; }
  .bp-select option { background: #1a1a2e; }
  .bp-apply-btn {
    padding: 7px 16px;
    background: rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.25);
    border-radius: 8px;
    color: #a78bfa;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Nunito', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
  }
  .bp-apply-btn:hover { background: rgba(99,102,241,0.25); }
  .bp-csv-btn {
    padding: 7px 16px;
    background: rgba(52,211,153,0.1);
    border: 1px solid rgba(52,211,153,0.2);
    border-radius: 8px;
    color: #34d399;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Nunito', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
  }
  .bp-csv-btn:hover { background: rgba(52,211,153,0.2); }
  .bp-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
  .bp-stat { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 18px 20px; }
  .bp-stat-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 10px; }
  .bp-stat-value { font-size: 24px; font-weight: 800; color: #fff; }
  .bp-stat-value.purple { background: linear-gradient(135deg,#6366f1,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .bp-stat-value.green { color: #34d399; }
  .bp-stat-value.orange { color: #fb923c; }
  .bp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .bp-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px 24px; }
  .bp-card-title { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.4); margin-bottom: 16px; letter-spacing: 0.5px; }
  .bp-full { grid-column: 1 / -1; }
  .bp-sale-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .bp-sale-item:last-child { border-bottom: none; }
  .bp-sale-name { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.8); }
  .bp-sale-detail { font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 3px; }
  .bp-sale-total { font-size: 15px; font-weight: 800; color: #a78bfa; }
  .bp-sale-profit { font-size: 12px; color: #34d399; text-align: right; margin-top: 2px; }
  .bp-empty { color: rgba(255,255,255,0.2); font-size: 14px; padding: 20px 0; }
  .bp-top-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
  .bp-top-item:last-child { border-bottom: none; }
  .bp-loading { display: flex; align-items: center; justify-content: center; height: 200px; color: rgba(255,255,255,0.3); font-size: 14px; }
  .bp-staff-section { margin-bottom: 28px; }
  .bp-invite-form { display: flex; gap: 10px; margin-bottom: 8px; }
  .bp-invite-input { flex: 1; padding: 11px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: rgba(255,255,255,0.85); font-size: 14px; font-family: 'Nunito', sans-serif; outline: none; transition: all 0.15s; }
  .bp-invite-input:focus { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.08); }
  .bp-invite-input::placeholder { color: rgba(255,255,255,0.2); }
  .bp-invite-btn { padding: 11px 20px; background: linear-gradient(135deg, #6366f1, #7c3aed); border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 700; font-family: 'Nunito', sans-serif; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
  .bp-invite-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .bp-msg-success { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); color: #34d399; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .bp-msg-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
  .bp-staff-list { display: grid; gap: 10px; }
  .bp-staff-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; }
  .bp-staff-avatar { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #a78bfa); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: #fff; flex-shrink: 0; }
  .bp-staff-email { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.8); }
  .bp-staff-meta { font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 3px; }
  .bp-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .bp-badge-staff { background: rgba(99,102,241,0.12); color: #a78bfa; border: 1px solid rgba(99,102,241,0.2); }
  .bp-badge-pending { background: rgba(251,146,60,0.12); color: #fb923c; border: 1px solid rgba(251,146,60,0.2); }
  .bp-section-label { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 12px; margin-top: 24px; }
`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#1a1a2e', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{label}</div>
        <div style={{ color: '#a78bfa', fontWeight: 700 }}>{payload[0].value?.toFixed(2)} ₺</div>
      </div>
    );
  }
  return null;
};

export default function BusinessPanel() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<'panel' | 'staff'>('panel');
  const [me, setMe] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, string>>({});
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');
  const [range, setRange] = useState<number>(30);
  const [loading, setLoading] = useState(true);

  // Staff
  const [staffList, setStaffList] = useState<any[]>([]);
  const [inviteList, setInviteList] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteError, setInviteError] = useState('');

  const fetchAll = async () => {
    try {
      const [meRes, salesRes, repRes, prodRes] = await Promise.all([
        api.get('/businesses/me'),
        api.get('/sales/me'),
        api.get(`/reports/sales/summary?period=${period}&range=${range}`),
        api.get('/products'),
      ]);
      setMe(meRes.data);
      setSales(salesRes.data || []);
      setSeries(repRes.data.series || []);
      const map: Record<string, string> = {};
      (prodRes.data || []).forEach((x: any) => { map[x.id] = x.name; });
      setProductsMap(map);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchStaff = async () => {
    try {
      const [usersRes, invitesRes] = await Promise.all([
        api.get('/businesses/me/users'),
        api.get('/invites/list'),
      ]);
      setStaffList(usersRes.data || []);
      setInviteList(invitesRes.data || []);
    } catch { }
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { if (activeTab === 'staff') fetchStaff(); }, [activeTab]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviteLoading(true); setInviteMsg(''); setInviteError('');
    try {
      await api.post('/invites/send', { email: inviteEmail });
      setInviteMsg('Davet gönderildi!');
      setInviteEmail('');
      fetchStaff();
    } catch (err: any) {
      setInviteError(err?.response?.data?.message || 'Davet gönderilemedi.');
    } finally {
      setInviteLoading(false);
    }
  };

  const downloadCSV = async () => {
    try {
      const r = await api.get(`/reports/sales/export?period=${period}&range=${range}`, { responseType: 'blob' as any });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `satis_raporu_${period}_${range}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch { }
  };

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="bp-loading">Yükleniyor...</div>
    </>
  );

  const today = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
  const totalToday = todaySales.reduce((a, b) => a + (b.total || 0), 0);
  const totalRevenue = sales.reduce((a, b) => a + (b.total || 0), 0);
  const totalCost = sales.reduce((a, b) => a + (b.unitCost || 0) * (b.quantity || 0), 0);
  const totalProfit = totalRevenue - totalCost;
  const todayCount = todaySales.reduce((a, b) => a + (b.quantity || 0), 0);

  const productCounts: Record<string, number> = {};
  sales.forEach(s => {
    if (s.productId) productCounts[s.productId] = (productCounts[s.productId] || 0) + (s.quantity || 0);
  });
  const topProducts = Object.keys(productCounts)
    .map(id => ({ id, qty: productCounts[id], name: productsMap[id] || id }))
    .sort((a, b) => b.qty - a.qty).slice(0, 5);

  const chartData = series.map((s: any) => ({ date: s.label, total: s.total }));

  return (
    <>
      <style>{styles}</style>
      <div className="bp">
        <div className="bp-header">
          <div>
            <div className="bp-title">İşletme Paneli</div>
            {me && <div className="bp-biz-name">{me.name} · {me.sector}</div>}
          </div>
          {activeTab === 'panel' && (
            <div className="bp-controls">
              <span className="bp-ctrl-label">Periyot:</span>
              <select className="bp-select" value={period} onChange={e => setPeriod(e.target.value as any)}>
                <option value="daily">Günlük</option>
                <option value="monthly">Aylık</option>
              </select>
              <span className="bp-ctrl-label">Aralık:</span>
              <input className="bp-num-input" type="number" value={range} onChange={e => setRange(Number(e.target.value) || 1)} />
              <button className="bp-apply-btn" onClick={fetchAll}>Uygula</button>
              <button className="bp-csv-btn" onClick={downloadCSV}>CSV İndir</button>
            </div>
          )}
        </div>

        {user?.role === 'ADMIN' && (
          <div className="bp-tabs">
            <button className={`bp-tab${activeTab === 'panel' ? ' active' : ''}`} onClick={() => setActiveTab('panel')}>📊 Panel</button>
            <button className={`bp-tab${activeTab === 'staff' ? ' active' : ''}`} onClick={() => setActiveTab('staff')}>👥 Personel</button>
          </div>
        )}

        {activeTab === 'panel' && (
          <>
            <div className="bp-stats">
              <div className="bp-stat"><div className="bp-stat-label">Bugünkü Satış</div><div className="bp-stat-value purple">{totalToday.toFixed(2)} ₺</div></div>
              <div className="bp-stat"><div className="bp-stat-label">Toplam Ciro</div><div className="bp-stat-value">{totalRevenue.toFixed(2)} ₺</div></div>
              <div className="bp-stat"><div className="bp-stat-label">Toplam Kâr</div><div className="bp-stat-value green">{totalProfit.toFixed(2)} ₺</div></div>
              <div className="bp-stat"><div className="bp-stat-label">Bugünkü İşlem</div><div className="bp-stat-value orange">{todayCount}</div></div>
            </div>

            <div className="bp-grid">
              <div className="bp-card">
                <div className="bp-card-title">Satış Grafiği</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bp-card">
                <div className="bp-card-title">En Çok Satılan Ürünler</div>
                {topProducts.length === 0
                  ? <div className="bp-empty">Henüz satış yok</div>
                  : topProducts.map((tp, i) => (
                    <div key={tp.id} className="bp-top-item">
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                        <span style={{ color: 'rgba(255,255,255,0.2)', marginRight: 8 }}>#{i + 1}</span>
                        {tp.name}
                      </span>
                      <span style={{ color: '#a78bfa', fontWeight: 700 }}>{tp.qty} adet</span>
                    </div>
                  ))
                }
              </div>

              <div className="bp-card bp-full">
                <div className="bp-card-title">Son Satışlar</div>
                {sales.length === 0
                  ? <div className="bp-empty">Henüz satış kaydı yok</div>
                  : sales.slice().reverse().slice(0, 10).map(s => {
                    const profit = (s.total || 0) - (s.unitCost || 0) * (s.quantity || 0);
                    return (
                      <div key={s.id} className="bp-sale-item">
                        <div>
                          <div className="bp-sale-name">{s.description || productsMap[s.productId] || 'Satış'}</div>
                          <div className="bp-sale-detail">
                            {s.quantity} adet × {s.unitPrice} ₺ · {new Date(s.date).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div>
                          <div className="bp-sale-total">{(s.total || 0).toFixed(2)} ₺</div>
                          <div className="bp-sale-profit">+{profit.toFixed(2)} ₺ kâr</div>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </>
        )}

        {activeTab === 'staff' && (
          <div className="bp-staff-section">
            <div className="bp-card" style={{ marginBottom: 20 }}>
              <div className="bp-card-title">Personel Davet Et</div>
              {inviteMsg && <div className="bp-msg-success">✓ {inviteMsg}</div>}
              {inviteError && <div className="bp-msg-error">{inviteError}</div>}
              <div className="bp-invite-form">
                <input
                  className="bp-invite-input"
                  type="email"
                  placeholder="personel@isletme.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleInvite()}
                />
                <button className="bp-invite-btn" onClick={handleInvite} disabled={inviteLoading}>
                  {inviteLoading ? 'Gönderiliyor...' : 'Davet Gönder'}
                </button>
              </div>
            </div>

            <div className="bp-section-label">Mevcut Personel</div>
            <div className="bp-staff-list">
              {staffList.filter(u => u.role === 'STAFF').length === 0
                ? <div className="bp-empty">Henüz personel yok</div>
                : staffList.filter(u => u.role === 'STAFF').map(u => (
                  <div key={u.id} className="bp-staff-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="bp-staff-avatar">{u.email[0].toUpperCase()}</div>
                      <div>
                        <div className="bp-staff-email">{u.email}</div>
                        <div className="bp-staff-meta">{new Date(u.createdAt).toLocaleDateString('tr-TR')} tarihinde katıldı</div>
                      </div>
                    </div>
                    <span className="bp-badge bp-badge-staff">Personel</span>
                  </div>
                ))
              }
            </div>

            <div className="bp-section-label" style={{ marginTop: 28 }}>Bekleyen Davetler</div>
            <div className="bp-staff-list">
              {inviteList.filter(i => !i.used).length === 0
                ? <div className="bp-empty">Bekleyen davet yok</div>
                : inviteList.filter(i => !i.used).map(inv => (
                  <div key={inv.id} className="bp-staff-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="bp-staff-avatar" style={{ background: 'rgba(251,146,60,0.2)', color: '#fb923c' }}>{inv.email[0].toUpperCase()}</div>
                      <div>
                        <div className="bp-staff-email">{inv.email}</div>
                        <div className="bp-staff-meta">Son geçerlilik: {new Date(inv.expiresAt).toLocaleDateString('tr-TR')}</div>
                      </div>
                    </div>
                    <span className="bp-badge bp-badge-pending">Bekliyor</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </>
  );
}