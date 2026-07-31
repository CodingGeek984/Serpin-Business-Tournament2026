import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Activity, Users, DollarSign, Plus, Heart } from 'lucide-react';
import BusinessToolWizard from '../../components/business_tools/BusinessToolWizard';
import Button from '../../components/common/Button/Button';
import { motion } from 'framer-motion';

const BusinessToolsPage = () => {
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'wizard'

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Бизнес-инструменты</h1>
          <p className="text-sm text-gray-500 mt-1">Управление запущенными кампаниями и мастер настройки</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'active' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Активные
          </button>
          <button 
            onClick={() => setActiveTab('wizard')}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'wizard' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Plus className="w-4 h-4" /> Новый запуск
          </button>
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'active' ? <ActiveToolsList onNavigateToWizard={() => setActiveTab('wizard')} /> : <BusinessToolWizard onComplete={() => setActiveTab('active')} />}
      </motion.div>
    </div>
  );
};

const ActiveToolsList = ({ onNavigateToWizard }) => {
  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const res = await api.get('/business-tools/active');
        // Fetch metrics for each tool to show on card
        const activeTools = res.data.data || res.data || [];
        
        const toolsWithMetrics = await Promise.all(
          activeTools.map(async (tool) => {
             try {
                const metricRes = await api.get(`/business-tools/metrics/${tool.id}`);
                return { ...tool, ...(metricRes.data.data || metricRes.data) };
             } catch(e) {
                return { ...tool, metrics: { new_customers: 0, revenue_generated: 0 } };
             }
          })
        );
        
        setTools(toolsWithMetrics);
      } catch (err) {
        console.error("Ошибка загрузки", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTools();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-brand-blue)]"></div></div>;
  }

  if (tools.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Нет активных инструментов</h3>
        <p className="text-gray-500 mb-6">Запустите свою первую акцию или программу лояльности</p>
        <Button onClick={onNavigateToWizard} className="gap-2">
          <Plus className="w-4 h-4" /> Настроить первый инструмент
        </Button>
      </div>
    );
  }

  const toggleFavorite = async (tool) => {
    const endpoint = `/business-tools/${tool.tool_id || tool.id}/favorite`;
    try {
      if (tool.is_favorite) {
        await api.delete(endpoint);
      } else {
        await api.post(endpoint);
      }
      setTools((current) => current.map((item) => (
        (item.tool_id || item.id) === (tool.tool_id || tool.id)
          ? { ...item, is_favorite: !tool.is_favorite }
          : item
      )));
    } catch (error) {
      console.error('Не удалось обновить избранное', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map(tool => (
        <div key={tool.tool_id || tool.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-bold text-lg text-gray-900 line-clamp-2">{tool.config?.title || 'Инструмент'}</h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleFavorite(tool)}
                aria-label={tool.is_favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                className={`p-2 rounded-full transition-colors ${tool.is_favorite ? 'bg-red-50 text-red-500' : 'text-gray-300 hover:bg-gray-50 hover:text-red-400'}`}
              >
                <Heart className="w-5 h-5" fill={tool.is_favorite ? 'currentColor' : 'none'} />
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Активен</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-6">Тип: {tool.tool_type === 'promotion' ? 'Промоакция' : tool.tool_type}</p>
          
          <div className="grid grid-cols-2 gap-4 mt-auto border-t border-gray-50 pt-4">
            <div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Users className="w-3 h-3"/> Привлечено</p>
              <p className="font-bold text-gray-900">{tool.metrics?.new_customers || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><DollarSign className="w-3 h-3"/> Выручка</p>
              <p className="font-bold text-gray-900">₸ {(tool.metrics?.revenue_generated || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BusinessToolsPage;
