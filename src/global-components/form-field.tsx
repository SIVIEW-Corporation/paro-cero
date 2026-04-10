'use client';

import * as motion from 'motion/react-client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Eye, EyeOff, Lock, type LucideIcon } from 'lucide-react';

interface FormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  icon?: LucideIcon;
  autocomplete?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
}

export function FormField({
  name,
  label,
  placeholder = '',
  type = 'text',
  icon: Icon,
  autocomplete,
  field,
}: FormFieldProps) {
  const hasError = field.state.meta.errors.length > 0;

  return (
    <div className='group relative'>
      <label
        htmlFor={name}
        className='text-shGray-400 group-focus-within:text-shPrimary-400 mb-1.5 block text-xs font-medium tracking-wide uppercase transition-colors'
      >
        {label}
      </label>
      <div className='relative'>
        <div
          className={cn(
            'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors',
            hasError
              ? 'text-red-400'
              : 'text-shGray-500 group-focus-within:text-shPrimary-400',
          )}
        >
          {Icon && <Icon size={16} />}
        </div>
        <input
          id={name}
          name={name}
          type={type}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autocomplete}
          className={cn(
            'bg-shGray-800 block w-full rounded-lg border py-2.5 pr-4 pl-10 text-zinc-100 transition-all placeholder:text-zinc-500',
            'focus:ring-shPrimary-400/20 outline-none focus:ring-2',
            hasError
              ? 'border-red-500 focus:border-red-500'
              : 'border-shGray-600 focus:border-shPrimary-400 hover:border-shGray-500',
          )}
        />
      </div>
      {hasError && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className='mt-1.5 flex flex-col gap-0.5'
        >
          {field.state.meta.errors
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((err: any, i: number) => (
              <p
                key={i}
                className='flex items-center gap-1.5 text-xs font-medium text-red-400'
              >
                <span className='h-1 w-1 rounded-full bg-red-400' />
                {typeof err === 'object' ? err.message : err}
              </p>
            ))}
        </motion.div>
      )}
    </div>
  );
}

interface PasswordFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  label?: string;
  icon?: LucideIcon;
  name?: string;
  autocomplete?: string;
}

export function PasswordField({
  field,
  label = 'Contraseña',
  icon: Icon = Lock,
  name,
  autocomplete,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const hasError = field.state.meta.errors.length > 0;

  const requirements = [
    {
      key: 'min8',
      label: 'Mínimo 8 caracteres',
      test: (v: string) => v.length >= 8,
    },
    {
      key: 'lower',
      label: 'Al menos una minúscula',
      test: (v: string) => /[a-z]/.test(v),
    },
    {
      key: 'upper',
      label: 'Al menos una mayúscula',
      test: (v: string) => /[A-Z]/.test(v),
    },
    {
      key: 'number',
      label: 'Al menos un número',
      test: (v: string) => /\d/.test(v),
    },
    {
      key: 'special',
      label: 'Al menos un carácter especial',
      test: (v: string) => /[\W_]/.test(v),
    },
  ];

  const showChecklist =
    field.state.value.length > 0 &&
    requirements.some((req) => !req.test(field.state.value));

  return (
    <div className='group relative'>
      <label
        htmlFor='password'
        className='text-shGray-400 group-focus-within:text-shPrimary-400 mb-1.5 block text-xs font-medium tracking-wide uppercase transition-colors'
      >
        {label}
      </label>
      <div className='relative'>
        <div
          className={cn(
            'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors',
            hasError
              ? 'text-red-400'
              : 'text-shGray-500 group-focus-within:text-shPrimary-400',
          )}
        >
          <Icon size={16} />
        </div>
        <input
          id='password'
          name={name}
          type={isVisible ? 'text' : 'password'}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder='••••••••'
          autoComplete={autocomplete}
          className={cn(
            'bg-shGray-800 block w-full rounded-lg border py-2.5 pr-10 pl-10 text-zinc-100 transition-all placeholder:text-zinc-500',
            'focus:ring-shPrimary-400/20 outline-none focus:ring-2',
            hasError
              ? 'border-red-500 focus:border-red-500'
              : 'border-shGray-600 focus:border-shPrimary-400 hover:border-shGray-500',
          )}
        />
        <button
          type='button'
          onClick={(e) => {
            e.preventDefault();
            setIsVisible((prev) => !prev);
          }}
          aria-label={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className='text-shGray-500 hover:text-shGray-300 absolute inset-y-0 right-0 flex items-center pr-3 transition-colors'
        >
          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Requisitos - solo visible cuando hay input y no están todos cumplidos */}
      {showChecklist && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className='mt-2.5 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'
        >
          {requirements.map((req) => {
            const passed = req.test(field.state.value);
            return (
              <div
                key={req.key}
                className={cn(
                  'flex items-center gap-1.5 text-xs transition-all',
                  passed ? 'text-emerald-400' : 'text-shGray-500',
                )}
              >
                {passed ? (
                  <CheckCircle size={12} className='shrink-0' />
                ) : (
                  <div className='bg-shGray-600 h-1.5 w-1.5 shrink-0 rounded-full' />
                )}
                <span>{req.label}</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
