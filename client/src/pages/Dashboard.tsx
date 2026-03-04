import { useEffect, useState } from 'react';
import api from '../api/axios';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
  .db-page { font-family: 'Nunito', sans-serif; color: rgba(255,255,255,0.85); }
  .db-header { margin-bottom: 28px; }
  .db-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
  .db-subtitle { font-size: 14px; color: rgba(255,255,255,0.3); margin-top: 4px; }
  .db-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
  .db-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 24px;
    transition: border-color 0.2s;
  }
  .db-card:hover { border-color: rgba(99,102,241,0.3); }
  .db-card-label { font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 12px; }
  .db-card-value { font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -1px; }
  .db-card-value.accent { background: linear-gradient(135deg, #6366f1, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .db-card-sub { font-size: 13px; color: rgba(255,255,255,0.3); margin-top: 6px; }
  .db-card-profit { font-size: 15px; font-weight: 700; color: #34d399; margin-top: 8px; }
  .db-wide { grid-column: 1 / -1; }
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
`;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then((res) => setSummary(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="db-loading">Yükleniyor...</div>
    </>
  );

  const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <style>{styles}</style>
      <div className="db-page">
        <div className="db-header">
          <div className="db-title">Genel Bakış</div>
          <div className="db-subtitle">{today}</div>
        </div>

        {summary ? (
          <>
            <div className="db-grid">
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
                {summary.top?.length === 0
                  ? <div className="db-alarm-ok">Henüz satış yok</div>
                  : summary.top?.map((t: any) => (
                    <div key={t.product?.id} className="db-top-item">
                      <span className="db-top-name">{t.product?.name}</span>
                      <span className="db-top-sold">{t.sold} adet</span>
                    </div>
                  ))
                }
              </div>

              <div className="db-card db-wide">
                <div className="db-alarm-title">
                  <span style={{ color: '#f87171' }}>⚠</span>
                  Stok Alarmı
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>(stok &lt; 5)</span>
                </div>
                {summary.lowStock?.length === 0
                  ? <div className="db-alarm-ok">✓ Tüm ürünlerin stoğu yeterli</div>
                  : summary.lowStock?.map((p: any) => (
                    <div key={p.id} className="db-alarm-item">
                      <span className="db-alarm-name">{p.name}</span>
                      <span className="db-alarm-badge">Stok: {p.stock}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </>
        ) : (
          <div className="db-card"><div className="db-alarm-ok">Veri yüklenemedi</div></div>
        )}
      </div>
    </>
  );
}
