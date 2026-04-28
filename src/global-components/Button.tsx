'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonIntent =
  | 'primary'
  | 'accent'
  | 'danger'
  | 'success'
  | 'info'
  | 'neutral';

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

// Fallback por defecto optimizado usando Technical Marine como base
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-shPrimary-800 text-white hover:bg-shPrimary-700 disabled:bg-shNeutral-300 disabled:text-shNeutral-500',
  secondary:
    'bg-shPrimary-100 text-shPrimary-900 hover:bg-shPrimary-200 disabled:bg-shNeutral-50 disabled:text-shNeutral-300',
  ghost:
    'bg-transparent text-shPrimary-800 hover:bg-shPrimary-100 disabled:bg-transparent disabled:text-shNeutral-300',
};

// Matriz de estilos conectada estrictamente a las variables CSS personalizadas
const intentStyles: Record<ButtonIntent, Record<ButtonVariant, string>> = {
  primary: {
    // Technical Marine Blue - 800 es base, 700 es hover
    primary: 'bg-shPrimary-800 text-white hover:bg-shPrimary-700',
    secondary: 'bg-shPrimary-100 text-shPrimary-900 hover:bg-shPrimary-200',
    ghost: 'bg-transparent text-shPrimary-800 hover:bg-shPrimary-50',
  },
  accent: {
    // Industrial Amber - Obligatorio shForeground (#0F172A) para texto
    primary: 'bg-shAccent-500 text-shForeground hover:bg-shAccent-600',
    secondary: 'bg-shAccent-100 text-shAccent-900 hover:bg-shAccent-200',
    ghost: 'bg-transparent text-shAccent-800 hover:bg-shAccent-50',
  },
  danger: {
    // Escala Crimson personalizada
    primary: 'bg-shDanger-700 text-white hover:bg-shDanger-600',
    secondary: 'bg-shDanger-50 text-shDanger-800 hover:bg-shDanger-100',
    ghost: 'bg-transparent text-shDanger-700 hover:bg-shDanger-50',
  },
  success: {
    // Escala Emerald personalizada
    primary: 'bg-shSuccess-700 text-white hover:bg-shSuccess-600',
    secondary: 'bg-shSuccess-50 text-shSuccess-800 hover:bg-shSuccess-100',
    ghost: 'bg-transparent text-shSuccess-700 hover:bg-shSuccess-50',
  },
  info: {
    // Mantenemos la paleta sky de Tailwind pero ajustada a la lógica 700/600
    primary: 'bg-sky-700 text-white hover:bg-sky-600',
    secondary: 'bg-sky-50 text-sky-800 hover:bg-sky-100',
    ghost: 'bg-transparent text-sky-700 hover:bg-sky-50',
  },
  neutral: {
    // Slate neutral para acciones de cancelación o regreso
    primary: 'bg-shNeutral-800 text-white hover:bg-shNeutral-700',
    secondary: 'bg-shNeutral-100 text-shNeutral-800 hover:bg-shNeutral-200',
    ghost: 'bg-transparent text-shNeutral-700 hover:bg-shNeutral-100',
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
  sm: 'shadow-sm hover:shadow-md',
  md: 'shadow-md hover:shadow-lg',
  lg: 'shadow-lg hover:shadow-xl',
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
      'flex items-center text-xs sm:text-sm lg:text-base justify-center gap-2 rounded-lg px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]';

    const variantClass = intent
      ? intentStyles[intent][variant]
      : variantStyles[variant];

    const shadowClass =
      disabled || variant === 'ghost' ? '' : shadowStyles[shadowSize];
    const scaleClass = disabled || loading ? '' : scaleStyles[scale];
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
