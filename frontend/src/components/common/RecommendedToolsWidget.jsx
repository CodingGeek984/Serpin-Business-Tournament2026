import React, { useEffect, useState } from 'react';
import { ArrowRight, Gift, Sparkles, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardContent } from './Card/Card';

const RecommendedToolsWidget = ({ refreshKey = 0 }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = () => {
      setLoading(true);
      api.get('/recommendations').then((response) => {
        if (active) setItems(response.data || response || []);
      }).catch(() => active && setItems([])).finally(() => active && setLoading(false));
    };
    load();
    window.addEventListener('recommendations:refresh', load);
    return () => {
      active = false;
      window.removeEventListener('recommendations:refresh', load);
    };
  }, [refreshKey]);

  if (loading) return <div className="h-40 animate-pulse rounded-2xl bg-blue-50" />;
  if (!items.length) return null;
  return <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-blue-600" /><div><h2 className="font-bold text-slate-900">Рекомендовано для вашего бизнеса</h2><p className="text-xs text-slate-500">Подобрано по сфере и вашим целям</p></div></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{items.slice(0, 3).map((item) => { const Icon = item.kind === 'template' ? Gift : Wrench; return <Card key={`${item.kind}-${item.id}`} className="border-white bg-white/90"><CardContent className="p-4"><div className="flex items-start gap-3"><div className="rounded-xl bg-blue-100 p-2 text-blue-600"><Icon className="h-5 w-5" /></div><div className="min-w-0"><span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">{item.badge}</span><h3 className="mt-2 font-semibold text-slate-900">{item.name}</h3><p className="mt-1 text-xs text-slate-500">{item.description}</p></div></div><Link to={item.kind === 'template' ? '/promotions' : '/business-tools'} className="mt-4 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">{item.kind === 'template' ? 'Открыть шаблон' : 'Подключить инструмент'} <ArrowRight className="ml-1 h-4 w-4" /></Link></CardContent></Card>; })}</div></section>;
};

export default RecommendedToolsWidget;
