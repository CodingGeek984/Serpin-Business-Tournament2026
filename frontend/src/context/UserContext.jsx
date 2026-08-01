import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { PROMO_TEMPLATES } from '../constants/mockData';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotification();
  const [userProfile, setUserProfile] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [promoTemplates, setPromoTemplates] = useState(PROMO_TEMPLATES);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      // 1. Fetch User / Business Profile
      const businessRes = await api.get('/business/profile').catch(() => ({ data: null }));
      const businessPayload = businessRes?.data?.data || businessRes?.data;
      if (businessPayload) setUserProfile(businessPayload);

      // 2. Fetch Promotions
      const promosRes = await api.get('/promotions').catch(() => null);
      const promosPayload = promosRes?.data?.data || promosRes?.data || promosRes;
      setPromotions(Array.isArray(promosPayload) ? promosPayload : []);

      // 3. Fetch Customers
      const customersRes = await api.get('/customers').catch(() => null);
      const customersPayload = customersRes?.data?.data || customersRes?.data || customersRes;
      setCustomers(Array.isArray(customersPayload) ? customersPayload : []);

      // 4. Fetch Analytics Summary
      const [statsRes, templatesRes] = await Promise.all([
        api.get('/analytics/summary').catch(() => null),
        api.get('/promotion-templates').catch(() => null),
      ]);
      const analyticsPayload = statsRes?.data?.data || statsRes?.data;
      if (analyticsPayload) {
        setStats(analyticsPayload.summary || {});
        setRevenueData(analyticsPayload.chartData || []);
      }
      const templatesPayload = templatesRes?.data?.data || templatesRes?.data;
      if (Array.isArray(templatesPayload)) setPromoTemplates(templatesPayload);
    } catch (error) {
      console.error("Failed to load initial data", error);
      addNotification("Не удалось загрузить данные дашборда", "error");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, addNotification]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Methods
  const addPromotion = async (promoData) => {
    try {
      const res = await api.post('/promotions', promoData);
      const newPromo = res.data?.data || res.data || res;
      setPromotions((current) => [newPromo, ...current]);
      addNotification("Акция успешно создана!", "success");
      return { success: true, data: newPromo };
    } catch (error) {
      console.error("Failed to add promotion", error);
      addNotification(error.message || "Ошибка при создании акции", "error");
      throw error;
    }
  };

  const updatePromotionStatus = async (id, status) => {
    try {
      await api.put(`/promotions/${id}`, { status });
      setPromotions((current) => current.map(p => p.id === id ? { ...p, status, is_active: status === 'active' } : p));
      addNotification(`Статус акции обновлен на ${status === 'active' ? 'Активна' : 'Пауза'}`, "success");
    } catch (error) {
      console.error("Failed to update status", error);
      addNotification("Ошибка при обновлении статуса", "error");
      throw error;
    }
  };

  const deletePromotion = async (id) => {
    try {
      await api.delete(`/promotions/${id}`);
      setPromotions((current) => current.filter(p => p.id !== id));
      addNotification("Акция удалена", "info");
    } catch (error) {
      console.error("Failed to delete promotion", error);
      addNotification("Ошибка при удалении акции", "error");
      throw error;
    }
  };

  const toggleIntegration = async (key) => {
    setUserProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        integrations: {
          ...(prev.integrations || {}),
          [key]: !(prev.integrations?.[key])
        }
      };
    });

    try {
      await api.put('/business/profile', {
        integrations: { [key]: !userProfile?.integrations?.[key] }
      });
      addNotification("Статус интеграции обновлен", "success");
    } catch (error) {
      console.error("Failed to toggle integration", error);
      addNotification("Ошибка при обновлении интеграции", "error");
    }
  };

  const scanPromoQR = async (promoId, qrData = "") => {
    try {
      await api.post('/analytics/record', {
        event_type: 'scan',
        promotion_id: promoId,
        metadata: { qr: qrData }
      });

      setPromotions(prev => prev.map(p => p.id === promoId ? { ...p, conversions: p.conversions + 1 } : p));
      addNotification("QR-код успешно отсканирован", "success");
      return { success: true };
    } catch (error) {
      console.error("Failed to scan QR", error);
      addNotification("Ошибка при сканировании QR", "error");
      throw error;
    }
  };

  const addCustomer = async (customerData) => {
    try {
      const res = await api.post('/customers', customerData);
      const newCustomer = res.data?.data || res.data || res;
      setCustomers((current) => [newCustomer, ...current]);
      addNotification("Клиент успешно добавлен", "success");
      return { success: true, data: newCustomer };
    } catch (error) {
      console.error("Failed to add customer", error);
      addNotification(error.message || "Ошибка при добавлении клиента", "error");
      throw error;
    }
  };

  const updateCustomer = async (id, customerData) => {
    try {
      const res = await api.put(`/customers/${id}`, customerData);
      const updatedCustomer = res.data?.data || res.data || res;
      setCustomers((current) => current.map((customer) => customer.id === id ? updatedCustomer : customer));
      addNotification("Данные клиента обновлены", "success");
      return updatedCustomer;
    } catch (error) {
      addNotification(error.message || "Не удалось обновить клиента", "error");
      throw error;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await api.delete(`/customers/${id}`);
      setCustomers((current) => current.filter((customer) => customer.id !== id));
      addNotification("Клиент удалён из базы", "info");
    } catch (error) {
      addNotification(error.message || "Не удалось удалить клиента", "error");
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{
      userProfile: userProfile || { name: '', email: '', avatar: '', integrations: { kaspi: false, whatsapp: false } },
      stats,
      promotions,
      customers,
      revenueData,
      promoTemplates,
      isLoading,
      addPromotion,
      updatePromotionStatus,
      deletePromotion,
      toggleIntegration,
      scanPromoQR,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      refreshData: fetchDashboardData
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
