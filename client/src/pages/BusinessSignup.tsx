import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function BusinessSignup() {
  const [name, setName] = useState('');
  const [sector, setSector] = useState('Kuafor');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/businesses/register', { name, sector, adminName, adminEmail, adminPassword });
      navigate('/login');
    } catch (err) {
      setError('Kayit basarisiz');
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: 24 }}>
      <h2>İşletme Kayıt — Corepanel</h2>
      <form onSubmit={handle}>
        <input placeholder="İşletme adı" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        <select value={sector} onChange={(e) => setSector(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }}>
          <option>Kuafor</option>
          <option>Kasap</option>
          <option>Bakkal</option>
          <option>Galerici</option>
          <option>Diğer</option>
        </select>
        <input placeholder="İşletme admin adı" value={adminName} onChange={(e) => setAdminName(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        <input type="email" placeholder="Admin email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        <input type="password" placeholder="Admin şifre" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit" style={{ padding: 10, marginTop: 8 }}>Kayıt Ol</button>
      </form>
    </div>
  );
}
