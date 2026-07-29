import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const Button = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-95 hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-hover)] text-white focus:ring-[var(--color-brand-blue)]",
    secondary: "bg-[var(--color-hover-bg)] hover:bg-gray-300 text-[var(--color-text-primary)] focus:ring-gray-300",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-[var(--color-brand-blue)]",
    ghost: "bg-transparent hover:bg-[var(--color-hover-bg)] text-gray-700 focus:ring-gray-300",
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
