import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import StatCard from '../../components/dashboard/StatCard/StatCard';
import RevenueChart from '../../components/dashboard/RevenueChart/RevenueChart';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import { ArrowRight, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import RecommendationWidget from '../../components/common/RecommendationWidget';

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

const Dashboard = () => {
  const { stats: mockStats } = useUser();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [gamificationData, setGamificationData] = useState(null);
  const [loyaltyProgram, setLoyaltyProgram] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import('../../services/api').then(({ default: api }) => {
      Promise.all([
        api.get('/business/dashboard'),
        api.get('/gamification/status')
      ]).then(([dashRes, gamRes]) => {
        setDashboardData(dashRes.data || dashRes);
        setGamificationData(gamRes.data || gamRes);
      }).catch(console.error).finally(() => setIsLoading(false));
    });

    const savedLoyalty = localStorage.getItem('activeLoyaltyProgram');
    if (savedLoyalty) {
      try {
        setLoyaltyProgram(JSON.parse(savedLoyalty));
      } catch (e) {
        console.error("Failed to parse loyalty program", e);
      }
    }
  }, []);

  const activePromotions = dashboardData?.active_promotions || [];

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-brand-blue)]"></div>
      </div>
    );
  }

  const dynamicStats = [
    { label: 'Выручка (мес)', value: `₸${(dashboardData?.monthly_revenue || 0).toLocaleString()}`, change: '+12%', trend: 'up' },
    { label: 'Визиты', value: dashboardData?.monthly_visits || 0, change: '+5%', trend: 'up' },
    { label: 'Клиенты', value: dashboardData?.total_customers || 0, change: '+18%', trend: 'up' },
    { label: 'Активные акции', value: dashboardData?.active_promotions_count || 0, change: '0%', trend: 'neutral' }
  ];

  // Безопасное извлечение данных геймификации с дефолтными значениями для новых пользователей
  const profileData = gamificationData?.profile || {
    level: 1,
    points: 0,
    xp: 0,
    next_level_xp: 100
  };

  const nextLevelXp = typeof profileData.next_level_xp === 'number' && profileData.next_level_xp > 0
    ? profileData.next_level_xp
    : 100;

  const xpProgress = Math.min(100, Math.max(0, ((profileData.xp || 0) / nextLevelXp) * 100));

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Обзор бизнеса</h1>
          <p className="text-sm text-gray-500 mt-1">Вот что происходит с вашим бизнесом сегодня</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate('/settings')}>
            Настройки бизнеса
          </Button>
          <Button className="gap-2 shadow-sm hover:shadow-md" onClick={() => navigate('/promotions')}>
            <Plus className="w-4 h-4" />
            Создать акцию
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <RecommendationWidget />
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dynamicStats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </motion.div>

      {/* Main Content Area */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Chart) */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Right Column (Widgets) */}
        <div className="flex flex-col gap-6">
          {/* Active Promotions Widget */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Активные акции</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {activePromotions.slice(0, 3).map(promo => (
                  <div key={promo.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/promotions')}>
                    <div>
                      <p className="font-medium text-sm text-[var(--color-text-primary)] line-clamp-1">{promo.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{promo.conversions || 0} активаций</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      Активна
                    </span>
                  </div>
                ))}
                {activePromotions.length === 0 && (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    Нет активных акций
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-gray-100 text-center">
                <Link to="/promotions" className="text-[var(--color-brand-blue)] text-sm font-medium hover:underline flex items-center justify-center group">
                  Все акции <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Gamification Widget — Защищён от паданий */}
          <Card className="hover:shadow-md transition-shadow overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 blur-2xl -mr-10 -mt-10 rounded-full z-0"></div>
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🏆</span> Уровень Бизнеса
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-sm text-gray-500 font-medium">Уровень</span>
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                    {profileData.level}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-700">{profileData.points || 0} баллов</span>
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2.5 mt-4 mb-1">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full"
                  style={{ width: `${xpProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{profileData.xp || 0} XP</span>
                <span>{nextLevelXp} XP</span>
              </div>
            </CardContent>
          </Card>

          {/* Active Loyalty Program Widget */}
          {loyaltyProgram && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base text-gray-800">Программа лояльности</CardTitle>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Активна</span>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-1">{loyaltyProgram.name}</h4>
                  <p className="text-xs text-gray-500 mb-3">{loyaltyProgram.rewardDescription}</p>
                  <div className="flex items-center justify-center gap-1">
                    {Array.from({ length: Math.min(loyaltyProgram.stampCount, 5) }).map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-blue-50 text-[var(--color-brand-blue)] flex items-center justify-center text-xs font-bold border border-blue-100">
                        ✓
                      </div>
                    ))}
                    {loyaltyProgram.stampCount > 5 && (
                      <span className="text-xs text-gray-400 font-medium ml-1">+{loyaltyProgram.stampCount - 5}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Recommendations */}
          <Card className="hover:shadow-md transition-shadow border-[var(--color-brand-blue)] border-opacity-30 bg-blue-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <span className="text-xl">💡</span> Рекомендации
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.total_customers > 0 ? (
                <ul className="space-y-3">
                  <li className="flex gap-2 items-start text-sm">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span className="text-gray-700">Запустите акцию <strong>«Счастливые часы»</strong> — у вас спад визитов с 14:00 до 16:00.</span>
                  </li>
                  <li className="flex gap-2 items-start text-sm">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span className="text-gray-700">Верните клиентов: 12 человек не были у вас больше месяца. <Link to="/business-tools" className="text-blue-600 hover:underline">Отправить SMS</Link></span>
                  </li>
                </ul>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">
                    Недостаточно данных для анализа.
                  </p>
                  <p className="text-xs text-gray-400">
                    Добавьте клиентов, чтобы AI смог давать рекомендации по росту выручки.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;