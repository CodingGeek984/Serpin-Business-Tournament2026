import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { MOCK_STATS, MOCK_REVENUE_DATA, PROMO_TEMPLATES } from '../constants/mockData';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotification();
  const [userProfile, setUserProfile] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(MOCK_STATS); // fallback to mock for now
  const [revenueData, setRevenueData] = useState(MOCK_REVENUE_DATA); // fallback to mock
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      // 1. Fetch User / Business Profile
      const businessRes = await api.get('/business').catch(() => ({ data: null }));
      if (businessRes?.data) setUserProfile(businessRes.data);

      // 2. Fetch Promotions
      const promosRes = await api.get('/promotions').catch(() => ({ data: [] }));
      setPromotions(Array.isArray(promosRes?.data) ? promosRes.data : promosRes || []);

      // 3. Fetch Customers
      const customersRes = await api.get('/customers').catch(() => ({ data: [] }));
      setCustomers(Array.isArray(customersRes?.data) ? customersRes.data : customersRes || []);

      // 4. Fetch Analytics Summary
      const statsRes = await api.get('/analytics/summary').catch(() => null);
      if (statsRes?.data) {
        // Transform backend stats format to frontend format if needed
      }
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
      const newPromo = res.data || res;
      setPromotions([newPromo, ...promotions]);
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
      setPromotions(promotions.map(p => p.id === id ? { ...p, status } : p));
      addNotification(`Статус акции обновлен на ${status}`, "success");
    } catch (error) {
      console.error("Failed to update status", error);
      addNotification("Ошибка при обновлении статуса", "error");
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
      await api.put('/business', {
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
      const newCustomer = res.data || res;
      setCustomers([newCustomer, ...customers]);
      addNotification("Клиент успешно добавлен", "success");
      return { success: true, data: newCustomer };
    } catch (error) {
      console.error("Failed to add customer", error);
      addNotification(error.message || "Ошибка при добавлении клиента", "error");
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
      promoTemplates: PROMO_TEMPLATES,
      isLoading,
      addPromotion,
      updatePromotionStatus,
      toggleIntegration,
      scanPromoQR,
      addCustomer,
      refreshData: fetchDashboardData
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
