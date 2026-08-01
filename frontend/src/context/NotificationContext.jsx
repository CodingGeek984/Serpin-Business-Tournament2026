import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=50');
      // res can be either directly the array, or { data: { items: [] } }, or { items: [] }
      const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []) || [];
      setNotifications(items);
      setUnreadCount(items.filter(n => !n.is_read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    
    fetchNotifications();
    const token = localStorage.getItem('token');
    
    // Connect to SSE
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const eventSource = new EventSource(`${baseURL}/notifications/stream?token=${token}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ping') return;
      
      // New notification arrived
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show toast
      if (data.type === 'error') {
        toast.error(data.title || data.message);
      } else if (data.type === 'success') {
        toast.success(data.title || data.message);
      } else {
        toast(data.title || data.message, { icon: '🔔' });
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [isAuthenticated]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => {
        const item = prev.find(n => n.id === id);
        if (item && !item.is_read) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n.id !== id);
      });
    } catch (error) {
      console.error(error);
    }
  };
  
  const deleteAll = async () => {
      try {
          await api.delete('/notifications/all');
          setNotifications([]);
          setUnreadCount(0);
      } catch (error) {
          console.error(error);
      }
  }

  return (
    <NotificationContext.Provider value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification,
        deleteAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
