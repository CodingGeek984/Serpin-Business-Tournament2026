import React from 'react';
import { Card, CardContent } from '../../common/Card/Card';
import { Calendar, Eye, MousePointerClick } from 'lucide-react';
import Button from '../../common/Button/Button';
import { useUser } from '../../../context/UserContext';
import { useNotification } from '../../../context/NotificationContext';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const PromotionCard = ({ promotion }) => {
  const { updatePromotionStatus } = useUser();
  const { addNotification } = useNotification();
  const isActive = promotion.status === 'active' || promotion.is_active === true;
  const views = Number(promotion.views || 0);
  const conversions = Number(promotion.conversions || promotion.usage_count || 0);
  const budget = Number(promotion.budget || 0);

  const toggleStatus = async () => {
    try {
      await updatePromotionStatus(promotion.id, isActive ? 'paused' : 'active');
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-semibold text-[var(--color-text-primary)] text-lg line-clamp-2">
            {promotion.title}
          </h4>
          <span className={twMerge(clsx(
            "px-2.5 py-1 text-xs font-medium rounded-full shrink-0",
            isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
          ))}>
            {isActive ? 'Активна' : 'Пауза'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1 flex items-center"><Eye className="w-3 h-3 mr-1"/> Просмотры</span>
            <span className="font-semibold">{views.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1 flex items-center"><MousePointerClick className="w-3 h-3 mr-1"/> Конверсии</span>
            <span className="font-semibold">{conversions.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1 flex items-center"><Calendar className="w-3 h-3 mr-1"/> До</span>
            <span className="font-semibold text-sm">{promotion.endDate || promotion.end_date || 'Не ограничен'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Бюджет</span>
            <span className="font-semibold text-sm">{budget > 0 ? `${budget} ₸` : 'Бесплатно'}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button 
            variant={isActive ? "outline" : "primary"} 
            className="flex-1"
            onClick={toggleStatus}
          >
            {isActive ? 'Остановить' : 'Запустить'}
          </Button>
          <Button variant="secondary" className="px-3">
            Изменить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromotionCard;
