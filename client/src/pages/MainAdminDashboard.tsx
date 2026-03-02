import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function MainAdminDashboard() {
  const [list, setList] = useState<any[]>([]);

  const fetch = async () => {
    try {
      const r = await api.get('/businesses');
      setList(r.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetch(); }, []);

  const approve = async (id: string) => {
    try {
      await api.put(`/businesses/${id}/approve`);
      fetch();
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <h2>Ana Admin — İşletmeler</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {list.map(b => (
          <div key={b.id} style={{ padding: 12, background: '#fff', borderRadius: 8 }}>
            <div style={{ fontWeight: 'bold' }}>{b.name} — {b.sector}</div>
            <div>Onay: {b.isApproved ? 'Evet' : 'Hayır'}</div>
            <div style={{ marginTop: 8 }}>
              {!b.isApproved && <button onClick={() => approve(b.id)} style={{ padding: 6 }}>Onayla</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
