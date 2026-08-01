import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const Button = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-95 hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#bb9af7] via-[#9d7cd8] to-[#7aa2f7] hover:from-[#c0caf5] hover:via-[#bb9af7] hover:to-[#7dcfff] text-[#131020] shadow-lg shadow-[#bb9af7]/25 focus:ring-[#bb9af7]",
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
