import api from './api';

const AnalyticsService = {
  // We can fetch each individually, but since our backend returns all in one call, 
  // we can use getDashboardData to minimize requests, while keeping the interface standard.
  
  async getSummary(businessId, periodDays = 30) {
    const res = await api.get(`/analytics/summary?days=${periodDays}`);
    return res.data?.summary || {};
  },
  
  async getSalesChartData(businessId, periodDays = 30) {
    const res = await api.get(`/analytics/summary?days=${periodDays}`);
    return res.data?.chartData || [];
  },
  
  async getPromotionsROI(businessId) {
    const res = await api.get(`/analytics/summary`);
    return res.data?.promotionsROI || [];
  },
  
  async getAIInsights(summaryData) {
    // summaryData arg is kept for signature matching, 
    // but our backend already computes insights based on the data.
    const res = await api.get(`/analytics/summary`);
    return res.data?.insights || [];
  },
  
  // Custom helper for the React page to fetch everything in 1 request
  async getDashboardData(periodDays = 30) {
    const res = await api.get(`/analytics/summary?days=${periodDays}`);
    return res.data || {};
  }
};

export default AnalyticsService;
