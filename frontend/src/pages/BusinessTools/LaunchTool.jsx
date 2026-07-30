import React from 'react';
import BusinessToolWizard from '../../components/business_tools/BusinessToolWizard';

const LaunchTool = () => {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Запуск бизнес-инструмента</h1>
        <p className="text-sm text-gray-500 mt-1">Настройте параметры и оцените прогнозируемый эффект</p>
      </div>
      <BusinessToolWizard />
    </div>
  );
};

export default LaunchTool;
