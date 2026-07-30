import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import { Mail, Gift, CreditCard, Brain, Check, ChevronRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotification } from '../../context/NotificationContext';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import RecommendationWidget from '../../components/common/RecommendationWidget';

const iconMap = {
  Mail: Mail,
  Gift: Gift,
  CreditCard: CreditCard,
  Brain: Brain
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const Tools = () => {
  const { addNotification } = useNotification();
  const { token } = useAuth();
  const [tools, setTools] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [toolsRes, recRes] = await Promise.all([
        api('/tools', { token }),
        api('/tools/recommendations', { token }).catch(() => ({ data: [] }))
      ]);
      const items = toolsRes.data || toolsRes;
      setTools(items.map((item) => ({ ...item, active: item.is_activated })));
      setFavorites(new Set(items.filter((item) => item.is_favorite).map((item) => item.id)));
      
      const recs = recRes.data || recRes || [];
      setRecommendations(recs.map((item) => ({ ...item, active: item.is_activated })));
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, addNotification]);

  const toggleFavorite = async (id, name) => {
    const isFavorite = favorites.has(id);
    try {
      await api(`/tools/${id}/favorite`, { method: isFavorite ? 'DELETE' : 'POST', token });
      setFavorites((current) => {
        const next = new Set(current);
        if (isFavorite) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
      addNotification(`"${name}" ${isFavorite ? 'удален из' : 'добавлен в'} избранное`, isFavorite ? 'info' : 'success');
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  const handleAction = async (tool) => {
    if (tool.active) {
      addNotification(`Открыты настройки для "${tool.name}"`, 'info');
    } else {
      window.location.href = '/business-tools';
    }
  };

  const filteredTools = tools.filter(t => {
    if (filter === 'active') return t.active;
    if (filter === 'inactive') return !t.active;
    return true;
  });

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Инструменты</h1>
          <p className="text-sm text-gray-500 mt-1">Подключайте новые сервисы и управляйте текущими</p>
        </div>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'all', label: 'Все' },
            { id: 'active', label: 'Подключенные' },
            { id: 'inactive', label: 'Доступные' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={twMerge(clsx(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                filter === tab.id ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              ))}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <RecommendationWidget />
      </motion.div>

      {/* Smart Recommendations Section */}
      {recommendations.length > 0 && filter === 'all' && (
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm mt-2 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-[var(--color-brand-blue)]" />
            <h2 className="text-lg font-bold text-gray-900">Рекомендовано для вашего бизнеса</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map(tool => {
              const Icon = iconMap[tool.icon] || ChevronRight;
              return (
                <Card key={`rec-${tool.id}`} className="hover:shadow-md transition-all duration-300 border-white bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-[var(--color-brand-blue)] flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 leading-tight">{tool.name}</h3>
                        {tool.active && <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-1.5 rounded-sm">Активно</span>}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-4">{tool.description}</p>
                    <div className="mt-auto">
                      <Button variant={tool.active ? "outline" : "primary"} className="w-full text-sm py-1.5 h-auto" onClick={() => handleAction(tool)}>
                        {tool.active ? 'Настроить' : 'Подключить'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTools.map(tool => {
          const Icon = iconMap[tool.icon] || ChevronRight;
          const isFav = favorites.has(tool.id);

          return (
            <motion.div key={tool.id} variants={itemVariants}>
              <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 group border-transparent hover:border-blue-100">
                <CardContent className="p-6 flex flex-col h-full relative">

                  <button
                    onClick={() => toggleFavorite(tool.id, tool.name)}
                    className={twMerge(clsx(
                      "absolute top-4 right-4 p-2 rounded-full transition-all duration-200 active:scale-90",
                      isFav ? "text-red-500 bg-red-50" : "text-gray-300 hover:bg-gray-50 hover:text-red-400"
                    ))}
                  >
                    <Heart className="w-5 h-5" fill={isFav ? "currentColor" : "none"} />
                  </button>

                  <div className="flex items-start justify-between mb-4 mt-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-[var(--color-brand-blue)] flex items-center justify-center group-hover:scale-110 group-hover:shadow-sm transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1 flex items-center gap-2">
                    {tool.name}
                    {tool.active && (
                      <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3 mr-0.5" />
                        Активно
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">{tool.category}</p>

                  <div className="mt-auto">
                    <Button
                      variant={tool.active ? "outline" : "primary"}
                      className="w-full"
                      onClick={() => handleAction(tool)}
                    >
                      {tool.active ? 'Настроить' : 'Подключить'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        {filteredTools.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            В этой категории нет инструментов.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Tools;
