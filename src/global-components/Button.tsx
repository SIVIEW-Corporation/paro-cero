'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonIntent = 'primary' | 'red' | 'green' | 'blue' | 'purple' | 'zinc';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  intent?: ButtonIntent;
  tooltip?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  scale?: '101' | '102' | '105' | '110';
  shadowSize?: 'sm' | 'md' | 'lg' | 'none';
  fullWidth?: boolean;
  cursor?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'text-white bg-shPrimary-600 hover:bg-shPrimary-500 disabled:bg-zinc-500',
  secondary: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 disabled:bg-zinc-300',
  ghost: 'bg-transparent text-zinc-500 hover:bg-zinc-100 disabled:bg-zinc-100',
};

const intentStyles: Record<ButtonIntent, Record<ButtonVariant, string>> = {
  primary: {
    primary:
      'bg-shPrimary-600 hover:bg-shPrimary-500 text-white active:text-black',
    secondary:
      'bg-zinc-700 text-shPrimary-400 hover:text-shPrimary-300 hover:bg-shPrimary-700 active:text-white',
    ghost:
      'hover:text-shPrimary-300 text-shPrimary-400 hover:bg-shPrimary-800 active:text-white',
  },
  red: {
    primary: 'bg-red-900 hover:bg-red-800 text-white active:text-black',
    secondary:
      'bg-zinc-700 text-red-400 hover:text-red-200 hover:bg-red-950 active:text-white',
    ghost: 'hover:text-red-200 text-red-400 hover:bg-red-950 active:text-white',
  },
  green: {
    primary: 'bg-emerald-900 hover:bg-emerald-800 text-white active:text-black',
    secondary:
      'bg-zinc-700 text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950 active:text-white',
    ghost:
      'hover:text-emerald-200 text-emerald-400 hover:bg-emerald-950 active:text-white',
  },
  blue: {
    primary: 'bg-sky-900 hover:bg-sky-800 text-white active:text-black',
    secondary:
      'bg-zinc-700 text-sky-400 hover:text-sky-200 hover:bg-sky-950 active:text-white',
    ghost: 'hover:text-sky-200 text-sky-400 hover:bg-sky-950 active:text-white',
  },
  purple: {
    primary: 'bg-indigo-900 hover:bg-indigo-800 text-white active:text-black',
    secondary:
      'bg-zinc-700 text-indigo-400 hover:text-indigo-200 hover:bg-indigo-950 active:text-white',
    ghost:
      'hover:text-indigo-200 text-indigo-400 hover:bg-indigo-950 active:text-white',
  },
  zinc: {
    primary: 'bg-zinc-300 hover:bg-zinc-100 text-black active:text-black',
    secondary:
      'bg-zinc-700 text-zinc-300 hover:text-zinc-200 hover:bg-zinc-600 active:text-white',
    ghost:
      'hover:text-zinc-200 text-zinc-300 hover:bg-zinc-600 active:text-white',
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
      scale = '102',
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
        {icon && !loading && (
          <span className='flex-none shrink-0 grow-0'>{icon}</span>
        )}
        {children && !loading && <span>{children}</span>}
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
