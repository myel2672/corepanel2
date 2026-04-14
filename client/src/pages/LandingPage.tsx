import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  ['Canlı Panel', 'Sipariş, satış, müşteri ve rapor akışını tek ekranda izleyin.'],
  ['Stok Kontrolü', 'Düşük stok riskini erkenden görün ve ürün akışınız aksamadan ilerlesin.'],
  ['Rol Ayrımı', 'MAIN_ADMIN ve işletme kullanıcılarını farklı mantıklarla yönetin.'],
  ['Excel Raporu', 'Düzenli rapor alın, tahsilat ve operasyon tarafını kolay paylaşın.'],
];

const steps = [
  ['Kayıt', 'İşletme ve yönetici hesabını oluşturun.'],
  ['Onay', 'MAIN_ADMIN onayı sonrası erişiminiz açılsın.'],
  ['Kurulum', 'Ürün, müşteri ve sipariş akışlarını ekleyin.'],
  ['Yönetim', 'Panelden satış, rapor ve tahsilatı yönetin.'],
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        :root {
          --bg: #08111f;
          --panel: rgba(10, 20, 36, 0.82);
          --panel-strong: rgba(13, 25, 44, 0.94);
          --line: rgba(148, 163, 184, 0.14);
          --text: #e2e8f0;
          --muted: #94a3b8;
          --title: #f8fafc;
          --primary: #4f46e5;
          --accent: #14b8a6;
        }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; background: radial-gradient(circle at top left, rgba(79,70,229,.25), transparent 28%), linear-gradient(180deg, #08111f 0%, #0b1322 60%, #09101b 100%); color: var(--text); }
        .lp-shell { min-height: 100vh; }
        .lp-container { width: min(1160px, calc(100% - 40px)); margin: 0 auto; }
        .lp-nav { position: sticky; top: 0; z-index: 20; backdrop-filter: blur(18px); background: rgba(8,17,31,.72); border-bottom: 1px solid var(--line); }
        .lp-nav-row { min-height: 78px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .lp-brand { font-family: 'Syne', sans-serif; font-size: 31px; font-weight: 800; letter-spacing: -.06em; color: var(--title); display: inline-flex; align-items: center; gap: 8px; }
        .lp-brand-dot { width: 10px; height: 10px; border-radius: 999px; background: linear-gradient(135deg, #67e8f9, var(--accent)); box-shadow: 0 0 18px rgba(20,184,166,.65); }
        .lp-links, .lp-actions { display: flex; align-items: center; gap: 24px; }
        .lp-links a, .lp-link-btn { color: var(--muted); text-decoration: none; font-weight: 600; font-size: 15px; background: none; border: none; cursor: pointer; }
        .lp-links a:hover, .lp-link-btn:hover { color: var(--title); }
        .lp-primary, .lp-secondary { border-radius: 16px; padding: 14px 22px; font-weight: 700; font-size: 15px; font-family: inherit; cursor: pointer; transition: transform .18s ease, box-shadow .18s ease; }
        .lp-primary { border: none; color: #fff; background: linear-gradient(135deg, var(--primary), #6366f1 58%, var(--accent) 150%); box-shadow: 0 18px 34px rgba(79,70,229,.34); }
        .lp-secondary { border: 1px solid rgba(148,163,184,.18); color: var(--title); background: rgba(255,255,255,.04); }
        .lp-primary:hover, .lp-secondary:hover { transform: translateY(-1px); }
        .lp-toggle { display: none; width: 44px; height: 44px; border-radius: 14px; border: 1px solid rgba(148,163,184,.18); background: rgba(255,255,255,.04); color: var(--title); cursor: pointer; }
        .lp-mobile { display: none; padding: 0 0 20px; gap: 12px; }
        .lp-mobile.open { display: grid; }
        .lp-mobile a, .lp-mobile button { width: 100%; }
        .lp-hero { padding: 56px 0 74px; }
        .lp-hero-grid { display: grid; grid-template-columns: minmax(0, 1.04fr) minmax(340px, .96fr); gap: 34px; align-items: center; }
        .lp-eyebrow { display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 999px; background: rgba(79,70,229,.16); border: 1px solid rgba(129,140,248,.24); color: #c7d2fe; font-size: 13px; font-weight: 700; margin-bottom: 22px; }
        .lp-eyebrow::before { content: ''; width: 8px; height: 8px; border-radius: 999px; background: var(--accent); box-shadow: 0 0 12px rgba(20,184,166,.6); }
        .lp-title { margin: 0 0 18px; font-family: 'Syne', sans-serif; font-size: clamp(48px, 8vw, 84px); line-height: .97; letter-spacing: -.08em; color: var(--title); }
        .lp-title span { background: linear-gradient(135deg, #93c5fd, #67e8f9 46%, #2dd4bf); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .lp-text { margin: 0 0 28px; max-width: 610px; color: #a8b6ca; font-size: 18px; line-height: 1.82; }
        .lp-hero-actions { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 28px; }
        .lp-proof { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
        .lp-proof-card, .lp-card, .lp-panel-card { border-radius: 24px; background: var(--panel); border: 1px solid var(--line); }
        .lp-proof-card { padding: 18px; }
        .lp-proof-value { font-size: 24px; font-weight: 800; color: var(--title); }
        .lp-proof-text { margin-top: 8px; color: var(--muted); line-height: 1.6; font-size: 14px; }
        .lp-preview { padding: 20px; background: linear-gradient(180deg, rgba(17,29,48,.96), rgba(9,16,28,.98)); box-shadow: 0 24px 70px rgba(2,8,23,.42); }
        .lp-preview-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .lp-preview-title { font-size: 14px; font-weight: 700; color: #c7d2fe; }
        .lp-pill { padding: 8px 12px; border-radius: 999px; background: rgba(20,184,166,.14); color: #99f6e4; font-size: 12px; font-weight: 800; }
        .lp-kpis { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .lp-kpi { padding: 18px; border-radius: 20px; background: rgba(255,255,255,.04); border: 1px solid rgba(148,163,184,.1); }
        .lp-kpi-label { color: var(--muted); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
        .lp-kpi-value { margin-top: 12px; color: var(--title); font-size: 34px; font-weight: 800; }
        .lp-kpi-note { margin-top: 8px; color: #7dd3fc; font-size: 14px; font-weight: 600; }
        .lp-chart { margin-top: 14px; padding: 18px; border-radius: 20px; background: rgba(255,255,255,.04); border: 1px solid rgba(148,163,184,.1); }
        .lp-chart-head { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
        .lp-chart-head strong { display: block; color: var(--title); font-size: 15px; }
        .lp-chart-head span { color: var(--muted); font-size: 12px; }
        .lp-bars { display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); align-items: end; gap: 10px; min-height: 140px; }
        .lp-bar-wrap { display: grid; justify-items: center; gap: 10px; }
        .lp-bar { width: 100%; border-radius: 999px 999px 14px 14px; background: linear-gradient(180deg, rgba(34,197,94,.95), rgba(79,70,229,.95)); }
        .lp-bar-label { color: var(--muted); font-size: 12px; }
        .lp-section { padding: 82px 0; }
        .lp-section-head { max-width: 640px; margin-bottom: 26px; }
        .lp-kicker { color: #7dd3fc; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; }
        .lp-heading { margin: 12px 0 14px; color: var(--title); font-family: 'Syne', sans-serif; font-size: clamp(34px, 5vw, 58px); line-height: 1.03; letter-spacing: -.06em; }
        .lp-body { margin: 0; color: #9fb0c6; line-height: 1.82; font-size: 16px; }
        .lp-grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 16px; }
        .lp-card { padding: 24px; }
        .lp-icon { width: 50px; height: 50px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; background: rgba(79,70,229,.16); margin-bottom: 16px; font-size: 22px; }
        .lp-card h3 { margin: 0 0 10px; color: var(--title); font-size: 18px; }
        .lp-card p { margin: 0; color: #9fb0c6; line-height: 1.75; font-size: 15px; }
        .lp-flow { background: linear-gradient(180deg, rgba(11,20,36,.62), rgba(7,17,31,0)); border-top: 1px solid rgba(148,163,184,.08); border-bottom: 1px solid rgba(148,163,184,.08); }
        .lp-step { padding: 24px; border-radius: 24px; background: var(--panel); border: 1px solid var(--line); }
        .lp-step-badge { width: 54px; height: 54px; border-radius: 18px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 16px; font-weight: 800; color: var(--title); background: linear-gradient(135deg, rgba(79,70,229,.92), rgba(20,184,166,.64)); }
        .lp-step h3 { margin: 0 0 10px; color: var(--title); font-size: 18px; }
        .lp-step p { margin: 0; color: #9fb0c6; line-height: 1.72; }
        .lp-pricing { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; }
        .lp-pricing-card { padding: 28px; border-radius: 26px; background: var(--panel); border: 1px solid var(--line); display: grid; gap: 16px; }
        .lp-pricing-card.featured { background: linear-gradient(180deg, rgba(79,70,229,.18), rgba(10,20,36,.88)); border-color: rgba(129,140,248,.34); box-shadow: 0 18px 50px rgba(79,70,229,.18); }
        .lp-badge { display: inline-flex; padding: 8px 12px; border-radius: 999px; background: rgba(20,184,166,.14); color: #99f6e4; font-size: 12px; font-weight: 800; }
        .lp-pricing-card h3 { margin: 0; color: var(--title); font-size: 22px; }
        .lp-price { color: var(--title); font-family: 'Syne', sans-serif; font-size: 42px; line-height: 1; letter-spacing: -.06em; }
        .lp-pricing-card p { margin: 0; color: #9fb0c6; line-height: 1.75; }
        .lp-pricing-card ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; color: #dbe6f3; font-size: 15px; }
        .lp-pricing-card li::before { content: '• '; color: #2dd4bf; font-weight: 800; }
        .lp-cta { padding: 92px 0 108px; }
        .lp-cta-card { text-align: center; padding: 44px; border-radius: 32px; background: linear-gradient(135deg, rgba(79,70,229,.22), rgba(15,23,42,.92) 60%, rgba(20,184,166,.14)); border: 1px solid rgba(129,140,248,.24); box-shadow: 0 24px 70px rgba(2,8,23,.42); }
        .lp-cta-card h2 { margin: 12px 0 14px; color: var(--title); font-family: 'Syne', sans-serif; font-size: clamp(34px, 5vw, 56px); line-height: 1.04; letter-spacing: -.06em; }
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
          <div className="lp-container lp-hero-grid">
            <div>
              <div className="lp-eyebrow">SaaS işletme yönetim paneli</div>
              <h1 className="lp-title">
                İşletmenizi <span>tek merkezden</span> yönetin.
              </h1>
              <p className="lp-text">
                Corepanel; sipariş, satış, rapor ve tahsilat akışlarını tek bir düzende toplar.
                Hem işletme kullanımında hem de MAIN_ADMIN tarafında temiz bir kontrol hissi verir.
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
                  <div className="lp-proof-text">İşletme kayıtlarınızı onay ve yetki mantığıyla kontrol edin.</div>
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
                Operasyon ekibini yormadan veri düzenini kurmak için gereken temel alanları güçlü ama okunaklı bir yapıda toplar.
              </p>
            </div>

            <div className="lp-grid-4">
              {features.map(([title, text], index) => (
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
                Onay, kurulum ve kullanım adımları birbirine bağlı ilerler. Özellikle yeni işletme hesabında karışık hissettirmez.
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
                Asıl odağımız işletme yönetimini düzenli kurmak. Paket kısmı da bunu anlaşılır ve uygulanabilir şekilde destekliyor.
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
                İşletme kaydınızı oluşturun, onay süreci tamamlandığında panelinizi açın ve siparişten tahsilata kadar tüm akışı tek merkezde yönetin.
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
