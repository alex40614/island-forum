import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationAPI } from '@/api';
import { wsService } from '@/services/websocket';
import { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    // 監聽實時通知
    const unsubscribe = wsService.onMessage((notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationAPI.getAll(0, 50);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'reply':
        return '↩️';
      case 'follow':
        return '👤';
      case 'system':
        return '📢';
      default:
        return '🔔';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩 */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* 面板 */}
      <div className="fixed top-16 right-4 w-96 max-h-[600px] bg-[#0F172A] border border-slate-700 rounded-lg shadow-2xl z-50 flex flex-col">
        {/* 標題 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">通知</h3>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.is_read) && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                全部已讀
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 通知列表 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">載入中...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">暫無通知</div>
          ) : (
            <div className="divide-y divide-slate-700">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-slate-800/50 transition-colors ${
                    !notification.is_read ? 'bg-slate-800/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={notification.link || '#'}
                        onClick={() => {
                          handleMarkAsRead(notification.id);
                          onClose();
                        }}
                        className="block"
                      >
                        <p className="text-sm text-slate-200 mb-1">
                          {notification.content}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </p>
                      </Link>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-cyan-400 hover:text-cyan-300 text-xs"
                      >
                        標記已讀
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-slate-500 hover:text-red-400 text-xs ml-2"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
