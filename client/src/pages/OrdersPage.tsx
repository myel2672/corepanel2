import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Order, Product } from '../types';
import { useAuthStore } from '../store/authStore';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  // Yeni sipariş formu
  const [customer, setCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');

  const fetchOrders = async () => {
    if (user?.role !== 'ADMIN') {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch {
      console.error('Siparisler yuklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch {
      console.error('Urunler yuklenemedi');
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const handleAddOrder = async () => {
    if (!customer || !selectedProduct || !quantity) return;
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    try {
      await api.post('/orders', {
        customer,
        items: [{
          productId: product.id,
          quantity: parseInt(quantity),
          price: product.price,
        }],
      });
      setCustomer('');
      setSelectedProduct('');
      setQuantity('');
      fetchOrders();
    } catch {
      console.error('Siparis eklenemedi');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch {
      console.error('Durum guncellenemedi');
    }
  };

  const statusColor: Record<string, string> = {
    PENDING: '#ed8936',
    PROCESSING: '#3182ce',
    SHIPPED: '#805ad5',
    DELIVERED: '#2f855a',
    COMPLETED: '#38a169',
    CANCELLED: '#e53e3e',
  };

  if (loading) return <div>Yukleniyor...</div>;

  return (
    <div>
      <h2>Siparisler</h2>
      {user?.role !== 'ADMIN' && (
        <div style={{ marginBottom: 12, color: '#666' }}>Sadece sipariş oluşturabilirsiniz.</div>
      )}
      {/* Yeni Sipariş Formu */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          placeholder="Musteri adi"
          value={customer}
          onChange={e => setCustomer(e.target.value)}
          style={{ padding: 8 }}
        />
        <select
          value={selectedProduct}
          onChange={e => setSelectedProduct(e.target.value)}
          style={{ padding: 8 }}
        >
          <option value="">Urun sec</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} - {p.price} TL (Stok: {p.stock})
            </option>
          ))}
        </select>
        <input
          placeholder="Adet"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          style={{ padding: 8, width: 80 }}
          type="number"
        />
        <button
          onClick={handleAddOrder}
          style={{ padding: '8px 16px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          Siparis Olustur
        </button>
      </div>

      {/* Sipariş Listesi (sadece admin) */}
      {user?.role === 'ADMIN' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th style={{ padding: 12, textAlign: 'left' }}>Musteri</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Urunler</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Toplam</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Tarih</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Durum</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => {
            const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            return (
              <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 12 }}>{order.customer}</td>
                <td style={{ padding: 12 }}>
                  {order.items.map(item => (
                    <div key={item.id}>{item.product.name} x{item.quantity}</div>
                  ))}
                </td>
                <td style={{ padding: 12 }}>{total.toFixed(2)} TL</td>
                <td style={{ padding: 12 }}>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</td>
                <td style={{ padding: 12 }}>
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                    style={{
                      padding: '4px 8px',
                      background: statusColor[order.status] || '#gray',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="PENDING">Bekliyor</option>
                    <option value="PROCESSING">Islemde</option>
                    <option value="SHIPPED">Kargolandı</option>
                    <option value="DELIVERED">Teslim Edildi</option>
                    <option value="COMPLETED">Tamamlandi</option>
                    <option value="CANCELLED">Iptal</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
        </table>
      )}
    </div>
  );
}