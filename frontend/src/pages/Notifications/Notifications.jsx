import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Bell, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Notifications = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await api('/notifications', { token });
        setNotifications(data || []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token]);

  const markAsRead = async (id) => {
    try {
      await api(`/notifications/${id}/read`, { method: 'PATCH', token });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api('/notifications/read-all', { method: 'PATCH', token });
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Загрузка уведомлений...</div>;
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Уведомления</h1>
          <p className="text-sm text-gray-500 mt-1">Входящие события и оповещения</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-sm text-[var(--color-brand-blue)] hover:underline font-medium"
          >
            Прочитать все
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">У вас нет новых уведомлений</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <motion.div 
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                notification.is_read 
                  ? 'bg-white border-gray-100' 
                  : 'bg-blue-50/50 border-blue-100 shadow-sm'
              }`}
            >
              <div className="mt-1">
                {notification.is_read ? (
                  <CheckCircle2 className="w-5 h-5 text-gray-400" />
                ) : (
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm sm:text-base font-medium ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {new Date(notification.created_at).toLocaleString('ru-RU', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
