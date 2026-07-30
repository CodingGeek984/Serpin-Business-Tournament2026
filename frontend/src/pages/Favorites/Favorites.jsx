import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardContent } from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import { Mail, Gift, CreditCard, Brain, Check, ChevronRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotification } from '../../context/NotificationContext';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const iconMap = {
  Mail, Gift, CreditCard, Brain
};

const Favorites = () => {
  const { addNotification } = useNotification();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      // we get tools and filter those that are favorites
      // The API endpoint /api/tools/favorites should return just the favorites, let's use it
      const favs = await api.get('/tools/favorites');
      setTools(favs.data || favs);
    } catch (error) {
      addNotification('Ошибка загрузки избранного', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id, name) => {
    try {
      await api.delete(`/tools/${id}/favorite`);
      setTools(tools.filter(t => t.id !== id));
      addNotification(`"${name}" удален из избранного`, 'info');
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  if (loading) return <div className="p-10 text-center">Загрузка...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Избранные инструменты</h1>
        <p className="text-sm text-gray-500 mt-1">Инструменты, которые вы сохранили для быстрого доступа</p>
      </div>

      {tools.length === 0 ? (
        <Card className="bg-gray-50 border-gray-100 mt-4">
          <CardContent className="p-10 text-center">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">У вас пока нет избранных инструментов</p>
            <p className="text-sm text-gray-400 mt-1">Перейдите в каталог инструментов, чтобы добавить их сюда.</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" initial="hidden" animate="show" variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}>
          {tools.map(tool => {
            const Icon = iconMap[tool.icon] || ChevronRight;
            return (
              <motion.div key={tool.id} variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }}>
                <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 group border-transparent hover:border-blue-100">
                  <CardContent className="p-6 flex flex-col h-full relative">
                    <button
                      onClick={() => removeFavorite(tool.id, tool.name)}
                      className="absolute top-4 right-4 p-2 rounded-full text-red-500 bg-red-50 transition-all duration-200 active:scale-90"
                    >
                      <Heart className="w-5 h-5" fill="currentColor" />
                    </button>
                    <div className="flex items-start justify-between mb-4 mt-2">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-[var(--color-brand-blue)] flex items-center justify-center group-hover:scale-110 group-hover:shadow-sm transition-all duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1 flex items-center gap-2">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">{tool.category}</p>
                    <div className="mt-auto">
                      <Button variant="outline" className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200" onClick={() => removeFavorite(tool.id, tool.name)}>
                        Убрать из избранного
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default Favorites;
