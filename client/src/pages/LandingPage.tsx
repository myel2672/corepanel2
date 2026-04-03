import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        html, body { background: #0a0a0f !important; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --indigo: #6366f1;
          --indigo-dark: #4338ca;
          --indigo-light: #818cf8;
          --cyan: #06b6d4;
          --dark: #0a0a0f;
          --dark2: #12121a;
          --border: rgba(255,255,255,0.07);
          --text: #e2e8f0;
          --muted: #64748b;
        }

        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #0a0a0f; color: var(--text); overflow-x: hidden; }

        /* NAVBAR */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 60px;
          background: rgba(10,10,15,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo {
          font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, var(--indigo-light) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          letter-spacing: -0.5px;
        }
        .nav-logo span {
          display: inline-block; width: 6px; height: 6px;
          background: var(--cyan); border-radius: 50%;
          margin-left: 2px; vertical-align: middle; margin-bottom: 4px;
        }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-link { font-size: 14px; font-weight: 500; color: var(--muted); text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: #fff; }
        .nav-cta {
          padding: 9px 22px; background: var(--indigo); border: none; border-radius: 10px;
          color: #fff; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s; box-shadow: 0 0 20px rgba(99,102,241,0.3);
        }
        .nav-cta:hover { background: var(--indigo-dark); transform: translateY(-1px); }

        /* HAMBURGER */
        .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
        .hamburger-line { width: 24px; height: 2px; background: #fff; border-radius: 2px; transition: all 0.3s; }
        .hamburger.open .hamburger-line:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open .hamburger-line:nth-child(2) { opacity: 0; }
        .hamburger.open .hamburger-line:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .mobile-menu { display: none; position: absolute; top: 100%; left: 0; right: 0; background: rgba(10,10,15,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); padding: 16px 20px; flex-direction: column; gap: 12px; animation: slideDown 0.25s ease; }
        .mobile-menu.open { display: flex; }
        .mobile-menu .nav-link { font-size: 16px; padding: 8px 0; display: block; }
        .mobile-menu .nav-cta { width: 100%; text-align: center; padding: 12px; border-radius: 12px; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

        /* HERO */
        .hero {
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center;
          padding: 120px 24px 80px; position: relative; overflow: hidden;
          background: #0a0a0f;
        }
        .hero-bg {
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.25) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(6,182,212,0.1) 0%, transparent 60%);
        }
        .hero-grid {
          position: absolute; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 16px; background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.3); border-radius: 100px;
          font-size: 12px; font-weight: 600; color: var(--indigo-light);
          letter-spacing: 0.5px; margin-bottom: 28px;
          position: relative; z-index: 1;
          animation: fadeUp 0.6s ease both;
        }
        .hero-badge-dot { width: 6px; height: 6px; background: var(--cyan); border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(42px, 7vw, 80px); font-weight: 800; line-height: 1.05;
          letter-spacing: -2px; color: #fff; margin-bottom: 24px;
          position: relative; z-index: 1;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .hero-title em {
          font-style: normal;
          background: linear-gradient(135deg, var(--indigo-light), var(--cyan));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-desc {
          font-size: 18px; font-weight: 400; color: #94a3b8;
          max-width: 560px; line-height: 1.7; margin-bottom: 44px;
          position: relative; z-index: 1;
          animation: fadeUp 0.6s 0.2s ease both;
        }
        .hero-btns {
          display: flex; gap: 14px; justify-content: center;
          position: relative; z-index: 1;
          animation: fadeUp 0.6s 0.3s ease both;
        }
        .btn-primary {
          padding: 14px 32px; background: var(--indigo); border: none; border-radius: 12px;
          color: #fff; font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 24px rgba(99,102,241,0.4);
        }
        .btn-primary:hover { background: var(--indigo-dark); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(99,102,241,0.5); }
        .btn-secondary {
          padding: 14px 32px; background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.25); border-radius: 12px;
          color: #e2e8f0; font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-secondary:hover { border-color: rgba(255,255,255,0.4); color: #fff; background: rgba(255,255,255,0.1); }
        .hero-stats {
          display: flex; gap: 48px; justify-content: center; margin-top: 72px;
          position: relative; z-index: 1;
          animation: fadeUp 0.6s 0.4s ease both;
        }
        .hero-stat-val { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -1px; }
        .hero-stat-val span { color: var(--indigo-light); }
        .hero-stat-lbl { font-size: 13px; color: var(--muted); margin-top: 4px; font-weight: 500; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* SECTION */
        .section { padding: 100px 24px; background: #0a0a0f; }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-tag { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--indigo-light); margin-bottom: 16px; }
        .section-title { font-family: 'Syne', sans-serif; font-size: clamp(28px, 4vw, 44px); font-weight: 800; color: #fff; letter-spacing: -1px; line-height: 1.1; margin-bottom: 16px; }
        .section-desc { font-size: 16px; color: #64748b; line-height: 1.7; max-width: 560px; }

        /* FEATURES */
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 56px; }
        .feature-card {
          background: var(--dark2); border: 1px solid var(--border);
          border-radius: 20px; padding: 32px; transition: all 0.3s; position: relative; overflow: hidden;
        }
        .feature-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .feature-card:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .feature-card:hover::before { opacity: 1; }
        .feature-icon { width: 48px; height: 48px; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 20px; }
        .feature-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .feature-desc { font-size: 14px; color: #64748b; line-height: 1.65; }

        /* HOW */
        .how-section { background: var(--dark2) !important; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-top: 56px; position: relative; }
        .steps::before { content: ''; position: absolute; top: 28px; left: 12.5%; right: 12.5%; height: 1px; background: linear-gradient(90deg, transparent, var(--indigo), var(--cyan), var(--indigo), transparent); opacity: 0.3; }
        .step { text-align: center; padding: 0 20px; }
        .step-num { width: 56px; height: 56px; background: linear-gradient(135deg, var(--indigo), var(--indigo-dark)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: #fff; margin: 0 auto 20px; box-shadow: 0 0 24px rgba(99,102,241,0.4); position: relative; z-index: 1; }
        .step-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .step-desc { font-size: 13px; color: #64748b; line-height: 1.6; }

        /* PRICING */
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 56px; }
        .pricing-card { background: var(--dark2); border: 1px solid var(--border); border-radius: 24px; padding: 36px; position: relative; transition: all 0.3s; }
        .pricing-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .pricing-card.featured { background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.05)); border-color: rgba(99,102,241,0.4); box-shadow: 0 0 40px rgba(99,102,241,0.15); }
        .pricing-badge { display: inline-block; padding: 4px 12px; background: var(--indigo); border-radius: 100px; font-size: 11px; font-weight: 700; color: #fff; margin-bottom: 20px; }
        .pricing-name { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 8px; }
        .pricing-price { font-family: 'Syne', sans-serif; font-size: 44px; font-weight: 800; color: #fff; letter-spacing: -2px; margin-bottom: 4px; }
        .pricing-price span { font-size: 18px; font-weight: 500; color: var(--muted); letter-spacing: 0; }
        .pricing-desc { font-size: 13px; color: var(--muted); margin-bottom: 28px; }
        .pricing-divider { height: 1px; background: var(--border); margin-bottom: 24px; }
        .pricing-features { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        .pricing-feature { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #94a3b8; }
        .pricing-check { color: var(--cyan); font-size: 16px; }
        .pricing-btn { width: 100%; padding: 13px; border-radius: 12px; border: none; font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
        .pricing-btn-outline { background: transparent; border: 1px solid var(--border) !important; color: #94a3b8; }
        .pricing-btn-outline:hover { border-color: rgba(255,255,255,0.2) !important; color: #fff; background: rgba(255,255,255,0.04); }
        .pricing-btn-filled { background: var(--indigo); color: #fff; box-shadow: 0 4px 20px rgba(99,102,241,0.4); }
        .pricing-btn-filled:hover { background: var(--indigo-dark); transform: translateY(-1px); }

        /* CTA */
        .cta-section { padding: 100px 24px; text-align: center; position: relative; overflow: hidden; background: #0a0a0f; }
        .cta-bg { position: absolute; inset: 0; z-index: 0; background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 70%); }
        .cta-title { font-family: 'Syne', sans-serif; font-size: clamp(32px, 5vw, 56px); font-weight: 800; color: #fff; letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 20px; position: relative; z-index: 1; }
        .cta-desc { font-size: 17px; color: #64748b; margin-bottom: 40px; position: relative; z-index: 1; }
        .cta-btns { display: flex; gap: 14px; justify-content: center; position: relative; z-index: 1; }

        /* FOOTER */
        .footer { border-top: 1px solid var(--border); padding: 32px 60px; display: flex; align-items: center; justify-content: space-between; background: #0a0a0f; }
        .footer-logo { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: #475569; }
        .footer-copy { font-size: 13px; color: #334155; }

        @media (max-width: 768px) {
          .nav { padding: 16px 20px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .hero-stats { gap: 24px; flex-wrap: wrap; }
          .features-grid { grid-template-columns: 1fr; }
          .steps { grid-template-columns: 1fr 1fr; gap: 32px; }
          .steps::before { display: none; }
          .pricing-grid { grid-template-columns: 1fr; }
          .footer { flex-direction: column; gap: 12px; text-align: center; padding: 24px; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="nav" style={{ position: 'fixed' }}>
        <div className="nav-logo">Corepanel<span /></div>
        <div className="nav-links">
          <a href="#features" className="nav-link">Özellikler</a>
          <a href="#how" className="nav-link">Nasıl Çalışır?</a>
          <a href="#pricing" className="nav-link">Fiyatlar</a>
          <button className="nav-cta" onClick={() => navigate('/login')}>Giriş Yap</button>
        </div>
        <button className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <a href="#features" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Özellikler</a>
          <a href="#how" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Nasıl Çalışır?</a>
          <a href="#pricing" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Fiyatlar</a>
          <button className="nav-cta" onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>Giriş Yap</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          İşletme Yönetim Sistemi
        </div>
        <h1 className="hero-title">
          İşletmenizi<br />
          <em>akıllıca</em> yönetin.
        </h1>
        <p className="hero-desc">
          Satışlarınızı takip edin, stoklarınızı yönetin, müşterilerinizi organize edin — hepsi tek, sade bir panelden.
        </p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => navigate('/register')}>Ücretsiz Başla →</button>
          <button className="btn-secondary" onClick={() => navigate('/login')}>🎯 Demo Dene</button>
        </div>
        <div className="hero-stats">
          <div>
            <div className="hero-stat-val">100<span>%</span></div>
            <div className="hero-stat-lbl">Bulut Tabanlı</div>
          </div>
          <div>
            <div className="hero-stat-val">7<span>/24</span></div>
            <div className="hero-stat-lbl">Erişim</div>
          </div>
          <div>
            <div className="hero-stat-val">0<span>₺</span></div>
            <div className="hero-stat-lbl">Başlangıç Ücreti</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="section-inner">
          <div className="section-tag">Özellikler</div>
          <h2 className="section-title">İhtiyacınız olan<br />her şey burada.</h2>
          <p className="section-desc">Küçük ve orta ölçekli işletmeler için tasarlanmış, güçlü ama sade araçlar.</p>
          <div className="features-grid">
            {[
              { icon: '📊', title: 'Genel Bakış Paneli', desc: 'Günlük, haftalık ve aylık satış, sipariş ve ciro verilerinizi tek bakışta görün.' },
              { icon: '📦', title: 'Ürün & Stok Yönetimi', desc: 'Ürünlerinizi ekleyin, stok takibi yapın, düşük stok uyarılarını anında alın.' },
              { icon: '🛒', title: 'Sipariş Takibi', desc: 'Siparişleri oluşturun, durumlarını güncelleyin ve otomatik fatura oluşturun.' },
              { icon: '💰', title: 'Satış Kayıtları', desc: 'Her satışı kaydedin, kâr marjınızı hesaplayın ve gelirlerinizi raporlayın.' },
              { icon: '👥', title: 'Müşteri Yönetimi', desc: 'Müşteri veritabanınızı oluşturun, sipariş geçmişini takip edin.' },
              { icon: '📈', title: 'Raporlar', desc: 'Kâr/zarar, ciro ve satış raporlarını detaylı grafiklerle analiz edin.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section how-section" id="how">
        <div className="section-inner">
          <div className="section-tag">Nasıl Çalışır?</div>
          <h2 className="section-title">Dakikalar içinde<br />hazır olun.</h2>
          <div className="steps">
            {[
              { n: '1', title: 'Kayıt Olun', desc: 'İşletme adınız ve sektörünüzle ücretsiz hesap açın.' },
              { n: '2', title: 'Onay Alın', desc: 'Hesabınız kısa sürede onaylanır, panele erişim sağlarsınız.' },
              { n: '3', title: 'Ürün Ekleyin', desc: 'Ürünlerinizi ve başlangıç stoklarınızı sisteme girin.' },
              { n: '4', title: 'Yönetmeye Başlayın', desc: 'Satış, sipariş ve müşteri yönetimini tek panelden yapın.' },
            ].map((s, i) => (
              <div key={i} className="step">
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="pricing">
        <div className="section-inner">
          <div className="section-tag">Fiyatlandırma</div>
          <h2 className="section-title">Şeffaf fiyatlar,<br />sürpriz yok.</h2>
          <p className="section-desc">İşletmenizin büyüklüğüne göre size uygun planı seçin.</p>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-name">Başlangıç</div>
              <div className="pricing-price">Ücretsiz</div>
              <div className="pricing-desc">Küçük işletmeler için</div>
              <div className="pricing-divider" />
              <ul className="pricing-features">
                {['1 kullanıcı', '50 ürün', '100 sipariş/ay', 'Temel raporlar', 'E-posta desteği'].map((f, i) => (
                  <li key={i} className="pricing-feature"><span className="pricing-check">✓</span>{f}</li>
                ))}
              </ul>
              <button className="pricing-btn pricing-btn-outline" onClick={() => navigate('/register')}>Ücretsiz Başla</button>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-badge">⭐ En Popüler</div>
              <div className="pricing-name">Pro</div>
              <div className="pricing-price">₺299<span>/ay</span></div>
              <div className="pricing-desc">Büyüyen işletmeler için</div>
              <div className="pricing-divider" />
              <ul className="pricing-features">
                {['5 kullanıcı', 'Sınırsız ürün', 'Sınırsız sipariş', 'Gelişmiş raporlar', 'Personel yönetimi', 'Öncelikli destek'].map((f, i) => (
                  <li key={i} className="pricing-feature"><span className="pricing-check">✓</span>{f}</li>
                ))}
              </ul>
              <button className="pricing-btn pricing-btn-filled" onClick={() => navigate('/register')}>Hemen Başla →</button>
            </div>
            <div className="pricing-card">
              <div className="pricing-name">Kurumsal</div>
              <div className="pricing-price">Özel</div>
              <div className="pricing-desc">Büyük işletmeler için</div>
              <div className="pricing-divider" />
              <ul className="pricing-features">
                {['Sınırsız kullanıcı', 'Sınırsız her şey', 'Özel entegrasyonlar', 'API erişimi', '7/24 destek', 'Özel eğitim'].map((f, i) => (
                  <li key={i} className="pricing-feature"><span className="pricing-check">✓</span>{f}</li>
                ))}
              </ul>
              <button className="pricing-btn pricing-btn-outline" onClick={() => navigate('/login')}>Bize Ulaşın</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-bg" />
        <h2 className="cta-title">Hemen başlamaya<br />hazır mısınız?</h2>
        <p className="cta-desc">Ücretsiz hesap açın veya demo ile sistemi tanıyın.</p>
        <div className="cta-btns">
          <button className="btn-primary" onClick={() => navigate('/register')}>Ücretsiz Kayıt Ol →</button>
          <button className="btn-secondary" onClick={() => navigate('/login')}>🎯 Demo Hesabıyla Dene</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">Corepanel</div>
        <div className="footer-copy">© 2026 Corepanel · Tüm hakları saklıdır</div>
      </footer>
    </div>
  );
}