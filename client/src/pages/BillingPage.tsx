import { useEffect, useMemo, useState } from 'react';
import axios from '../api/axios';
import { useAuthStore } from '../store/authStore';

interface UsageInfo {
  plan: string;
  status: string;
  trialEndsAt: string | null;
  nextBillingDate: string | null;
  cancelAtPeriodEnd?: boolean;
  limits: {
    maxProducts: number;
    maxOrders: number;
    maxCustomers: number;
    maxUsers: number;
    features: string[];
  };
  usage: {
    products: number;
    orders: number;
    customers: number;
    users: number;
  };
}

interface AdminBusiness {
  id: number;
  name: string;
  planName: string;
  monthlyFee: number;
  subscriptionStatus: string;
  nextBillingDate: string | null;
  trialEndsAt: string | null;
  isApproved: boolean;
  lastPayment: {
    amount: number;
    paidAt: string | null;
  } | null;
}

const PLAN_PRICES: Record<string, string> = {
  Starter: 'Ücretsiz',
  Growth: '₺149/ay',
  Pro: '₺299/ay',
  Enterprise: 'Özel Fiyat',
  Kurumsal: 'Özel Fiyat',
  Demo: 'Demo',
};

const PLAN_COLORS: Record<string, string> = {
  Starter: '#94a3b8',
  Growth: '#0ea5e9',
  Pro: '#6366f1',
  Enterprise: '#06b6d4',
  Kurumsal: '#06b6d4',
  Demo: '#10b981',
};

const formatCurrency = (value = 0) => `${Number(value).toFixed(2)} ₺`;

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'TRIAL':
      return 'Deneme';
    case 'ACTIVE':
      return 'Aktif';
    case 'CANCELLED':
      return 'İptal';
    case 'PAUSED':
      return 'Duraklatıldı';
    case 'PENDING_APPROVAL':
      return 'Onay Bekliyor';
    default:
      return status;
  }
};

const usageStyles = `
  @keyframes billingFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .billing-page { max-width: 980px; margin: 0 auto; color: #0f172a; }
  .billing-heading { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 8px; letter-spacing: -0.8px; }
  .billing-subtitle { font-size: 14px; color: #64748b; line-height: 1.7; margin-bottom: 24px; }
  .billing-card { background: #fff; border-radius: 18px; padding: 28px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); animation: billingFadeIn 0.3s ease; border: 1px solid #e2e8f0; }
  .billing-card h3 { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
  .billing-empty { text-align: center; padding: 48px 24px; color: #64748b; background: #fff; border: 1px dashed #cbd5e1; border-radius: 18px; }
  .plan-badge { display: inline-block; padding: 6px 16px; border-radius: 100px; font-size: 14px; font-weight: 700; color: #fff; }
  .billing-button { padding: 10px 20px; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .billing-button.primary { background: #6366f1; color: #fff; }
  .billing-button.primary:hover { background: #4f46e5; }
  .billing-button.outline { background: transparent; border: 1.5px solid #e2e8f0; color: #475569; }
  .billing-button.outline:hover { border-color: #6366f1; color: #6366f1; }
  .billing-button.danger { background: transparent; border: 1.5px solid #fecaca; color: #ef4444; }
  .billing-button.danger:hover { background: #fef2f2; }
  .billing-button:disabled { opacity: 0.55; cursor: not-allowed; }
  .billing-msg { padding: 12px 16px; border-radius: 12px; font-size: 14px; margin-bottom: 16px; line-height: 1.6; font-weight: 600; }
  .billing-msg.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .billing-msg.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
  .feature-tag { display: inline-block; padding: 4px 10px; background: #f1f5f9; border-radius: 8px; font-size: 12px; color: #475569; margin: 2px; }
  .billing-stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 20px; }
  .billing-stat { background: #fff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 20px 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  .billing-stat-label { font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #94a3b8; margin-bottom: 10px; }
  .billing-stat-value { font-size: 30px; font-weight: 800; letter-spacing: -1px; color: #0f172a; }
  .billing-stat-sub { margin-top: 8px; font-size: 12px; color: #64748b; line-height: 1.6; }
  .billing-admin-list { display: grid; gap: 12px; }
  .billing-admin-row { display: flex; justify-content: space-between; gap: 16px; align-items: center; padding: 16px; border: 1px solid #e2e8f0; border-radius: 16px; background: #fff; }
  .billing-admin-name { font-size: 15px; font-weight: 700; color: #0f172a; }
  .billing-admin-meta { margin-top: 5px; font-size: 12px; color: #64748b; line-height: 1.6; }
  .billing-admin-right { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 10px; }
  .billing-status-chip { padding: 6px 12px; border-radius: 999px; background: #eef2ff; color: #4f46e5; font-size: 12px; font-weight: 700; }
  @media (max-width: 900px) {
    .billing-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 680px) {
    .billing-stat-grid { grid-template-columns: 1fr; }
    .billing-admin-row { flex-direction: column; align-items: flex-start; }
    .billing-admin-right { justify-content: flex-start; }
  }
`;

export default function BillingPage() {
  const user = useAuthStore((s) => s.user);
  const isMainAdmin = user?.role === 'MAIN_ADMIN';
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [adminBusinesses, setAdminBusinesses] = useState<AdminBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        if (isMainAdmin) {
          const { data } = await axios.get('/businesses');
          setAdminBusinesses(data);
        } else {
          const { data } = await axios.get('/businesses/me/usage');
          setUsage(data);
        }
      } catch {
        setMessage(
          isMainAdmin ? 'Faturalandirma ozeti alinamadi.' : 'Kullanim bilgisi alinamadi.'
        );
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [isMainAdmin]);

  const handleUpgrade = async (plan: string) => {
    setProcessing(true);
    setMessage('');
    try {
      const priceId = plan === 'Pro' ? (import.meta as any).env.VITE_STRIPE_PRO_PRICE_ID : '';
      if (!priceId) {
        setMessage('Bu plan için ödeme henüz yapılandırılmadı.');
        setProcessing(false);
        return;
      }
      const { data } = await axios.post('/stripe/create-checkout-session', {
        priceId,
        successUrl: `${window.location.origin}/business?subscription=success`,
        cancelUrl: `${window.location.origin}/business?subscription=cancelled`,
      });
      window.location.href = data.url;
    } catch {
      setMessage('Ödeme sayfası açılamadı.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePortal = async () => {
    setProcessing(true);
    try {
      const { data } = await axios.post('/stripe/create-portal-session');
      window.location.href = data.url;
    } catch {
      setMessage('Müşteri portalı açılamadı.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (
      !confirm(
        'Aboneliğinizi iptal etmek istediğinize emin misiniz? Dönem sonuna kadar erişiminiz devam edecektir.'
      )
    ) {
      return;
    }

    setProcessing(true);
    try {
      await axios.post('/stripe/cancel-subscription');
      setMessage('Abonelik dönem sonunda iptal edilecek.');
      const { data } = await axios.get('/businesses/me/usage');
      setUsage(data);
    } catch {
      setMessage('İptal işlemi başarısız.');
    } finally {
      setProcessing(false);
    }
  };

  const adminSummary = useMemo(() => {
    if (!isMainAdmin) {
      return null;
    }

    const approved = adminBusinesses.filter((business) => business.isApproved);
    const activePaid = approved.filter(
      (business) =>
        business.subscriptionStatus === 'ACTIVE' && Number(business.monthlyFee || 0) > 0
    );
    const pendingCollection = activePaid.filter((business) => {
      if (!business.nextBillingDate) {
        return false;
      }
      return new Date(business.nextBillingDate) <= new Date();
    });
    const monthlyRevenue = activePaid.reduce(
      (sum, business) => sum + Number(business.monthlyFee || 0),
      0
    );
    const collectedThisMonth = approved.reduce((sum, business) => {
      if (!business.lastPayment?.paidAt) {
        return sum;
      }
      const paidAt = new Date(business.lastPayment.paidAt);
      const now = new Date();
      if (paidAt.getMonth() === now.getMonth() && paidAt.getFullYear() === now.getFullYear()) {
        return sum + Number(business.lastPayment.amount || 0);
      }
      return sum;
    }, 0);

    return {
      approved: approved.length,
      activePaid: activePaid.length,
      pendingCollection: pendingCollection.length,
      monthlyRevenue,
      collectedThisMonth,
      upcomingBusinesses: activePaid
        .filter((business) => business.nextBillingDate)
        .sort((a, b) => {
          const left = new Date(a.nextBillingDate || '').getTime();
          const right = new Date(b.nextBillingDate || '').getTime();
          return left - right;
        })
        .slice(0, 6),
    };
  }, [adminBusinesses, isMainAdmin]);

  if (loading) {
    return (
      <>
        <style>{usageStyles}</style>
        <div className="billing-page">
          <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>Yükleniyor...</div>
        </div>
      </>
    );
  }

  if (isMainAdmin) {
    return (
      <div className="billing-page">
        <style>{usageStyles}</style>

        <div className="billing-heading">Faturalandırma Özeti</div>
        <div className="billing-subtitle">
          MAIN_ADMIN görünümünde işletme bazlı tahsilat ve paket takibini toplu izleyin. Detaylı
          işlem için işletmeler ekranındaki paket ve tahsilat aksiyonlarını kullanın.
        </div>

        {message && <div className="billing-msg error">{message}</div>}

        <div className="billing-stat-grid">
          <div className="billing-stat">
            <div className="billing-stat-label">Onaylı İşletme</div>
            <div className="billing-stat-value">{adminSummary?.approved ?? 0}</div>
            <div className="billing-stat-sub">Sisteme erişimi açılmış toplam işletme sayısı.</div>
          </div>
          <div className="billing-stat">
            <div className="billing-stat-label">Aktif Paket</div>
            <div className="billing-stat-value">{adminSummary?.activePaid ?? 0}</div>
            <div className="billing-stat-sub">Aylık ücret tanımlı aktif işletmeler.</div>
          </div>
          <div className="billing-stat">
            <div className="billing-stat-label">Aylık Paket Geliri</div>
            <div className="billing-stat-value">{formatCurrency(adminSummary?.monthlyRevenue ?? 0)}</div>
            <div className="billing-stat-sub">Aktif paket ücretleri üzerinden oluşan toplam.</div>
          </div>
          <div className="billing-stat">
            <div className="billing-stat-label">Bu Ay Tahsilat</div>
            <div className="billing-stat-value">
              {formatCurrency(adminSummary?.collectedThisMonth ?? 0)}
            </div>
            <div className="billing-stat-sub">Bu ay ödeme kaydı düşülen işletme tahsilatları.</div>
          </div>
        </div>

        <div className="billing-card">
          <h3>Yaklaşan Tahsilatlar</h3>
          {adminSummary?.upcomingBusinesses.length ? (
            <div className="billing-admin-list">
              {adminSummary.upcomingBusinesses.map((business) => (
                <div key={business.id} className="billing-admin-row">
                  <div>
                    <div className="billing-admin-name">{business.name}</div>
                    <div className="billing-admin-meta">
                      {business.planName || 'Starter'} • {formatCurrency(business.monthlyFee || 0)} / ay
                      {business.nextBillingDate
                        ? ` • Sonraki tahsilat: ${new Date(
                            business.nextBillingDate
                          ).toLocaleDateString('tr-TR')}`
                        : ''}
                    </div>
                  </div>
                  <div className="billing-admin-right">
                    <span className="billing-status-chip">
                      {getStatusLabel(business.subscriptionStatus)}
                    </span>
                    {business.lastPayment?.paidAt && (
                      <span className="billing-status-chip" style={{ background: '#ecfdf5', color: '#059669' }}>
                        Son ödeme {new Date(business.lastPayment.paidAt).toLocaleDateString('tr-TR')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="billing-empty">
              Şu anda gösterilecek yaklaşan tahsilat görünmüyor. Paket tanımları işletmeler
              ekranından yapıldıkça burada liste oluşacak.
            </div>
          )}
        </div>

        <div className="billing-card">
          <h3>Durum Notu</h3>
          <div style={{ color: '#64748b', lineHeight: 1.8, fontSize: 14 }}>
            Bu ekran artık MAIN_ADMIN için boş görünmez. İşletme kullanıcısının kendi paket ve kullanım
            ekranı ile SaaS tarafındaki faturalandırma görünümünü birbirinden ayırıyoruz.
          </div>
        </div>
      </div>
    );
  }

  if (!usage) {
    return (
      <>
        <style>{usageStyles}</style>
        <div className="billing-page">
          <div className="billing-empty">Veri bulunamadı.</div>
        </div>
      </>
    );
  }

  const UsageBar = ({ label, current, max }: { label: string; current: number; max: number }) => {
    const pct = max === -1 ? 0 : Math.min(100, (current / max) * 100);
    const isUnlimited = max === -1;
    const isNear = pct > 80;
    const isOver = pct >= 100;

    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{label}</span>
          <span style={{ fontSize: 13, color: isOver ? '#ef4444' : isNear ? '#f59e0b' : '#64748b' }}>
            {isUnlimited ? `${current} / Sınırsız` : `${current} / ${max}`}
          </span>
        </div>
        <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${isUnlimited ? 0 : pct}%`,
              background: isOver ? '#ef4444' : isNear ? '#f59e0b' : '#6366f1',
              borderRadius: 4,
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="billing-page">
      <style>{usageStyles}</style>

      <div className="billing-heading">Faturalandırma ve Kullanım</div>
      <div className="billing-subtitle">
        Mevcut planınızı, limitlerinizi ve abonelik durumunuzu takip edin.
      </div>

      {message && (
        <div className={`billing-msg ${message.includes('başar') || message.includes('iptal') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="billing-card">
        <h3>Mevcut Plan</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <span className="plan-badge" style={{ background: PLAN_COLORS[usage.plan] || '#94a3b8' }}>
            {usage.plan}
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
            {PLAN_PRICES[usage.plan] || '—'}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 6,
              background:
                usage.status === 'ACTIVE'
                  ? '#f0fdf4'
                  : usage.status === 'TRIAL'
                    ? '#fefce8'
                    : '#fef2f2',
              color:
                usage.status === 'ACTIVE'
                  ? '#16a34a'
                  : usage.status === 'TRIAL'
                    ? '#ca8a04'
                    : '#dc2626',
            }}
          >
            {getStatusLabel(usage.status)}
          </span>
        </div>

        {usage.trialEndsAt && usage.status === 'TRIAL' && (
          <p style={{ fontSize: 13, color: '#ca8a04', marginBottom: 12 }}>
            Deneme süresi: {new Date(usage.trialEndsAt).toLocaleDateString('tr-TR')}
          </p>
        )}

        {usage.nextBillingDate && usage.status === 'ACTIVE' && (
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
            Sonraki ödeme: {new Date(usage.nextBillingDate).toLocaleDateString('tr-TR')}
          </p>
        )}

        {usage.status === 'ACTIVE' && usage.nextBillingDate && (
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <button className="billing-button outline" onClick={handlePortal} disabled={processing}>
              Fatura Yönet
            </button>
            {!usage.cancelAtPeriodEnd && (
              <button className="billing-button danger" onClick={handleCancel} disabled={processing}>
                İptal Et
              </button>
            )}
          </div>
        )}
      </div>

      <div className="billing-card">
        <h3>Kullanım Durumu</h3>
        <UsageBar label="Ürünler" current={usage.usage.products} max={usage.limits.maxProducts} />
        <UsageBar label="Siparişler (aylık)" current={usage.usage.orders} max={usage.limits.maxOrders} />
        <UsageBar label="Müşteriler" current={usage.usage.customers} max={usage.limits.maxCustomers} />
        <UsageBar label="Kullanıcılar" current={usage.usage.users} max={usage.limits.maxUsers} />
      </div>

      {usage.plan === 'Starter' && (
        <div className="billing-card" style={{ background: 'linear-gradient(135deg, #eef2ff, #f0f9ff)' }}>
          <h3>Plan Yükselt</h3>
          <p style={{ fontSize: 14, color: '#475569', marginBottom: 16 }}>
            Daha fazla ürün, sipariş ve müşteri için Pro plana geçin.
          </p>
          <button className="billing-button primary" onClick={() => handleUpgrade('Pro')} disabled={processing}>
            {processing ? 'Yönlendiriliyor...' : 'Pro plana geç → ₺299/ay'}
          </button>
        </div>
      )}

      <div className="billing-card">
        <h3>Plan Özellikleri</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {usage.limits.features.map((feature, index) => (
            <span key={index} className="feature-tag">
              ✓ {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
