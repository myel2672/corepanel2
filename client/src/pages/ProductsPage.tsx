import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Product } from '../types';
import { useAuthStore } from '../store/authStore';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('');
  const user = useAuthStore((s) => s.user);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCostPrice, setEditCostPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch {
      console.error('Urunler yuklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleAdd = async () => {
    if (!name || !price || !stock) return;
    try {
      await api.post('/products', {
        name,
        price: parseFloat(price),
        costPrice: parseFloat(costPrice || '0'),
        stock: parseInt(stock),
      });
      setName(''); setPrice(''); setStock('');
      fetchProducts();
    } catch {
      console.error('Urun eklenemedi');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch {
      console.error('Urun silinemedi');
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditCostPrice(String(p.costPrice ?? ''));
    setEditStock(String(p.stock));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    try {
      await api.put(`/products/${id}`, {
        name: editName,
        price: parseFloat(editPrice),
        costPrice: parseFloat(editCostPrice || '0'),
        stock: parseInt(editStock),
      });
      setEditingId(null);
      fetchProducts();
    } catch {
      console.error('Urun guncellenemedi');
    }
  };

  if (loading) return <div>Yukleniyor...</div>;

  return (
    <div>
      <h2>Urunler</h2>

      {user?.role === 'ADMIN' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <input placeholder="Urun adi" value={name} onChange={e => setName(e.target.value)} style={{ padding: 8 }} />
          <input placeholder="Fiyat" value={price} onChange={e => setPrice(e.target.value)} style={{ padding: 8, width: 100 }} />
          <input placeholder="Maliyet (cost)" value={costPrice} onChange={e => setCostPrice(e.target.value)} style={{ padding: 8, width: 120 }} />
          <input placeholder="Stok" value={stock} onChange={e => setStock(e.target.value)} style={{ padding: 8, width: 80 }} />
          <button onClick={handleAdd} style={{ padding: '8px 16px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Ekle
          </button>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th style={{ padding: 12, textAlign: 'left' }}>Ad</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Fiyat</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Maliyet</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Stok</th>
            <th style={{ padding: 12 }}></th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 12 }}>
                {editingId === p.id ? (
                  <input value={editName} onChange={e => setEditName(e.target.value)} />
                ) : (
                  p.name
                )}
              </td>
              <td style={{ padding: 12 }}>
                {editingId === p.id ? (
                  <input value={editPrice} onChange={e => setEditPrice(e.target.value)} style={{ width: 80 }} />
                ) : (
                  `${p.price} TL`
                )}
              </td>
              <td style={{ padding: 12 }}>
                {editingId === p.id ? (
                  <input value={editCostPrice} onChange={e => setEditCostPrice(e.target.value)} style={{ width: 100 }} />
                ) : (
                  p.costPrice ? `${p.costPrice} TL` : '-'
                )}
              </td>
              <td style={{ padding: 12 }}>
                {editingId === p.id ? (
                  <input value={editStock} onChange={e => setEditStock(e.target.value)} style={{ width: 60 }} />
                ) : (
                  p.stock
                )}
              </td>
              <td style={{ padding: 12 }}>
                {user?.role === 'ADMIN' && (
                  editingId === p.id ? (
                    <>
                      <button onClick={() => saveEdit(p.id)} style={{ marginRight: 8, background: '#38a169', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Kaydet</button>
                      <button onClick={cancelEdit} style={{ background: '#a0aec0', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Iptal</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(p)} style={{ marginRight: 8, background: '#3182ce', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Düzenle</button>
                      <button onClick={() => handleDelete(p.id)} style={{ background: '#e53e3e', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Sil</button>
                    </>
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}