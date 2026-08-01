import React, { useEffect, useState } from 'react';
import { Heart, Rocket, Sparkles } from 'lucide-react';
import api from '../../services/api';
import Button from './Button/Button';
import { Card, CardContent } from './Card/Card';

const RecommendationWidget = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      const response = await api.get('/recommendations');
      setRecommendations(response.data || response);
    } catch {
      setRecommendations({ items: [], is_personalized: false });
    }
  };

  useEffect(() => {
    load();
    window.addEventListener('recommendations:refresh', load);
    return () => window.removeEventListener('recommendations:refresh', load);
  }, []);

  const activate = async (item) => {
    if (item.kind !== 'tool') return;
    setBusyId(item.id);
    try {
      await api.post(`/tools/${item.id}/activate`);
      window.dispatchEvent(new Event('recommendations:refresh'));
    } finally {
      setBusyId(null);
    }
  };

  const favorite = async (item) => {
    if (item.kind !== 'tool') return;
    setBusyId(item.id);
    try {
      await api.post(`/tools/${item.id}/favorite`);
    } finally {
      setBusyId(null);
    }
  };

  if (!recommendations) return <div className="h-44 animate-pulse rounded-2xl bg-blue-50" />;
  if (!recommendations.is_personalized) {
    return (
      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-6 w-6 shrink-0 text-blue-600" />
          <div>
            <h2 className="font-bold text-slate-900">Получите персональный план роста</h2>
            <p className="mt-1 text-sm text-slate-600">Пройдите быструю настройку бизнеса, чтобы получить рекомендации именно для вашей сферы и целей.</p>
            <Button className="mt-4" onClick={() => window.dispatchEvent(new Event('onboarding:open'))}>Настроить рекомендации</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-emerald-50 p-5">
      <div className="mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-blue-600" /><div><h2 className="font-bold text-slate-900">{recommendations.title}</h2><p className="text-xs text-slate-500">Инструменты и акции, подобранные под ваш бизнес</p></div></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(recommendations.items || []).map((item) => (
          <Card key={`${item.kind}-${item.id}`} className="border-white bg-white/90">
            <CardContent className="p-4">
              <h3 className="font-semibold text-slate-900">{item.name}</h3>
              <p className="mt-1 text-xs text-slate-500">{item.description}</p>
              <p className="mt-3 rounded-lg bg-emerald-50 px-2 py-1.5 text-xs font-medium text-emerald-800">{item.match_reason}</p>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1 text-xs" disabled={busyId === item.id || item.kind !== 'tool'} onClick={() => activate(item)}><Rocket className="mr-1 h-3.5 w-3.5" />Активировать</Button>
                <Button variant="outline" className="px-3" disabled={busyId === item.id || item.kind !== 'tool'} onClick={() => favorite(item)} aria-label="Сохранить в избранное"><Heart className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default RecommendationWidget;
