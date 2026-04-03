import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const TYPE_ICONS: Record<string, string> = {
  info: '🔔',
  warning: '⚠️',
  success: '✅',
  error: '❌',
};

const TYPE_COLORS: Record<string, string> = {
  info: '#6366f1',
  warning: '#f59e0b',
  success: '#059669',
  error: '#ef4444',
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {}
    finally { setLoading(false); }
  };

  const markRead = async (id: number) => {
    await api.post(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const markAllRead = async () => {
    await api.post('/notifications/read-all');
    fetchNotifications();
  };

  const deleteNotification = async (id: number) => {
    await api.delete(`/notifications/${id}`);
    fetchNotifications();
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Şimdi';
    if (mins < 60) return `${mins}dk önce`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}s önce`;
    return `${Math.floor(hours / 24)}g önce`;
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative',
          width: 36,
          height: 36,
          border: 'none',
          background: open ? '#eef2ff' : 'transparent',
          borderRadius: 10,
          cursor: 'pointer',
          fontSize: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 16,
            height: 16,
            background: '#ef4444',
            color: '#fff',
            borderRadius: '50%',
            fontSize: 10,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 44,
          right: 0,
          width: 360,
          maxHeight: 480,
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              Bildirimler {unreadCount > 0 && <span style={{ color: '#ef4444' }}>({unreadCount})</span>}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6366f1',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Tümünü oku
              </button>
            )}
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Yükleniyor...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                Bildirim yok
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => { markRead(n.id); if (n.link) window.location.href = n.link; }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f8fafc',
                    cursor: 'pointer',
                    background: n.read ? '#fff' : '#f8fafc',
                    transition: 'background 0.15s',
                    display: 'flex',
                    gap: 10,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? '#fff' : '#f8fafc')}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>
                    {TYPE_ICONS[n.type] || '🔔'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: '#1e293b' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, lineHeight: 1.4 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                      {timeAgo(n.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: 14,
                      padding: '0 4px',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
