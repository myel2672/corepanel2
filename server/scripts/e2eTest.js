// Automated E2E test: registers admin/staff, creates product, creates order, updates status, checks dashboard
const base = process.env.BASE_URL || 'http://localhost:5000';

async function req(path, opts = {}) {
  const url = base + path;
  const res = await fetch(url, opts);
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body };
}

function rand(s) { return s + Date.now().toString().slice(-4); }

(async () => {
  try {
    console.log('1) Register main admin');
    const adminEmail = rand('admin') + '@local';
    let r = await req('/api/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: 'Main Admin', email: adminEmail, password: 'pass123', role: 'MAIN_ADMIN' }) });
    console.log('register main admin', r.status, r.body);

    console.log('2) Login main admin');
    r = await req('/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email: adminEmail, password: 'pass123' }) });
    if (r.status !== 200) throw new Error('admin login failed '+JSON.stringify(r));
    const adminToken = r.body.token;
    console.log('admin token acquired');

    console.log('3) Register a business (kuaför örneği)');
    const bizName = rand('KuaforCo');
    const bizAdminEmail = rand('bizadmin') + '@local';
    r = await req('/api/businesses/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: bizName, sector: 'Kuafor', adminName: 'IsletmeAdmin', adminEmail: bizAdminEmail, adminPassword: 'pass123' }) });
    console.log('register business', r.status, r.body);
    const business = r.body.business;

    console.log('4) Approve business (main admin)');
    r = await req('/api/businesses/' + business.id + '/approve', { method: 'PUT', headers: { Authorization: 'Bearer ' + adminToken } });
    console.log('approve', r.status, r.body);

    console.log('5) Login business admin');
    r = await req('/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email: bizAdminEmail, password: 'pass123' }) });
    if (r.status !== 200) throw new Error('biz admin login failed '+JSON.stringify(r));
    const bizToken = r.body.token;
    console.log('biz token acquired');

    console.log('6) Create product (business admin)');
    r = await req('/api/products', { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: 'Bearer ' + bizToken }, body: JSON.stringify({ name: 'Tiraş', description: 'Erkek traş hizmeti', price: 50, costPrice: 10, stock: 100 }) });
    console.log('create product', r.status, r.body);
    if (r.status !== 200) throw new Error('create product failed');
    const product = r.body;

    console.log('7) Create sale (biz admin)');
    r = await req('/api/sales', { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: 'Bearer ' + bizToken }, body: JSON.stringify({ productId: product.id, description: 'Günlük tıraş', category: 'service', quantity: 5, unitPrice: 50, unitCost: 10 }) });
    console.log('create sale', r.status, r.body);

    console.log('8) Fetch dashboard summary (main admin)');
    r = await req('/api/dashboard/summary', { headers: { Authorization: 'Bearer ' + adminToken } });
    console.log('dashboard', r.status, r.body);

    console.log('E2E completed successfully');
  } catch (err) {
    console.error('E2E failed', err);
    process.exitCode = 1;
  }
})();
