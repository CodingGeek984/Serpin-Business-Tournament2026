import React from 'react';
import AIChat from '../../components/ai/AIChat/AIChat';
import { Sparkles, TrendingUp, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '../../components/common/Card/Card';
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

const AIAssistant = () => {
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

          <Card className="bg-blue-50 border-blue-100 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <h4 className="font-semibold text-[var(--color-brand-blue)] text-sm mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1.5" />
                Возможность роста
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                За последние 7 дней 40% ваших клиентов приходили после обеда. Запуск акции "Счастливые часы" с 15:00 до 18:00 может увеличить выручку на 15%.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-emerald-50 border-emerald-100 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <h4 className="font-semibold text-emerald-700 text-sm mb-2 flex items-center">
                <Sparkles className="w-4 h-4 mr-1.5 animate-pulse" />
                Рекомендация по Kaspi
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Добавьте подарочные наборы в Kaspi Магазин перед грядущими праздниками. По статистике, это увеличивает средний чек.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AIAssistant;
