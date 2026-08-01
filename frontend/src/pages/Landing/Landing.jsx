import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Users, Zap, Target, Smartphone, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button/Button';

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4"
  >
    <div className="w-12 h-12 bg-blue-50 text-[var(--color-brand-blue)] rounded-xl flex items-center justify-center">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-200">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="text-2xl font-black text-[var(--color-brand-blue)] tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6" /> Serpin
        </div>
        <div className="flex gap-4">
          <Link to="/login">
            <Button variant="outline" className="hidden sm:flex">Войти</Button>
          </Link>
          <Link to="/login">
            <Button className="shadow-md">Начать бесплатно</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex flex-col gap-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold w-max mb-2">
            <Zap className="w-4 h-4 fill-current" /> Для малого офлайн-бизнеса
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
            Оцифруйте свой бизнес и <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">увеличьте выручку</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
            Простая платформа для привлечения клиентов, запуска акций и анализа продаж. 
            Создано специально для кофеен, салонов и магазинов, чтобы легко конкурировать с крупными сетями.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto gap-2 shadow-xl shadow-blue-500/20 text-base h-12 px-8">
                Начать бесплатно <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 w-full relative"
        >
          {/* Abstract Dashboard Mockup */}
          <div className="relative rounded-2xl bg-white p-2 shadow-2xl border border-gray-200/60 aspect-[4/3] overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50/50 -z-10" />
            <div className="w-full h-8 border-b border-gray-100 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="h-24 w-1/3 bg-blue-100 rounded-xl animate-pulse" />
                <div className="h-24 w-1/3 bg-emerald-100 rounded-xl animate-pulse delay-75" />
                <div className="h-24 w-1/3 bg-purple-100 rounded-xl animate-pulse delay-150" />
              </div>
              <div className="flex gap-4">
                <div className="h-48 w-2/3 bg-gray-100 rounded-xl" />
                <div className="h-48 w-1/3 bg-gray-100 rounded-xl flex flex-col gap-2 p-4">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center px-6">
          <p className="text-gray-500 mb-6 font-medium text-sm tracking-wide uppercase">Нам доверяют лидеры</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-3xl font-black text-gray-800">
            <div className="flex flex-col items-center"><span>500+</span><p className="text-sm text-gray-400 font-normal mt-1">бизнесов</p></div>
            <div className="flex flex-col items-center"><span>12k+</span><p className="text-sm text-gray-400 font-normal mt-1">клиентов</p></div>
            <div className="flex flex-col items-center text-emerald-600"><span>98%</span><p className="text-sm text-gray-400 font-normal mt-1">довольны</p></div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Почему Serpin?</h2>
            <p className="text-gray-500">Мы собрали все необходимые инструменты в одном месте, чтобы вы могли сфокусироваться на своем бизнесе, а не на настройке сложных систем.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Target} 
              title="Привлечение клиентов" 
              desc="Простые цифровые инструменты для запуска акций, купонов и скидок за пару кликов."
            />
            <FeatureCard 
              icon={Users} 
              title="Повышение лояльности" 
              desc="Автоматизированные бонусные программы и персонализированные предложения для удержания."
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Базовая аналитика" 
              desc="Понятные графики продаж и поведения клиентов без сложных настроек и специальных знаний."
            />
            <FeatureCard 
              icon={Smartphone} 
              title="Мобильность" 
              desc="Управляйте своим бизнесом прямо с телефона, сканируйте QR-коды клиентов встроенной камерой."
            />
            <FeatureCard 
              icon={Sparkles} 
              title="AI-Ассистент" 
              desc="Умный помощник анализирует ваши данные и сам предлагает идеи для роста выручки."
            />
            <FeatureCard 
              icon={Zap} 
              title="Быстрый старт" 
              desc="Регистрация за 1 минуту. Никаких сложных интеграций и программирования."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 lg:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
             <div className="absolute -top-24 -left-24 w-64 h-64 bg-white rounded-full blur-3xl" />
             <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 relative z-10">Готовы обогнать конкурентов?</h2>
          <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto relative z-10">
            Присоединяйтесь к платформе Serpin и получите доступ к инструментам, которые используют лидеры рынка, но адаптированным для вашего бизнеса.
          </p>
          <Link to="/login" className="relative z-10">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-50 text-lg px-10 py-6 h-auto shadow-xl">
              Создать аккаунт бесплатно
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 Serpin Business Tournament. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default Landing;
