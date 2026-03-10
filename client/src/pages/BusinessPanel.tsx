import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  .bp-root { font-family: 'DM Sans', sans-serif; color: #e2e8f0; }
  .bp-topbar { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
  .bp-welcome-sub { font-size: 13px; color: #64748b; font-weight: 400; margin-bottom: 4px; }
  .bp-welcome-title { font-size: 28px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.5px; }
  .bp-welcome-title span { color: #818cf8; }
  .bp-welcome-date { font-size: 12px; color: #475569; margin-top: 4px; font-family: 'DM Mono', monospace; }
  .bp-tabs { display: flex; gap: 6px; background: rgba(15,18,30,0.8); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 5px; }
  .bp-tab { padding: 7px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; background: transparent; color: #64748b; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
  .bp-tab.active { background: rgba(99,102,241,0.2); color: #a5b4fc; font-weight: 600; }
  .bp-quick { display: flex; gap: 10px; margin-bottom: 28px; flex-wrap: wrap; }
  .bp-quick-btn { display: flex; align-items: center; gap: 8px; padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
  .bp-quick-btn.primary { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc; }
  .bp-quick-btn.primary:hover { background: rgba(99,102,241,0.25); }
  .bp-quick-btn.success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); color: #34d399; }
  .bp-quick-btn.success:hover { background: rgba(16,185,129,0.2); }
  .bp-quick-btn.warning { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25); color: #fbbf24; }
  .bp-quick-btn.warning:hover { background: rgba(245,158,11,0.2); }
  .bp-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
  .bp-stat { background: #0f1220; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 20px 22px; position: relative; overflow: hidden; transition: border-color 0.2s; }
  .bp-stat:hover { border-color: rgba(99,102,241,0.2); }
  .bp-stat::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 16px 16px 0 0; }
  .bp-stat.s1::before { background: linear-gradient(90deg, #6366f1, #818cf8); }
  .bp-stat.s2::before { background: linear-gradient(90deg, #10b981, #34d399); }
  .bp-stat.s3::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
  .bp-stat.s4::before { background: linear-gradient(90deg, #ec4899, #f472b6); }
  .bp-stat-icon { font-size: 22px; margin-bottom: 12px; }
  .bp-stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: #475569; margin-bottom: 8px; }
  .bp-stat-val { font-size: 26px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.5px; font-family: 'DM Mono', monospace; }
  .bp-stat-val.c1 { color: #818cf8; }
  .bp-stat-val.c2 { color: #34d399; }
  .bp-stat-val.c3 { color: #fbbf24; }
  .bp-stat-val.c4 { color: #f472b6; }
  .bp-stat-delta { font-size: 11px; color: #475569; margin-top: 6px; }
  .bp-stat-delta.up { color: #34d399; }
  .bp-grid { display: grid; grid-template-columns: 1fr 320px; gap: 16px; margin-bottom: 16px; }
  .bp-card { background: #0f1220; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 22px 24px; }
  .bp-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .bp-card-title { font-size: 14px; font-weight: 600; color: #94a3b8; }
  .bp-card-badge { font-size: 11px; font-family: 'DM Mono', monospace; color: #64748b; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); padding: 3px 10px; border-radius: 20px; }
  .bp-card-link { font-size: 12px; color: #818cf8; font-weight: 500; cursor: pointer; }
  .bp-card-link:hover { color: #a5b4fc; }
  .bp-chart-total { font-size: 30px; font-weight: 700; color: #f1f5f9; font-family: 'DM Mono', monospace; letter-spacing: -1px; margin-bottom: 4px; }
  .bp-chart-sub { font-size: 12px; color: #475569; margin-bottom: 20px; }
  .bp-low-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .bp-low-item:last-child { border-bottom: none; }
  .bp-low-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .bp-low-dot.red { background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,0.5); }
  .bp-low-dot.orange { background: #f97316; box-shadow: 0 0 6px rgba(249,115,22,0.5); }
  .bp-low-name { font-size: 13px; font-weight: 500; color: #cbd5e1; flex: 1; }
  .bp-low-stock { font-size: 12px; font-family: 'DM Mono', monospace; color: #ef4444; font-weight: 500; }
  .bp-low-empty { font-size: 13px; color: #334155; padding: 16px 0; text-align: center; }
  .bp-top-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .bp-top-item:last-child { border-bottom: none; }
  .bp-top-rank { font-size: 11px; font-family: 'DM Mono', monospace; color: #334155; width: 20px; text-align: right; flex-shrink: 0; }
  .bp-top-bar-wrap { flex: 1; }
  .bp-top-name { font-size: 13px; font-weight: 500; color: #cbd5e1; margin-bottom: 5px; }
  .bp-top-bar-bg { height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; }
  .bp-top-bar { height: 4px; border-radius: 2px; background: linear-gradient(90deg, #6366f1, #818cf8); }
  .bp-top-qty { font-size: 12px; font-family: 'DM Mono', monospace; color: #818cf8; font-weight: 500; flex-shrink: 0; }
  .bp-sale-row { display: flex; align-items: center; justify-content: space-between; padding: 11px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .bp-sale-row:last-child { border-bottom: none; }
  .bp-sale-left { display: flex; align-items: center; gap: 10px; }
  .bp-sale-icon { width: 34px; height: 34px; border-radius: 10px; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.15); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
  .bp-sale-name { font-size: 13px; font-weight: 500; color: #cbd5e1; }
  .bp-sale-time { font-size: 11px; color: #475569; margin-top: 2px; font-family: 'DM Mono', monospace; }
  .bp-sale-amount { font-size: 14px; font-weight: 600; color: #a5b4fc; font-family: 'DM Mono', monospace; }
  .bp-sale-profit { font-size: 11px; color: #34d399; text-align: right; margin-top: 2px; }
  .bp-empty { font-size: 13px; color: #334155; padding: 24px 0; text-align: center; }
  .bp-tooltip { background: #0f1220; border: 1px solid rgba(99,102,241,0.3); border-radius: 10px; padding: 10px 14px; }
  .bp-tooltip-label { color: #64748b; font-size: 11px; margin-bottom: 4px; font-family: 'DM Mono', monospace; }
  .bp-tooltip-val { color: #a5b4fc; font-weight: 500; font-size: 14px; font-family: 'DM Mono', monospace; }
  .bp-invite-label { font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: #475569; margin-bottom: 10px; }
  .bp-invite-form { display: flex; gap: 10px; }
  .bp-invite-input { flex: 1; padding: 11px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #e2e8f0; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: all 0.2s; }
  .bp-invite-input:focus { border-color: rgba(99,102,241,0.4); background: rgba(99,102,241,0.06); }
  .bp-invite-input::placeholder { color: #334155; }
  .bp-invite-btn { padding: 11px 20px; background: linear-gradient(135deg, #6366f1, #7c3aed); border: none; border-radius: 10px; color: #fff; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; white-space: nowrap; }
  .bp-invite-btn:disabled { opacity: 0.5; }
  .bp-msg-ok { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); color: #34d399; padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 14px; }
  .bp-msg-err { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #f87171; padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 14px; }
  .bp-staff-card { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; margin-bottom: 8px; }
  .bp-staff-av { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,#6366f1,#818cf8); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; }
  .bp-staff-email { font-size: 13px; font-weight: 500; color: #cbd5e1; }
  .bp-staff-meta { font-size: 11px; color: #475569; margin-top: 2px; }
  .bp-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .bp-badge-staff { background: rgba(99,102,241,0.1); color: #818cf8; border: 1px solid rgba(99,102,241,0.2); }
  .bp-badge-pending { background: rgba(245,158,11,0.1); color: #fbbf24; border: 1px solid rgba(245,158,11,0.2); }
  .bp-section-sep { font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: #334155; margin: 20px 0 10px; }
`;

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bp-tooltip">
      <div className="bp-tooltip-label">{label}</div>
      <div className="bp-tooltip-val">{payload[0].value?.toFixed(2)} ₺</div>
    </div>
  );
};

export default function BusinessPanel() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'panel' | 'staff'>('panel');
  const [me, setMe] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [inviteList, setInviteList] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteError, setInviteError] = useState('');

  const fetchPanel = async () => {
    try {
      const [meRes, salesRes, summaryRes, prodRes] = await Promise.all([
        api.get('/businesses/me'),
        api.get('/sales/me'),
        api.get('/dashboard/summary'),
        api.get('/products'),
      ]);
      setMe(meRes.data);
      setSales(salesRes.data || []);
      setSummary(summaryRes.data);
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

  useEffect(() => { fetchPanel(); }, []);
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
    } finally { setInviteLoading(false); }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const totalRevenue = sales.reduce((a, b) => a + (b.total || 0), 0);
  const totalCost = sales.reduce((a, b) => a + (b.unitCost || 0) * (b.quantity || 0), 0);
  const totalProfit = totalRevenue - totalCost;
  const todaySales = sales.filter(s => new Date(s.date).toDateString() === now.toDateString());
  const todayRevenue = todaySales.reduce((a, b) => a + (b.total || 0), 0);
  const chartData = (summary?.dailySales || []).map((s: any) => ({ date: s.date, total: s.total }));
  const chart7Total = chartData.reduce((a: number, b: any) => a + b.total, 0);
  const productCounts: Record<string, number> = {};
  sales.forEach(s => {
    if (s.productId) productCounts[s.productId] = (productCounts[s.productId] || 0) + (s.quantity || 0);
  });
  const topProducts = Object.keys(productCounts)
    .map(id => ({ id, qty: productCounts[id], name: productsMap[id] || id }))
    .sort((a, b) => b.qty - a.qty).slice(0, 5);
  const maxQty = topProducts[0]?.qty || 1;
  const recentSales = [...sales].reverse().slice(0, 6);
  const lowStock = summary?.lowStock || [];

  if (loading) return (
    <>
      <style>{styles}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#334155', fontSize: 14 }}>Yükleniyor...</div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="bp-root">
        <div className="bp-topbar">
          <div>
            <div className="bp-welcome-sub">Hoşgeldiniz,</div>
            <div className="bp-welcome-title">{me?.name || 'İşletme'} <span>Paneli</span></div>
            <div className="bp-welcome-date">{dateStr}</div>
          </div>
          {user?.role === 'ADMIN' && (
            <div className="bp-tabs">
              <button className={`bp-tab${activeTab === 'panel' ? ' active' : ''}`} onClick={() => setActiveTab('panel')}>Panel</button>
              <button className={`bp-tab${activeTab === 'staff' ? ' active' : ''}`} onClick={() => setActiveTab('staff')}>Personel</button>
            </div>
          )}
        </div>

        {activeTab === 'panel' && (
          <>
            <div className="bp-quick">
              <button className="bp-quick-btn primary" onClick={() => navigate('/sales')}>＋ Yeni Satış</button>
              <button className="bp-quick-btn success" onClick={() => navigate('/orders')}>＋ Yeni Sipariş</button>
              <button className="bp-quick-btn warning" onClick={() => navigate('/customers')}>＋ Yeni Müşteri</button>
            </div>

            <div className="bp-stats">
              <div className="bp-stat s1">
                <div className="bp-stat-icon">💰</div>
                <div className="bp-stat-label">Bugünkü Satış</div>
                <div className="bp-stat-val c1">{todayRevenue.toFixed(2)} ₺</div>
                <div className="bp-stat-delta">{todaySales.length} işlem</div>
              </div>
              <div className="bp-stat s2">
                <div className="bp-stat-icon">📈</div>
                <div className="bp-stat-label">Toplam Ciro</div>
                <div className="bp-stat-val c2">{totalRevenue.toFixed(2)} ₺</div>
                <div className="bp-stat-delta">{sales.length} toplam satış</div>
              </div>
              <div className="bp-stat s3">
                <div className="bp-stat-icon">✨</div>
                <div className="bp-stat-label">Net Kâr</div>
                <div className="bp-stat-val c3">{totalProfit.toFixed(2)} ₺</div>
                <div className={`bp-stat-delta${totalProfit > 0 ? ' up' : ''}`}>
                  {totalRevenue > 0 ? `%${((totalProfit / totalRevenue) * 100).toFixed(1)} marj` : '—'}
                </div>
              </div>
              <div className="bp-stat s4">
                <div className="bp-stat-icon">⚠️</div>
                <div className="bp-stat-label">Düşük Stok</div>
                <div className="bp-stat-val c4">{lowStock.length}</div>
                <div className="bp-stat-delta">kritik seviyede ürün</div>
              </div>
            </div>

            <div className="bp-grid">
              <div className="bp-card">
                <div className="bp-card-header">
                  <div className="bp-card-title">Son 7 Günlük Satış</div>
                  <div className="bp-card-badge">7G</div>
                </div>
                <div className="bp-chart-total">{chart7Total.toFixed(2)} ₺</div>
                <div className="bp-chart-sub">Son 7 günde toplam ciro</div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fill="url(#areaGrad)" dot={{ fill: '#6366f1', r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="bp-card">
                  <div className="bp-card-header">
                    <div className="bp-card-title">⚠️ Düşük Stok</div>
                    <span className="bp-card-link" onClick={() => navigate('/products')}>Tümü →</span>
                  </div>
                  {lowStock.length === 0
                    ? <div className="bp-low-empty">Stok durumu normal ✓</div>
                    : lowStock.slice(0, 5).map((p: any) => (
                      <div key={p.id} className="bp-low-item">
                        <div className={`bp-low-dot ${p.stock <= 2 ? 'red' : 'orange'}`} />
                        <div className="bp-low-name">{p.name}</div>
                        <div className="bp-low-stock">{p.stock} adet</div>
                      </div>
                    ))
                  }
                </div>

                <div className="bp-card">
                  <div className="bp-card-header">
                    <div className="bp-card-title">🏆 En Çok Satan</div>
                  </div>
                  {topProducts.length === 0
                    ? <div className="bp-empty">Henüz satış yok</div>
                    : topProducts.map((tp, i) => (
                      <div key={tp.id} className="bp-top-item">
                        <div className="bp-top-rank">#{i + 1}</div>
                        <div className="bp-top-bar-wrap">
                          <div className="bp-top-name">{tp.name}</div>
                          <div className="bp-top-bar-bg">
                            <div className="bp-top-bar" style={{ width: `${(tp.qty / maxQty) * 100}%` }} />
                          </div>
                        </div>
                        <div className="bp-top-qty">{tp.qty}</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            <div className="bp-card">
              <div className="bp-card-header">
                <div className="bp-card-title">Son Satışlar</div>
                <span className="bp-card-link" onClick={() => navigate('/sales')}>Tümünü Gör →</span>
              </div>
              {recentSales.length === 0
                ? <div className="bp-empty">Henüz satış kaydı yok</div>
                : recentSales.map(s => {
                  const profit = (s.total || 0) - (s.unitCost || 0) * (s.quantity || 0);
                  return (
                    <div key={s.id} className="bp-sale-row">
                      <div className="bp-sale-left">
                        <div className="bp-sale-icon">🛒</div>
                        <div>
                          <div className="bp-sale-name">{s.description || productsMap[s.productId] || 'Satış'}</div>
                          <div className="bp-sale-time">
                            {s.quantity} × {s.unitPrice} ₺ &nbsp;·&nbsp;
                            {new Date(s.date).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="bp-sale-amount">{(s.total || 0).toFixed(2)} ₺</div>
                        <div className="bp-sale-profit">+{profit.toFixed(2)} ₺</div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </>
        )}

        {activeTab === 'staff' && (
          <div>
            <div className="bp-card" style={{ marginBottom: 16 }}>
              <div className="bp-card-header">
                <div className="bp-card-title">Personel Davet Et</div>
              </div>
              {inviteMsg && <div className="bp-msg-ok">✓ {inviteMsg}</div>}
              {inviteError && <div className="bp-msg-err">{inviteError}</div>}
              <div className="bp-invite-label">E-posta adresi</div>
              <div className="bp-invite-form">
                <input className="bp-invite-input" type="email" placeholder="personel@isletme.com"
                  value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleInvite()} />
                <button className="bp-invite-btn" onClick={handleInvite} disabled={inviteLoading}>
                  {inviteLoading ? 'Gönderiliyor...' : 'Davet Gönder'}
                </button>
              </div>
            </div>

            <div className="bp-section-sep">Mevcut Personel</div>
            {staffList.filter(u => u.role === 'STAFF').length === 0
              ? <div className="bp-empty">Henüz personel yok</div>
              : staffList.filter(u => u.role === 'STAFF').map(u => (
                <div key={u.id} className="bp-staff-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="bp-staff-av">{u.email[0].toUpperCase()}</div>
                    <div>
                      <div className="bp-staff-email">{u.email}</div>
                      <div className="bp-staff-meta">{new Date(u.createdAt).toLocaleDateString('tr-TR')} tarihinde katıldı</div>
                    </div>
                  </div>
                  <span className="bp-badge bp-badge-staff">Personel</span>
                </div>
              ))
            }

            <div className="bp-section-sep" style={{ marginTop: 24 }}>Bekleyen Davetler</div>
            {inviteList.filter(i => !i.used).length === 0
              ? <div className="bp-empty">Bekleyen davet yok</div>
              : inviteList.filter(i => !i.used).map(inv => (
                <div key={inv.id} className="bp-staff-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="bp-staff-av" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>{inv.email[0].toUpperCase()}</div>
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
        )}
      </div>
    </>
  );
}