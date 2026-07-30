import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

const ToolPerformanceCard = ({ toolInstanceId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!toolInstanceId) return;
    
    const fetchMetrics = async () => {
      try {
        const res = await api(`/business-tools/metrics/${toolInstanceId}`);
        setData(res.data || res);
      } catch (err) {
        console.error("Ошибка загрузки метрик", err);
      }
    };
    fetchMetrics();
  }, [toolInstanceId]);

  if (!data) return <div className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>;

  const { metrics, config } = data;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="font-bold text-gray-900">{config.title || "Инструмент"}</h4>
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">Активно</span>
        </div>
        <div className="w-10 h-10 bg-blue-50 text-[var(--color-brand-blue)] rounded-full flex items-center justify-center">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
        <div>
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Users className="w-3 h-3"/> Привлечено</p>
          <p className="font-semibold text-gray-900">{metrics.new_customers} чел.</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3"/> Доход</p>
          <p className="font-semibold text-gray-900">₸ {metrics.revenue_generated.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ToolPerformanceCard;
