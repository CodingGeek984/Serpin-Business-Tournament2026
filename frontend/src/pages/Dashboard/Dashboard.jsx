import React from 'react';
import { useUser } from '../../context/UserContext';
import StatCard from '../../components/dashboard/StatCard/StatCard';
import RevenueChart from '../../components/dashboard/RevenueChart/RevenueChart';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import { ArrowRight, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
  const { stats, promotions } = useUser();
  const navigate = useNavigate();
  const activePromotions = promotions.filter(p => p.status === 'active');

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
        <Button className="gap-2 shadow-sm hover:shadow-md" onClick={() => navigate('/promotions')}>
          <Plus className="w-4 h-4" />
          Создать акцию
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
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
                  <div key={promo.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-sm text-[var(--color-text-primary)] line-clamp-1">{promo.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{promo.conversions} активаций</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full animate-pulse">
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
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
