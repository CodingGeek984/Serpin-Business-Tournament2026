import React, { useEffect, useState } from 'react';
import AIChat from '../../components/ai/AIChat/AIChat';
import { Sparkles, TrendingUp, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '../../components/common/Card/Card';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const AIAssistant = () => {
  const { token } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await api.get('/recommendations', { headers: { Authorization: `Bearer ${token}` } });
        const payload = response.data?.data || response.data || response;
        setRecommendations(Array.isArray(payload) ? payload : []);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [token]);

  return (
    <motion.div 
      className="flex flex-col gap-6 max-w-5xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">AI Ассистент</h1>
        <p className="text-sm text-gray-500 mt-1">Ваш личный помощник для развития бизнеса. Спрашивайте советы, идеи для маркетинга и аналитику.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Chat */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <AIChat />
        </motion.div>

        {/* Right Side: Insights & Recommendations */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center mb-2">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
            Инсайты недели
          </h3>

          {loading ? (
            <p className="text-sm text-gray-500">Загрузка инсайтов...</p>
          ) : recommendations.length === 0 ? (
            <Card className="bg-gray-50 border-gray-100">
              <CardContent className="p-4 text-sm text-gray-500 text-center">
                Пока нет новых инсайтов. Напишите AI, чтобы получить советы!
              </CardContent>
            </Card>
          ) : (
            (Array.isArray(recommendations) ? recommendations : []).map((rec) => (
              <Card key={rec.id} className="bg-blue-50 border-blue-100 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-[var(--color-brand-blue)] text-sm mb-2 flex items-center">
                    {rec.type === 'growth' ? <TrendingUp className="w-4 h-4 mr-1.5" /> : <Sparkles className="w-4 h-4 mr-1.5 animate-pulse" />}
                    {rec.title || 'Новая рекомендация'}
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {rec.description}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AIAssistant;
