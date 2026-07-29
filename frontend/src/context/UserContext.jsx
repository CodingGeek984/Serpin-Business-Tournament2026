import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [promoTemplates, setPromoTemplates] = useState([]);

  const normalizePromotion = (promotion) => ({
    ...promotion,
    type: promotion.discount_type === 'fixed' ? 'discount' : 'discount',
    status: promotion.is_active ? 'active' : 'paused',
    conversions: Number(promotion.usage_count || 0),
    views: Number(promotion.views || 0),
    budget: Number(promotion.budget || 0),
    endDate: promotion.end_date || 'Не ограничен',
  });

  const normalizeCustomer = (customer) => ({
    ...customer,
    visits: Number(customer.visits_count || 0),
    totalSpent: Number(customer.total_spent || 0),
    stamps: Number(customer.bonuses || 0),
    lastVisit: customer.last_visit || null,
    status: customer.visits_count >= 5 ? 'regular' : 'new',
  });

  const refresh = useCallback(async () => {
    if (!token) return;
    const [business, promoItems, customerItems, summary, templates] = await Promise.all([
      api('/business', { token }),
      api('/promotions', { token }),
      api('/customers', { token }),
      api('/analytics/summary', { token }),
      api('/promotion-templates', { token }),
    ]);
    const normalizedPromotions = promoItems.map(normalizePromotion);
    const normalizedCustomers = customerItems.map(normalizeCustomer);
    const records = summary.records || [];
    setUserProfile({
      name: business.name || user?.full_name || 'Мой бизнес',
      email: user?.email || '',
      avatar: business.logo_url || '',
      integrations: business.social_links?.integrations || { kaspi: false, whatsapp: false },
      ...business,
    });
    setPromotions(normalizedPromotions);
    setCustomers(normalizedCustomers);
    setRevenueData(records.map((record) => ({ name: record.date, value: Number(record.revenue || 0) })));
    setPromoTemplates(templates);
    setStats([
      { id: 'revenue', label: 'Выручка', value: `${Number(summary.revenue || 0).toLocaleString()} ₸`, numericValue: Number(summary.revenue || 0), trend: 'neutral', change: 'За период' },
      { id: 'new_clients', label: 'Новые клиенты', value: String(summary.new_customers || 0), numericValue: Number(summary.new_customers || 0), trend: 'neutral', change: 'За период' },
      { id: 'active_promos', label: 'Активные акции', value: String(normalizedPromotions.filter((item) => item.status === 'active').length), numericValue: normalizedPromotions.filter((item) => item.status === 'active').length, trend: 'neutral', change: 'Сейчас' },
      { id: 'customers', label: 'Клиенты', value: String(normalizedCustomers.length), numericValue: normalizedCustomers.length, trend: 'neutral', change: 'В базе' },
    ]);
  }, [token, user]);

  useEffect(() => {
    refresh().catch((error) => console.error('Unable to load business data:', error));
  }, [refresh]);

  const addPromotion = async (promo) => {
    const created = await api('/promotions', {
      method: 'POST', token,
      body: { title: promo.title, end_date: promo.endDate, discount_type: 'percentage', discount_value: 0, is_active: true },
    });
    setPromotions((current) => [normalizePromotion(created), ...current]);
  };

  const updatePromotionStatus = async (id, status) => {
    const updated = await api(`/promotions/${id}`, { method: 'PUT', token, body: { is_active: status === 'active' } });
    setPromotions((current) => current.map((item) => item.id === id ? normalizePromotion(updated) : item));
  };

  const toggleIntegration = async (key) => {
    const integrations = { ...userProfile.integrations, [key]: !userProfile.integrations[key] };
    const updated = await api('/business', { method: 'PUT', token, body: { social_links: { integrations } } });
    setUserProfile((current) => ({ ...current, integrations, ...updated }));
  };

  const scanPromoQR = async (promoId) => {
    const promotion = promotions.find((item) => item.id === promoId);
    if (!promotion) return;
    const updated = await api(`/promotions/${promoId}`, { method: 'PUT', token, body: { usage_count: promotion.conversions + 1 } });
    setPromotions((current) => current.map((item) => item.id === promoId ? normalizePromotion(updated) : item));
  };

  const addCustomer = async (customer) => {
    const created = await api('/customers', { method: 'POST', token, body: customer });
    setCustomers((current) => [normalizeCustomer(created), ...current]);
  };

  return (
    <UserContext.Provider value={{ 
      userProfile: userProfile || { name: '', email: '', avatar: '', integrations: { kaspi: false, whatsapp: false } },
      stats, 
      promotions, 
      customers, 
      revenueData,
      promoTemplates,
      addPromotion, 
      updatePromotionStatus,
      toggleIntegration,
      scanPromoQR,
      addCustomer
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
