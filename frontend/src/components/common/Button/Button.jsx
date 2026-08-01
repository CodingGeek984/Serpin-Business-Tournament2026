import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const Button = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-95 hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-hover)] text-white focus:ring-[var(--color-brand-blue)]",
    secondary: "bg-slate-100 hover:bg-slate-200 text-[var(--color-text-primary)] focus:ring-slate-300",
    outline: "border border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-[var(--color-brand-blue)]",
    ghost: "bg-transparent hover:bg-[var(--color-hover-bg)] text-slate-700 focus:ring-slate-300",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button 
      className={twMerge(clsx(baseStyle, variants[variant], sizes['md'], className))}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
