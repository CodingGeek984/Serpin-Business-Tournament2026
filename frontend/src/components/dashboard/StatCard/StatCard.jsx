import React from 'react';
import { Card, CardContent } from '../../common/Card/Card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const StatCard = ({ label, value, change, trend }) => {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';

  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">{value}</h4>

        <div className="flex items-center text-sm font-medium">
          {isPositive ? (
            <span className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              {change}
            </span>
          ) : isNegative ? (
            <span className="flex items-center text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              {change}
            </span>
          ) : (
            <span className="flex items-center text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
              <Minus className="h-4 w-4 mr-1" />
              {change}
            </span>
          )}
          <span className="text-gray-400 ml-2 font-normal">vs прошлый месяц</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
