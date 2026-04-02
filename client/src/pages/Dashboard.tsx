import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .db-page { font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; }
  .db-header { margin-bottom: 28px; }
  .db-title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.6px; }
  .db-subtitle { font-size: 14px; color: #94a3b8; margin-top: 4px; font-weight: 500; }
  .db-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 16px; }
  .db-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-bottom: 16px; }
  .db-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); transition: box-shadow 0.2s, transform 0.2s; position: relative; overflow: hidden; }
  .db-card:hover { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); transform: translateY(-1px); }
  .db-card::after { content: ''; position: absolute; inset: 0 0 auto 0; height: 3px; border-radius: 16px 16px 0 0; }
  .db-card.c1::after { background: linear-gradient(90deg, #6366f1, #818cf8); }
  .db-card.c2::after { background: linear-gradient(90deg, #10b981, #34d399); }
  .db-card.c3::after { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
  .db-card.c4::after { background: linear-gradient(90deg, #ec4899, #f472b6); }
  .db-card.c5::after { background: linear-gradient(90deg, #0ea5e9, #38bdf8); }
  .db-card.c6::after { background: linear-gradient(90deg, #f97316, #fb923c); }
  .db-card-label { font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #94a3b8; margin-bottom: 12px; }
  .db-card-value { font-size: 30px; font-weight: 800; color: #0f172a; letter-spacing: -1px; }
  .db-card-value.accent { color: #6366f1; }
  .db-card-value.green { color: #059669; }
  .db-card-value.orange { color: #d97706; }
  .db-card-value.pink { color: #db2777; }
  .db-card-value.sky { color: #0284c7; }
  .db-card-sub { font-size: 12px; color: #94a3b8; margin-top: 6px; font-weight: 500; line-height: 1.5; }
  .db-card-profit { font-size: 13px; font-weight: 700; color: #059669; margin-top: 6px; }
  .db-card-breakdown { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
  .db-pill { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
  .db-pill-order { background: #eef2ff; color: #6366f1; }
  .db-pill-sale { background: #ecfdf5; color: #059669; }
  .db-wide { grid-column: 1 / -1; }
  .db-two-thirds { grid-column: span 2; }
  .db-half { grid-column: span 1; }
  .db-chart-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 20px; }
  .db-loading { display: flex; align-items: center; justify-content: center; height: 200px; color: #94a3b8; font-size: 14px; font-weight: 500; }
  .db-empty { color: #94a3b8; font-size: 13px; font-weight: 500; }
  .db-list { display: grid; gap: 12px; }
  .db-list-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 0; border-bottom: 1px solid #f1f5f9; }
  .db-list-item:last-child { border-bottom: none; padding-bottom: 0; }
  .db-list-item:first-child { padding-top: 0; }
  .db-item-title { font-size: 14px; font-weight: 700; color: #0f172a; }
  .db-item-meta { font-size: 12px; color: #94a3b8; margin-top: 4px; line-height: 1.5; }
  .db-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .db-amount { font-size: 13px; font-weight: 800; color: #6366f1; }
  .db-status { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; padding: 4px 10px; font-size: 11px; font-weight: 700; }
  .db-status.active { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
  .db-status.trial { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
  .db-status.pending { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
  .db-status.paused { background: #f8fafc; color: #475569; border: 1px solid #cbd5e1; }
  .db-status.cancelled { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
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
  @media (max-width: 1100px) {
    .db-grid, .db-grid-3 { grid-template-columns: 1fr 1fr; }
    .db-two-thirds, .db-half { grid-column: auto; }
  }
  @media (max-width: 720px) {
    .db-grid, .db-grid-3 { grid-template-columns: 1fr; }
  }
`;

const formatCurrency = (value = 0) => `${Number(value).toFixed(2)} ₺`;

const formatStatusLabel = (status?: string) => {
  switch (status) {
    case "ACTIVE":
      return "Aktif";
    case "TRIAL":
      return "Deneme";
    case "PENDING_APPROVAL":
      return "Onay Bekliyor";
    case "PAUSED":
      return "Duraklatıldı";
    case "CANCELLED":
      return "İptal";
    default:
      return status || "Bilinmiyor";
  }
};

const statusClassName = (status?: string) => {
  switch (status) {
    case "ACTIVE":
      return "active";
    case "TRIAL":
      return "trial";
    case "PENDING_APPROVAL":
      return "pending";
    case "PAUSED":
      return "paused";
    case "CANCELLED":
      return "cancelled";
    default:
      return "paused";
  }
};

const CurrencyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "10px 14px",
        fontFamily: "Plus Jakarta Sans, sans-serif",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ color: "#6366f1", fontWeight: 800, fontSize: 15 }}>{formatCurrency(payload[0].value || 0)}</div>
    </div>
  );
};

const CountTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "10px 14px",
        fontFamily: "Plus Jakarta Sans, sans-serif",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ color: "#0f172a", fontWeight: 800, fontSize: 15 }}>{payload[0].value || 0} kayıt</div>
    </div>
  );
};

export default function Dashboard() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/dashboard/summary");
      setSummary(response.data);
    } catch (error) {
      console.error(error);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [location.pathname]);

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="db-loading">Yükleniyor...</div>
      </>
    );
  }

  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const chartShared = {
    cartesianGrid: <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />,
    xAxis: (
      <XAxis
        dataKey="date"
        tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "Plus Jakarta Sans" }}
        axisLine={false}
        tickLine={false}
      />
    ),
    yAxis: (
      <YAxis
        tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "Plus Jakarta Sans" }}
        axisLine={false}
        tickLine={false}
      />
    ),
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
              <div className="db-card-label">Toplam İşletme</div>
              <div className="db-card-value accent">{summary.totalBusinesses ?? 0}</div>
              <div className="db-card-sub">Sistemde kayıtlı tüm işletmeler</div>
            </div>
            <div className="db-card c2">
              <div className="db-card-label">Onaylı İşletme</div>
              <div className="db-card-value green">{summary.approvedBusinesses ?? 0}</div>
              <div className="db-card-sub">Erişimi açılmış işletme sayısı</div>
            </div>
            <div className="db-card c3">
              <div className="db-card-label">Aylık Paket Geliri</div>
              <div className="db-card-value orange">{formatCurrency(summary.monthlyRecurringRevenue ?? 0)}</div>
              <div className="db-card-sub">Aktif abonelik ücretleri üzerinden</div>
            </div>
            <div className="db-card c4">
              <div className="db-card-label">Bu Ay Tahsilat</div>
              <div className="db-card-value pink">{formatCurrency(summary.collectedThisMonth ?? 0)}</div>
              <div className="db-card-sub">Ödeme kaydı düşülen tahsilatlar</div>
            </div>
          </div>

          <div className="db-grid">
            <div className="db-card c5">
              <div className="db-card-label">Onay Bekleyen</div>
              <div className="db-card-value sky">{summary.pendingBusinesses ?? 0}</div>
              <div className="db-card-sub">Manuel onay bekleyen başvurular</div>
            </div>
            <div className="db-card c6">
              <div className="db-card-label">Aktif Abonelik</div>
              <div className="db-card-value orange">{summary.activeSubscriptions ?? 0}</div>
              <div className="db-card-sub">Ücretli paket takibi yapılan işletmeler</div>
            </div>
            <div className="db-card c2">
              <div className="db-card-label">Toplam Kullanıcı</div>
              <div className="db-card-value green">{summary.totalUsers ?? 0}</div>
              <div className="db-card-sub">Ana admin hariç tüm işletme kullanıcıları</div>
            </div>
            <div className="db-card c3">
              <div className="db-card-label">Geciken Tahsilat</div>
              <div className="db-card-value orange">{summary.overdueSubscriptions ?? 0}</div>
              <div className="db-card-sub">Tahsilat tarihi geçmiş aktif işletmeler</div>
            </div>
          </div>

          <div className="db-grid-3">
            <div className="db-card db-two-thirds">
              <div className="db-chart-title">Son 6 Aylık Yeni İşletme</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={summary.monthlyBusinesses ?? []}>
                  <defs>
                    <linearGradient id="businessTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.14} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {chartShared.cartesianGrid}
                  {chartShared.xAxis}
                  {chartShared.yAxis}
                  <Tooltip content={<CountTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#businessTrend)"
                    dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="db-card db-half">
              <div className="db-chart-title">Son 6 Aylık Tahsilat</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={summary.monthlyCollections ?? []}>
                  {chartShared.cartesianGrid}
                  {chartShared.xAxis}
                  {chartShared.yAxis}
                  <Tooltip content={<CurrencyTooltip />} />
                  <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="db-card db-wide">
              <div className="db-chart-title">Son Eklenen İşletmeler</div>
              {summary.recentBusinesses?.length ? (
                <div className="db-list">
                  {summary.recentBusinesses.map((business: any) => (
                    <div key={business.id} className="db-list-item">
                      <div>
                        <div className="db-item-title">{business.name}</div>
                        <div className="db-item-meta">
                          {business.sector} · {business.userCount ?? 0} kullanıcı ·{" "}
                          {new Date(business.createdAt).toLocaleDateString("tr-TR")}
                        </div>
                        <div className="db-item-meta">
                          Paket: {business.planName || "Starter"}
                          {business.nextBillingDate
                            ? ` · Sonraki tahsilat: ${new Date(business.nextBillingDate).toLocaleDateString("tr-TR")}`
                            : ""}
                        </div>
                      </div>
                      <div className="db-item-right">
                        <span className={`db-status ${statusClassName(business.subscriptionStatus)}`}>
                          {formatStatusLabel(business.subscriptionStatus)}
                        </span>
                        <span className="db-amount">{formatCurrency(business.monthlyFee ?? 0)} / ay</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="db-empty">Henüz işletme kaydı görünmüyor.</div>
              )}
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
              <div className="db-card-value green">{formatCurrency(summary.saleRevenue ?? 0)}</div>
              <div className="db-card-sub">Manuel eklenen satışlar</div>
            </div>

            <div className="db-card c1">
              <div className="db-card-label">Toplam Ciro</div>
              <div className="db-card-value accent">{formatCurrency(summary.totalSales ?? 0)}</div>
              <div className="db-card-profit">↑ Kâr: {formatCurrency(summary.profit ?? 0)}</div>
            </div>

            <div className="db-card db-two-thirds">
              <div className="db-chart-title">Son 7 Günlük Ciro (Sipariş + Satış)</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={summary.dailySales ?? []}>
                  <defs>
                    <linearGradient id="businessDailyTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {chartShared.cartesianGrid}
                  {chartShared.xAxis}
                  {chartShared.yAxis}
                  <Tooltip content={<CurrencyTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#businessDailyTrend)"
                    dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="db-card db-half">
              <div className="db-alarm-title">
                <span style={{ color: "#ef4444" }}>⚠</span>
                Stok Alarmı
              </div>
              {summary.lowStock?.length === 0 ? (
                <div className="db-alarm-ok">Tüm ürünlerin stoğu yeterli</div>
              ) : (
                summary.lowStock?.map((product: any) => (
                  <div key={product.id} className="db-alarm-item">
                    <span className="db-alarm-name">{product.name}</span>
                    <span className="db-alarm-badge">Stok: {product.stock}</span>
                  </div>
                ))
              )}
            </div>

            <div className="db-card db-half">
              <div className="db-card-label">En Çok Satanlar</div>
              {summary.top?.length === 0 ? (
                <div className="db-alarm-ok">Henüz satış yok</div>
              ) : (
                summary.top?.map((item: any, index: number) => (
                  <div key={`${item.product?.id || item.product?.name || index}`} className="db-top-item">
                    <span className="db-top-name">{item.product?.name}</span>
                    <span className="db-top-sold">{item.sold} adet</span>
                  </div>
                ))
              )}
            </div>

            <div className="db-card db-wide">
              <div className="db-chart-title">Son 6 Aylık Ciro (Sipariş + Satış)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={summary.monthlySales ?? []}>
                  {chartShared.cartesianGrid}
                  {chartShared.xAxis}
                  {chartShared.yAxis}
                  <Tooltip content={<CurrencyTooltip />} />
                  <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="db-card">
            <div className="db-empty">Veri yüklenemedi.</div>
          </div>
        )}
      </div>
    </>
  );
}
