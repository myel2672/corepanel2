import { useState, useEffect } from 'react';
import axios from '../api/axios';

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

const PLAN_PRICES: Record<string, string> = {
  Starter: 'Ücretsiz',
  Pro: '₺299/ay',
  Enterprise: 'Özel Fiyat',
};

const PLAN_COLORS: Record<string, string> = {
  Starter: '#94a3b8',
  Pro: '#6366f1',
  Enterprise: '#06b6d4',
};

export default function BillingPage() {
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const { data } = await axios.get('/businesses/me/usage');
      setUsage(data);
    } catch {
      setMessage('Kullanım bilgisi alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: string) => {
    setProcessing(true);
    setMessage('');
    try {
      const priceId = plan === 'Pro' ? (import.meta as any).env.VITE_STRIPE_PRO_PRICE_ID : '';
      if (!priceId) {
        setMessage('Bu plan için ödeme henüz yapılandırılmadı');
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
      setMessage('Ödeme sayfası açılamadı');
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
      setMessage('Müşteri portalı açılamadı');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Aboneliğinizi iptal etmek istediğinize emin misiniz? Dönem sonuna kadar erişiminiz devam edecektir.')) return;
    setProcessing(true);
    try {
      await axios.post('/stripe/cancel-subscription');
      setMessage('Abonelik dönem sonunda iptal edilecek');
      fetchUsage();
    } catch {
      setMessage('İptal işlemi başarısız');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Yükleniyor...</div>;
  if (!usage) return <div style={{ textAlign: 'center', padding: 40 }}>Veri bulunamadı</div>;

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
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .billing-card { background: #fff; border-radius: 16px; padding: 28px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); animation: fadeIn 0.3s ease; }
        .billing-card h3 { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        .plan-badge { display: inline-block; padding: 6px 16px; border-radius: 100px; font-size: 14px; font-weight: 700; color: #fff; }
        .btn { padding: 10px 20px; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-primary { background: #6366f1; color: #fff; }
        .btn-primary:hover { background: #4f46e5; }
        .btn-outline { background: transparent; border: 1.5px solid #e2e8f0; color: #475569; }
        .btn-outline:hover { border-color: #6366f1; color: #6366f1; }
        .btn-danger { background: transparent; border: 1.5px solid #fecaca; color: #ef4444; }
        .btn-danger:hover { background: #fef2f2; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .msg { padding: 12px 16px; border-radius: 10px; font-size: 14px; margin-bottom: 16px; }
        .msg-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .msg-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .feature-tag { display: inline-block; padding: 4px 10px; background: #f1f5f9; border-radius: 6px; font-size: 12px; color: #475569; margin: 2px; }
      `}</style>

      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>Faturalandırma & Kullanım</h2>

      {message && (
        <div className={`msg ${message.includes('başar') || message.includes('iptal') ? 'msg-success' : 'msg-error'}`}>
          {message}
        </div>
      )}

      {/* Current Plan */}
      <div className="billing-card">
        <h3>Mevcut Plan</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <span
            className="plan-badge"
            style={{ background: PLAN_COLORS[usage.plan] || '#94a3b8' }}
          >
            {usage.plan}
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
            {PLAN_PRICES[usage.plan] || '—'}
          </span>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
            background: usage.status === 'ACTIVE' ? '#f0fdf4' : usage.status === 'TRIAL' ? '#fefce8' : '#fef2f2',
            color: usage.status === 'ACTIVE' ? '#16a34a' : usage.status === 'TRIAL' ? '#ca8a04' : '#dc2626',
          }}>
            {usage.status === 'TRIAL' ? 'Deneme' : usage.status === 'ACTIVE' ? 'Aktif' : usage.status === 'CANCELLED' ? 'İptal' : usage.status}
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
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn btn-outline" onClick={handlePortal} disabled={processing}>
              💳 Fatura Yönet
            </button>
            {!usage.cancelAtPeriodEnd && (
              <button className="btn btn-danger" onClick={handleCancel} disabled={processing}>
                İptal Et
              </button>
            )}
          </div>
        )}
      </div>

      {/* Usage */}
      <div className="billing-card">
        <h3>Kullanım Durumu</h3>
        <UsageBar label="Ürünler" current={usage.usage.products} max={usage.limits.maxProducts} />
        <UsageBar label="Siparişler (aylık)" current={usage.usage.orders} max={usage.limits.maxOrders} />
        <UsageBar label="Müşteriler" current={usage.usage.customers} max={usage.limits.maxCustomers} />
        <UsageBar label="Kullanıcılar" current={usage.usage.users} max={usage.limits.maxUsers} />
      </div>

      {/* Upgrade */}
      {usage.plan === 'Starter' && (
        <div className="billing-card" style={{ background: 'linear-gradient(135deg, #eef2ff, #f0f9ff)' }}>
          <h3>Plan Yükselt</h3>
          <p style={{ fontSize: 14, color: '#475569', marginBottom: 16 }}>
            Daha fazla ürün, sipariş ve müşteri için Pro plana geçin.
          </p>
          <button className="btn btn-primary" onClick={() => handleUpgrade('Pro')} disabled={processing}>
            {processing ? 'Yönlendiriliyor...' : 'Pro plana geç → ₺299/ay'}
          </button>
        </div>
      )}

      {/* Features */}
      <div className="billing-card">
        <h3>Plan Özellikleri</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {usage.limits.features.map((f, i) => (
            <span key={i} className="feature-tag">✓ {f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
