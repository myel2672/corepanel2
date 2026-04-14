import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const featureCards = [
  ['Canlı Panel', 'Sipariş, satış, müşteri ve rapor akışını tek bakışta izleyin.'],
  ['Stok Kontrolü', 'Düşük stokları erkenden görün ve ekibi aksiyon almadan önce uyarın.'],
  ['Rol Ayrımı', 'MAIN_ADMIN ve işletme kullanıcıları için ayrı ama uyumlu akışlar kullanın.'],
  ['Excel Raporu', 'Düzgün sütunlanan raporları ekip veya muhasebe ile kolay paylaşın.'],
];

const steps = [
  ['Kayıt', 'İşletme bilgisi ve yönetici hesabını birkaç adımda oluşturun.'],
  ['Onay', 'MAIN_ADMIN onayı sonrası erişim açılır ve sistem kullanıma hazır hale gelir.'],
  ['Kurulum', 'Ürün, müşteri ve sipariş temellerini hızlıca ekleyin.'],
  ['Yönetim', 'Rapor, tahsilat ve operasyonu tek panel üzerinden düzenli yönetin.'],
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        :root {
          --bg: #06101d;
          --bg-soft: #0b1728;
          --panel: rgba(12, 24, 41, 0.84);
          --panel-strong: rgba(14, 28, 48, 0.96);
          --line: rgba(148, 163, 184, 0.14);
          --text: #dbe7f6;
          --muted: #94a3b8;
          --title: #f8fafc;
          --primary: #4f46e5;
          --primary-2: #7c3aed;
          --accent: #14b8a6;
          --accent-2: #67e8f9;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: radial-gradient(circle at 14% 14%, rgba(79,70,229,.24), transparent 28%), linear-gradient(180deg, #06101d 0%, #0a1321 54%, #08101b 100%);
          color: var(--text);
        }
        .lp-shell {
          min-height: 100vh;
          background:
            radial-gradient(circle at 14% 14%, rgba(79,70,229,.24), transparent 28%),
            radial-gradient(circle at 84% 22%, rgba(20,184,166,.16), transparent 24%),
            linear-gradient(180deg, #06101d 0%, #0a1321 54%, #08101b 100%);
          overflow: hidden;
        }
        .lp-container { width: min(1160px, calc(100% - 40px)); margin: 0 auto; }
        .lp-nav {
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: blur(18px);
          background: rgba(6, 16, 29, 0.78);
          border-bottom: 1px solid var(--line);
        }
        .lp-nav-row {
          min-height: 78px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .lp-brand {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -.06em;
          color: var(--title);
        }
        .lp-brand-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--accent-2), var(--accent));
          box-shadow: 0 0 16px rgba(20,184,166,.52);
        }
        .lp-links, .lp-actions { display: flex; align-items: center; gap: 24px; }
        .lp-links a, .lp-link-btn {
          color: var(--muted);
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 15px;
        }
        .lp-links a:hover, .lp-link-btn:hover { color: var(--title); }
        .lp-primary, .lp-secondary {
          border-radius: 16px;
          padding: 14px 22px;
          font-family: inherit;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
        }
        .lp-primary {
          border: none;
          color: #fff;
          background: linear-gradient(135deg, var(--primary), #6366f1 56%, var(--accent) 150%);
          box-shadow: 0 18px 34px rgba(79,70,229,.34);
        }
        .lp-secondary {
          border: 1px solid rgba(148,163,184,.18);
          color: var(--title);
          background: rgba(255,255,255,.05);
        }
        .lp-primary:hover, .lp-secondary:hover { transform: translateY(-1px); }
        .lp-toggle {
          display: none;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,.18);
          background: rgba(255,255,255,.05);
          color: var(--title);
          cursor: pointer;
        }
        .lp-mobile { display: none; padding: 0 0 20px; gap: 12px; }
        .lp-mobile.open { display: grid; }
        .lp-mobile a, .lp-mobile button { width: 100%; }
        .lp-hero {
          position: relative;
          padding: 64px 0 76px;
        }
        .lp-motion, .lp-motion-two {
          position: absolute;
          border-radius: 999px;
          filter: blur(12px);
          opacity: .48;
          pointer-events: none;
          animation: orbit 10s ease-in-out infinite alternate;
        }
        .lp-motion {
          width: 240px;
          height: 240px;
          top: 30px;
          right: 10%;
          background: radial-gradient(circle, rgba(79,70,229,.42) 0%, rgba(79,70,229,0) 72%);
        }
        .lp-motion-two {
          width: 190px;
          height: 190px;
          left: 4%;
          top: 280px;
          background: radial-gradient(circle, rgba(20,184,166,.28) 0%, rgba(20,184,166,0) 72%);
          animation-duration: 12s;
        }
        @keyframes orbit {
          from { transform: translate3d(0, 0, 0) scale(1); }
          to { transform: translate3d(28px, -18px, 0) scale(1.08); }
        }
        .lp-hero-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1.02fr) minmax(340px, .98fr);
          gap: 34px;
          align-items: center;
        }
        .lp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(79,70,229,.16);
          border: 1px solid rgba(129,140,248,.24);
          color: #c7d2fe;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 20px;
        }
        .lp-eyebrow::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: var(--accent);
          box-shadow: 0 0 12px rgba(20,184,166,.62);
        }
        .lp-title {
          margin: 0 0 18px;
          font-family: 'Syne', sans-serif;
          font-size: clamp(36px, 5.4vw, 68px);
          line-height: 1;
          letter-spacing: -.07em;
          color: var(--title);
          max-width: 620px;
        }
        .lp-title span {
          background: linear-gradient(135deg, #a5b4fc, #67e8f9 46%, #2dd4bf);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .lp-text {
          margin: 0 0 28px;
          max-width: 600px;
          color: #afbdd0;
          font-size: 17px;
          line-height: 1.86;
        }
        .lp-hero-actions { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 28px; }
        .lp-proof {
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 14px;
        }
        .lp-proof-card, .lp-card, .lp-step, .lp-pricing-card {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 24px;
          backdrop-filter: blur(10px);
        }
        .lp-proof-card {
          padding: 18px;
          transition: transform .2s ease, border-color .2s ease;
        }
        .lp-proof-card:hover, .lp-card:hover, .lp-step:hover, .lp-pricing-card:hover {
          transform: translateY(-4px);
          border-color: rgba(129,140,248,.3);
        }
        .lp-proof-value { font-size: 22px; font-weight: 800; color: var(--title); }
        .lp-proof-text { margin-top: 8px; color: var(--muted); font-size: 14px; line-height: 1.65; }
        .lp-preview {
          padding: 20px;
          border-radius: 28px;
          background: linear-gradient(180deg, rgba(15,26,44,.98), rgba(9,17,30,.98));
          border: 1px solid rgba(148,163,184,.14);
          box-shadow: 0 28px 80px rgba(2,8,23,.44);
        }
        .lp-preview-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }
        .lp-preview-title { font-size: 14px; font-weight: 800; color: #dbeafe; }
        .lp-pill {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(20,184,166,.14);
          color: #99f6e4;
          font-size: 12px;
          font-weight: 800;
        }
        .lp-kpis {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .lp-kpi {
          padding: 18px;
          border-radius: 20px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(148,163,184,.1);
        }
        .lp-kpi-label { color: var(--muted); font-size: 12px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; }
        .lp-kpi-value { margin-top: 12px; font-size: 32px; font-weight: 800; color: var(--title); letter-spacing: -1px; }
        .lp-kpi-note { margin-top: 8px; color: #7dd3fc; font-size: 14px; font-weight: 600; }
        .lp-chart {
          margin-top: 14px;
          padding: 18px;
          border-radius: 20px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(148,163,184,.1);
        }
        .lp-chart-head { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
        .lp-chart-head strong { display: block; color: var(--title); font-size: 15px; }
        .lp-chart-head span { color: var(--muted); font-size: 12px; }
        .lp-bars { display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); align-items: end; gap: 10px; min-height: 140px; }
        .lp-bar-wrap { display: grid; justify-items: center; gap: 10px; }
        .lp-bar { width: 100%; border-radius: 999px 999px 14px 14px; background: linear-gradient(180deg, rgba(34,197,94,.95), rgba(79,70,229,.95)); box-shadow: 0 10px 22px rgba(79,70,229,.2); }
        .lp-bar-label { color: var(--muted); font-size: 12px; }
        .lp-section { padding: 82px 0; }
        .lp-section-head { max-width: 640px; margin-bottom: 26px; }
        .lp-kicker { color: #7dd3fc; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; }
        .lp-heading {
          margin: 12px 0 14px;
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4.4vw, 48px);
          line-height: 1.04;
          letter-spacing: -.06em;
          color: var(--title);
        }
        .lp-body { margin: 0; color: #a3b2c7; line-height: 1.82; font-size: 16px; }
        .lp-grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 16px; }
        .lp-card { padding: 24px; transition: transform .2s ease, border-color .2s ease; }
        .lp-icon {
          width: 50px;
          height: 50px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(79,70,229,.16);
          margin-bottom: 16px;
          font-size: 22px;
        }
        .lp-card h3 { margin: 0 0 10px; color: var(--title); font-size: 18px; }
        .lp-card p, .lp-step p, .lp-pricing-card p { margin: 0; color: #a3b2c7; line-height: 1.75; font-size: 15px; }
        .lp-flow {
          background: linear-gradient(180deg, rgba(11,20,36,.62), rgba(7,17,31,0));
          border-top: 1px solid rgba(148,163,184,.08);
          border-bottom: 1px solid rgba(148,163,184,.08);
        }
        .lp-step { padding: 24px; transition: transform .2s ease, border-color .2s ease; }
        .lp-step-badge {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          font-size: 16px;
          font-weight: 800;
          color: var(--title);
          background: linear-gradient(135deg, rgba(79,70,229,.92), rgba(20,184,166,.64));
        }
        .lp-step h3, .lp-pricing-card h3 { margin: 0 0 10px; color: var(--title); font-size: 18px; }
        .lp-pricing { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; }
        .lp-pricing-card {
          padding: 28px;
          display: grid;
          gap: 16px;
          transition: transform .2s ease, border-color .2s ease;
        }
        .lp-pricing-card.featured {
          background: linear-gradient(180deg, rgba(79,70,229,.18), rgba(10,20,36,.88));
          border-color: rgba(129,140,248,.34);
          box-shadow: 0 18px 50px rgba(79,70,229,.18);
        }
        .lp-badge {
          display: inline-flex;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(20,184,166,.14);
          color: #99f6e4;
          font-size: 12px;
          font-weight: 800;
        }
        .lp-price { color: var(--title); font-family: 'Syne', sans-serif; font-size: 38px; line-height: 1; letter-spacing: -.06em; }
        .lp-pricing-card ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; color: #dbe6f3; font-size: 15px; }
        .lp-pricing-card li::before { content: '• '; color: #2dd4bf; font-weight: 800; }
        .lp-cta { padding: 92px 0 108px; }
        .lp-cta-card {
          text-align: center;
          padding: 44px;
          border-radius: 32px;
          background: linear-gradient(135deg, rgba(79,70,229,.22), rgba(15,23,42,.92) 60%, rgba(20,184,166,.14));
          border: 1px solid rgba(129,140,248,.24);
          box-shadow: 0 24px 70px rgba(2,8,23,.42);
        }
        .lp-cta-card h2 {
          margin: 12px 0 14px;
          color: var(--title);
          font-family: 'Syne', sans-serif;
          font-size: clamp(30px, 4.8vw, 52px);
          line-height: 1.04;
          letter-spacing: -.06em;
        }
        .lp-cta-card p { margin: 0 auto 24px; max-width: 620px; color: #b6c2d2; line-height: 1.82; }
        .lp-footer { border-top: 1px solid rgba(148,163,184,.08); padding: 24px 0 36px; color: #7c8ba1; font-size: 14px; }
        .lp-footer-row { display: flex; justify-content: space-between; gap: 14px; }
        @media (max-width: 1040px) {
          .lp-hero-grid, .lp-grid-4, .lp-pricing, .lp-proof { grid-template-columns: 1fr; }
        }
        @media (max-width: 820px) {
          .lp-links, .lp-actions { display: none; }
          .lp-toggle { display: inline-flex; align-items: center; justify-content: center; }
          .lp-kpis { grid-template-columns: 1fr; }
          .lp-footer-row { flex-direction: column; }
          .lp-cta-card { padding: 28px; }
        }
      `}</style>

      <div className="lp-shell">
        <nav className="lp-nav">
          <div className="lp-container lp-nav-row">
            <div className="lp-brand">
              Corepanel
              <span className="lp-brand-dot" />
            </div>

            <div className="lp-links">
              <a href="#ozellikler">Özellikler</a>
              <a href="#akis">Nasıl Çalışır</a>
              <a href="#fiyatlar">Paketler</a>
            </div>

            <div className="lp-actions">
              <button className="lp-link-btn" onClick={() => navigate('/login')}>
                Giriş Yap
              </button>
              <button className="lp-primary" onClick={() => navigate('/register')}>
                İşletmeni Kaydet
              </button>
            </div>

            <button className="lp-toggle" onClick={() => setMenuOpen((open) => !open)}>
              ☰
            </button>
          </div>

          <div className={`lp-container lp-mobile ${menuOpen ? 'open' : ''}`}>
            <a href="#ozellikler" onClick={() => setMenuOpen(false)}>
              Özellikler
            </a>
            <a href="#akis" onClick={() => setMenuOpen(false)}>
              Nasıl Çalışır
            </a>
            <a href="#fiyatlar" onClick={() => setMenuOpen(false)}>
              Paketler
            </a>
            <button className="lp-secondary" onClick={() => navigate('/login')}>
              Giriş Yap
            </button>
            <button className="lp-primary" onClick={() => navigate('/register')}>
              İşletmeni Kaydet
            </button>
          </div>
        </nav>

        <section className="lp-hero">
          <div className="lp-motion" />
          <div className="lp-motion-two" />

          <div className="lp-container lp-hero-grid">
            <div>
              <div className="lp-eyebrow">SaaS işletme yönetim paneli</div>
              <h1 className="lp-title">
                İşletmenizi <span>tek merkezden</span> yönetin.
              </h1>
              <p className="lp-text">
                Corepanel; sipariş, satış, rapor ve tahsilat akışlarını tek bir düzende toplar.
                Hem işletme kullanımında hem de MAIN_ADMIN tarafında daha net, daha profesyonel bir
                kontrol hissi verir.
              </p>

              <div className="lp-hero-actions">
                <button className="lp-primary" onClick={() => navigate('/register')}>
                  Ücretsiz kayıt ol
                </button>
                <button className="lp-secondary" onClick={() => navigate('/login')}>
                  Demo hesabıyla incele
                </button>
              </div>

              <div className="lp-proof">
                <div className="lp-proof-card">
                  <div className="lp-proof-value">Sipariş + Satış</div>
                  <div className="lp-proof-text">İki farklı operasyonu aynı sistemde karıştırmadan yönetin.</div>
                </div>
                <div className="lp-proof-card">
                  <div className="lp-proof-value">Onay Akışı</div>
                  <div className="lp-proof-text">İşletme kayıtlarını onay ve yetki mantığıyla kontrol edin.</div>
                </div>
                <div className="lp-proof-card">
                  <div className="lp-proof-value">Rapor Disiplini</div>
                  <div className="lp-proof-text">Panelden Excel çıkışına kadar veriyi düzenli okuyun.</div>
                </div>
              </div>
            </div>

            <div className="lp-preview">
              <div className="lp-preview-top">
                <div className="lp-preview-title">Corepanel Dashboard</div>
                <div className="lp-pill">Canlı görünüm</div>
              </div>

              <div className="lp-kpis">
                <div className="lp-kpi">
                  <div className="lp-kpi-label">Aylık paket geliri</div>
                  <div className="lp-kpi-value">₺18.400</div>
                  <div className="lp-kpi-note">Tahsilat takibiyle uyumlu</div>
                </div>
                <div className="lp-kpi">
                  <div className="lp-kpi-label">Bugünkü hareket</div>
                  <div className="lp-kpi-value">37</div>
                  <div className="lp-kpi-note">Sipariş ve satış toplamı</div>
                </div>
              </div>

              <div className="lp-chart">
                <div className="lp-chart-head">
                  <div>
                    <strong>Son 6 aylık akış</strong>
                    <span>İşletme ve tahsilat verileri birlikte izlenir</span>
                  </div>
                  <div className="lp-pill">Rapor hazır</div>
                </div>

                <div className="lp-bars">
                  {[44, 58, 48, 72, 63, 94].map((height, index) => (
                    <div key={index} className="lp-bar-wrap">
                      <div className="lp-bar" style={{ height: `${height}%` }} />
                      <div className="lp-bar-label">{['Kas', 'Ara', 'Oca', 'Şub', 'Mar', 'Nis'][index]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-section" id="ozellikler">
          <div className="lp-container">
            <div className="lp-section-head">
              <div className="lp-kicker">Özellikler</div>
              <h2 className="lp-heading">Karar vermeyi hızlandıran sade araçlar.</h2>
              <p className="lp-body">
                Operasyon ekibini yormadan veri düzenini kurmak için gereken alanları güçlü ama okunaklı
                bir yapıda toplar.
              </p>
            </div>

            <div className="lp-grid-4">
              {featureCards.map(([title, text], index) => (
                <div key={title} className="lp-card">
                  <div className="lp-icon">{['📊', '📦', '🔐', '📈'][index]}</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section lp-flow" id="akis">
          <div className="lp-container">
            <div className="lp-section-head">
              <div className="lp-kicker">Nasıl çalışır</div>
              <h2 className="lp-heading">Kayıttan günlük kullanıma net bir akış.</h2>
              <p className="lp-body">
                Onay, kurulum ve kullanım adımları birbirine bağlı ilerler. Özellikle yeni işletme
                hesabında karışıklığı azaltır.
              </p>
            </div>

            <div className="lp-grid-4">
              {steps.map(([title, text], index) => (
                <div key={title} className="lp-step">
                  <div className="lp-step-badge">{`0${index + 1}`}</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section" id="fiyatlar">
          <div className="lp-container">
            <div className="lp-section-head">
              <div className="lp-kicker">Paketler</div>
              <h2 className="lp-heading">Sade paket yapısı, net yönetim mantığı.</h2>
              <p className="lp-body">
                Asıl odağımız işletme yönetimini düzenli kurmak. Paket kısmı da bunu anlaşılır ve uygulanabilir
                şekilde destekliyor.
              </p>
            </div>

            <div className="lp-pricing">
              <div className="lp-pricing-card">
                <h3>Başlangıç</h3>
                <div className="lp-price">Ücretsiz</div>
                <p>Küçük ekipler ve ilk kurulum için rahat bir giriş seviyesi.</p>
                <ul>
                  <li>Temel panel erişimi</li>
                  <li>Başlangıç kullanımı</li>
                  <li>Hızlı kayıt ve demo akışı</li>
                </ul>
                <button className="lp-secondary" onClick={() => navigate('/register')}>
                  Başvurunu oluştur
                </button>
              </div>

              <div className="lp-pricing-card featured">
                <div className="lp-badge">En çok tercih edilen</div>
                <h3>Pro</h3>
                <div className="lp-price">₺299</div>
                <p>Sipariş, satış, rapor ve tahsilat akışlarını düzenli kullanan işletmeler için.</p>
                <ul>
                  <li>Paket ve tahsilat yönetimi</li>
                  <li>Gelişmiş rapor tarafı</li>
                  <li>Sürekli kullanım odaklı yapı</li>
                </ul>
                <button className="lp-primary" onClick={() => navigate('/register')}>
                  İşletmeni kaydet
                </button>
              </div>

              <div className="lp-pricing-card">
                <h3>Kurumsal</h3>
                <div className="lp-price">Özel</div>
                <p>Daha yakın destek ve daha esnek kurulum isteyen yapılar için.</p>
                <ul>
                  <li>Yakın destek akışı</li>
                  <li>Uyarlanabilir kullanım</li>
                  <li>Daha büyük ekip yapısı</li>
                </ul>
                <button className="lp-secondary" onClick={() => navigate('/login')}>
                  Giriş ekranına git
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-cta">
          <div className="lp-container">
            <div className="lp-cta-card">
              <div className="lp-kicker">Hazır mısınız</div>
              <h2>Paneli canlı verilerle görmeye bugün başlayın.</h2>
              <p>
                İşletme kaydınızı oluşturun, onay süreci tamamlandığında panelinizi açın ve siparişten
                tahsilata kadar tüm akışı tek merkezde yönetin.
              </p>
              <div className="lp-hero-actions" style={{ justifyContent: 'center' }}>
                <button className="lp-primary" onClick={() => navigate('/register')}>
                  İşletme kaydı oluştur
                </button>
                <button className="lp-secondary" onClick={() => navigate('/login')}>
                  Giriş ekranına git
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer className="lp-footer">
          <div className="lp-container lp-footer-row">
            <div>Corepanel • İşletme yönetimi için sade SaaS paneli</div>
            <div>© 2026 Corepanel. Tüm hakları saklıdır.</div>
          </div>
        </footer>
      </div>
    </>
  );
}
