import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export const Card = ({ children, className, ...props }) => {
  return (
    <div 
      className={twMerge(clsx("bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", className))}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => (
  <div className={twMerge(clsx("px-5 py-4 border-b border-gray-100 flex items-center justify-between", className))}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }) => (
  <h3 className={twMerge(clsx("text-lg font-semibold text-[var(--color-text-primary)]", className))}>
    {children}
  </h3>
);

export const CardContent = ({ children, className }) => (
  <div className={twMerge(clsx("p-5", className))}>
    {children}
  </div>
);
