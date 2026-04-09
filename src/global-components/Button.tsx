'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonIntent = 'primary' | 'red' | 'green' | 'yellow' | 'orange' | 'zinc';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  intent?: ButtonIntent;
  tooltip?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  scale?: '102' | '105' | '110';
  shadowSize?: 'sm' | 'md' | 'lg' | 'none';
  fullWidth?: boolean;
  cursor?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'text-white bg-shPrimary-600 hover:bg-shPrimary-500 disabled:bg-zinc-500',
  secondary: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 disabled:bg-zinc-300',
  ghost: 'bg-transparent text-zinc-500 hover:bg-zinc-100 disabled:bg-zinc-100',
};

const intentStyles: Record<ButtonIntent, Record<ButtonVariant, string>> = {
  primary: {
    primary:
      'bg-shPrimary-600 hover:bg-shPrimary-500 text-white disabled:bg-shPrimary-400/80',
    secondary: 'bg-shPrimary-50 text-shPrimary-600 hover:bg-shPrimary-100',
    ghost: 'hover:text-shPrimary-600 text-zinc-500 hover:bg-shPrimary-50',
  },
  red: {
    primary: 'bg-red-600 hover:bg-red-500 text-white',
    secondary: 'bg-red-50 text-red-600 hover:bg-red-100',
    ghost: 'hover:text-red-600 text-zinc-500 hover:bg-red-50',
  },
  green: {
    primary: 'bg-green-600 hover:bg-green-500 text-white',
    secondary: 'bg-green-50 text-green-600 hover:bg-green-100',
    ghost: 'hover:text-green-600 text-zinc-500 hover:bg-green-50',
  },
  yellow: {
    primary: 'bg-yellow-600 hover:bg-yellow-500 text-white',
    secondary: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
    ghost: 'hover:text-yellow-600 text-zinc-500 hover:bg-yellow-50',
  },
  orange: {
    primary: 'bg-orange-600 hover:bg-orange-500 text-white',
    secondary: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    ghost: 'hover:text-orange-600 text-zinc-500 hover:bg-orange-50',
  },
  zinc: {
    primary: 'bg-zinc-800 hover:bg-zinc-700 text-white',
    secondary: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
    ghost: 'hover:text-zinc-500 text-zinc-500 hover:bg-zinc-100',
  },
};

const scaleStyles = {
  '101': 'hover:scale-[1.01]',
  '102': 'hover:scale-[1.02]',
  '105': 'hover:scale-105',
  '110': 'hover:scale-110',
};

const shadowStyles = {
  none: '',
  sm: 'hover:shadow-sm',
  md: 'hover:shadow-md',
  lg: 'hover:shadow-lg',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      intent,
      tooltip,
      icon,
      loading,
      loadingText,
      scale = '105',
      shadowSize = 'sm',
      fullWidth,
      cursor = 'pointer',
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'flex items-center text-xs sm:text-sm lg:text-base justify-center gap-2 rounded-lg px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-[0.98]';

    const variantClass = intent
      ? intentStyles[intent][variant]
      : variantStyles[variant];

    const shadowClass = shadowStyles[shadowSize];
    const scaleClass = scaleStyles[scale];
    const widthClass = fullWidth ? 'w-full' : 'w-fit';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        title={tooltip}
        style={{
          cursor: disabled || loading ? 'not-allowed' : cursor,
          ...props.style,
        }}
        className={`${baseStyles} ${variantClass} ${shadowClass} ${scaleClass} ${widthClass} ${className}`}
        {...props}
      >
        {icon && <span className='flex-none shrink-0 grow-0'>{icon}</span>}
        {children && <span>{children}</span>}
        {loading && (
          <>
            <Loader2 className='size-5 animate-spin' />
            {loadingText && <span>{loadingText}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
