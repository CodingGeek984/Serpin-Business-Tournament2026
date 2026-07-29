import React from 'react';
import { useUser } from '../../context/UserContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card/Card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Brain, Sparkles, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button/Button';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const { revenueData, promotions } = useUser();
  const navigate = useNavigate();

  // Calculate funnel from active promotions
  const totalViews = promotions.reduce((acc, p) => acc + p.views, 0) || 1000;
  const totalConversions = promotions.reduce((acc, p) => acc + p.conversions, 0) || 100;
  
  const funnelData = [
    { name: 'Увидели акцию', value: totalViews },
    { name: 'Открыли детали', value: Math.round(totalViews * 0.4) },
    { name: 'Активировали (Сканировали)', value: totalConversions }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Аналитика</h1>
        <p className="text-sm text-gray-500 mt-1">Детальные метрики вашего бизнеса и ИИ-инсайты</p>
      </div>

      {/* AI Marketer Widget */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-10">
          <Brain className="w-40 h-40 text-[var(--color-brand-blue)]" />
        </div>
        <CardContent className="p-6 relative z-10 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[var(--color-brand-blue)] flex items-center mb-2">
              <Sparkles className="w-5 h-5 mr-2" />
              AI-Маркетолог рекомендует
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Анализ показал просадку выручки в <b>Среду</b> (-15% от среднего). Рекомендуем запустить акцию <b>«Счастливые часы»</b> для привлечения трафика в этот день.
            </p>
            <Button onClick={() => navigate('/promotions')} className="gap-2 shadow-sm">
              Настроить акцию
            </Button>
          </div>
          <div className="w-full md:w-1/3 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Риск потери клиентов</p>
                <p className="text-xs text-gray-600 mt-1">12 клиентов из базы не были у вас более 30 дней. Рассмотрите WhatsApp-рассылку.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Структура выручки (Обычная vs Акции)</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9ca3af" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPromo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand-blue)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-brand-blue)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={v => `${v/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="value" name="Базовая выручка" stroke="#9ca3af" fill="url(#colorBase)" stackId="1" />
                <Area type="monotone" dataKey="promoRevenue" name="Выручка по акциям" stroke="var(--color-brand-blue)" fill="url(#colorPromo)" stackId="1" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Client Types */}
        <Card>
          <CardHeader>
            <CardTitle>Новые vs Повторные клиенты</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} cursor={{fill: '#f9fafb'}} />
                <Legend iconType="circle" />
                <Bar dataKey="returnClients" name="Повторные" fill="#10b981" radius={[0, 0, 4, 4]} stackId="a" />
                <Bar dataKey="newClients" name="Новые" fill="var(--color-brand-blue)" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Funnel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Воронка конверсии акций (В среднем)</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={funnelData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 13, fontWeight: 500}} width={150} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Line type="stepAfter" dataKey="value" name="Людей" stroke="var(--color-brand-blue)" strokeWidth={4} dot={{r: 6, fill: 'var(--color-brand-blue)', strokeWidth: 2, stroke: 'white'}} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
