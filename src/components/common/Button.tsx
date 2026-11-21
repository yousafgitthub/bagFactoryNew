import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#2563EB] text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    secondary: 'bg-[#142238] text-white hover:bg-[#1b2c47] focus:ring-slate-700 shadow-sm',
    outline: 'border border-[#E2E8F0] bg-white text-[#1E293B] hover:bg-slate-50 focus:ring-blue-500 shadow-sm',
    danger: 'bg-[#DC2626] text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    ghost: 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 focus:ring-slate-400',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
