import React, { createContext, useState, useContext, useEffect } from 'react';
import { MOCK_STATS, MOCK_PROMOTIONS, MOCK_CUSTOMERS, MOCK_REVENUE_DATA, MOCK_USER, PROMO_TEMPLATES } from '../constants/mockData';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Load from LocalStorage or fallback to MOCK
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : MOCK_USER;
  });

  const [promotions, setPromotions] = useState(() => {
    const saved = localStorage.getItem('promotions');
    return saved ? JSON.parse(saved) : MOCK_PROMOTIONS;
  });
  
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('stats');
    return saved ? JSON.parse(saved) : MOCK_STATS;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : MOCK_CUSTOMERS;
  });

  const [revenueData, setRevenueData] = useState(() => {
    const saved = localStorage.getItem('revenueData');
    return saved ? JSON.parse(saved) : MOCK_REVENUE_DATA;
  });

  // Save to LocalStorage on every change
  useEffect(() => { localStorage.setItem('userProfile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('promotions', JSON.stringify(promotions)); }, [promotions]);
  useEffect(() => { localStorage.setItem('stats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('revenueData', JSON.stringify(revenueData)); }, [revenueData]);

  // Methods
  const addPromotion = (promo) => {
    setPromotions([{ ...promo, id: `p${Date.now()}` }, ...promotions]);
    
    // Update active promos stat
    const newActiveCount = promotions.filter(p => p.status === 'active').length + (promo.status === 'active' ? 1 : 0);
    setStats(prev => prev.map(s => s.id === 'active_promos' ? { ...s, value: newActiveCount.toString(), numericValue: newActiveCount } : s));
  };

  const updatePromotionStatus = (id, status) => {
    setPromotions(promotions.map(p => p.id === id ? { ...p, status } : p));
    
    // Update stats
    setTimeout(() => {
      setPromotions(currentPromos => {
        const newActiveCount = currentPromos.filter(p => p.status === 'active').length;
        setStats(prev => prev.map(s => s.id === 'active_promos' ? { ...s, value: newActiveCount.toString(), numericValue: newActiveCount } : s));
        return currentPromos;
      });
    }, 0);
  };

  const toggleIntegration = (key) => {
    setUserProfile(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [key]: !prev.integrations[key]
      }
    }));
  };

  const scanPromoQR = (promoId) => {
    // Increase conversions for promo
    setPromotions(prev => prev.map(p => p.id === promoId ? { ...p, conversions: p.conversions + 1 } : p));
    
    // Update overall revenue (simulation: avg 2500 tenge per conversion)
    setStats(prev => prev.map(s => {
      if (s.id === 'revenue') {
        const newRev = s.numericValue + 2500;
        return { ...s, numericValue: newRev, value: `${(newRev / 1000).toFixed(0)} 000 ₸` };
      }
      return s;
    }));
  };

  const addCustomer = (customer) => {
    setCustomers([{ ...customer, id: `c${Date.now()}` }, ...customers]);
    setStats(prev => prev.map(s => {
      if (s.id === 'new_clients') {
        const newVal = s.numericValue + 1;
        return { ...s, numericValue: newVal, value: newVal.toString() };
      }
      return s;
    }));
  };

  return (
    <UserContext.Provider value={{ 
      userProfile,
      stats, 
      promotions, 
      customers, 
      revenueData,
      promoTemplates: PROMO_TEMPLATES,
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
