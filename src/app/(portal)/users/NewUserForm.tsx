'use client';

import { useForm } from '@tanstack/react-form';
import { useCreateUserMutation } from '@/app/(portal)/users/hooks/use-newOperator-mutation';
import { newUserSchema } from './lib/new-user-schema';
import * as motion from 'motion/react-client';
import {
  Mail,
  Lock,
  User,
  Briefcase,
  MapPin,
  Shield,
  UserPlus,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewUserFormProps {
  company_id?: string;
}

const fieldAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
};

function PasswordField({
  field,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
}) {
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

  return (
    <div className='group relative'>
      <label
        htmlFor='password'
        className='text-shGray-400 group-focus-within:text-shPrimary-400 mb-1.5 block text-xs font-medium tracking-wide uppercase transition-colors'
      >
        Contraseña
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
          <Lock size={16} />
        </div>
        <input
          id='password'
          type='text'
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder='••••••••'
          className={cn(
            'bg-shGray-800 block w-full rounded-lg border py-2.5 pr-4 pl-10 text-zinc-100 transition-all placeholder:text-zinc-500',
            'focus:ring-shPrimary-400/20 outline-none focus:ring-2',
            hasError
              ? 'border-red-500 focus:border-red-500'
              : 'border-shGray-600 focus:border-shPrimary-400 hover:border-shGray-500',
          )}
        />
      </div>

      {/* Requisitos - solo visible cuando hay input y no están todos cumplidos */}
      {field.state.value.length > 0 &&
        requirements.some((req) => !req.test(field.state.value)) && (
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

function FieldInput({
  name,
  label,
  placeholder,
  type = 'text',
  icon: Icon,
  field,
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
}) {
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
          <Icon size={16} />
        </div>
        <input
          id={name}
          type={type}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder={placeholder}
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

export default function NewUserForm({ company_id }: NewUserFormProps) {
  const createUser = useCreateUserMutation();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      role: 'operator' as 'operator' | 'viewer',
      companyId: company_id || '',
      area: '',
      jobTitle: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await createUser.mutateAsync(value);
        form.reset();
      } catch {
        // Error handled by mutation hook via toast
      }
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className='w-full'
    >
      {/* Header */}
      <div className='mt-2 mb-6 md:mt-4 md:mb-8'>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className='mb-1 flex items-center gap-2'
        >
          <h2 className='font-inter text-shGray-100 text-lg font-bold md:text-xl xl:text-2xl'>
            Nuevo usuario
          </h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className='text-shGray-500 font-inter text-sm'
        >
          Completa el formulario para registrar un nuevo usuario en la
          plataforma.
        </motion.p>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className='border-shGray-700/50 bg-shGray-800/40 rounded-2xl border p-5 backdrop-blur-sm md:p-6'
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className='space-y-5'
        >
          {/* Row 1: Email + Password */}
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            <motion.div
              custom={0}
              initial='hidden'
              animate='visible'
              variants={fieldAnimation}
            >
              <form.Field
                name='email'
                validators={{ onChange: newUserSchema.shape.email }}
                children={(field) => (
                  <FieldInput
                    name='email'
                    label='Correo electrónico'
                    placeholder='ejemplo@winba.com'
                    type='email'
                    icon={Mail}
                    field={field}
                  />
                )}
              />
            </motion.div>
            <motion.div
              custom={1}
              initial='hidden'
              animate='visible'
              variants={fieldAnimation}
            >
              <form.Field
                name='password'
                validators={{ onChange: newUserSchema.shape.password }}
                children={(field) => <PasswordField field={field} />}
              />
            </motion.div>
          </div>

          {/* Row 2: Full Name + Role */}
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            <motion.div
              custom={2}
              initial='hidden'
              animate='visible'
              variants={fieldAnimation}
            >
              <form.Field
                name='fullName'
                validators={{ onChange: newUserSchema.shape.fullName }}
                children={(field) => (
                  <FieldInput
                    name='fullName'
                    label='Nombre completo'
                    placeholder='Esteban Rodriguez Barrios'
                    icon={User}
                    field={field}
                  />
                )}
              />
            </motion.div>
            <motion.div
              custom={3}
              initial='hidden'
              animate='visible'
              variants={fieldAnimation}
            >
              <form.Field
                name='role'
                children={(field) => (
                  <div className='group relative'>
                    <label
                      htmlFor='role'
                      className='text-shGray-400 group-focus-within:text-shPrimary-400 mb-1.5 block text-xs font-medium tracking-wide uppercase transition-colors'
                    >
                      Rol
                    </label>
                    <div className='relative'>
                      <div className='text-shGray-500 group-focus-within:text-shPrimary-400 pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors'>
                        <Shield size={16} />
                      </div>
                      <select
                        id='role'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            () => e.target.value as 'operator' | 'viewer',
                          )
                        }
                        className={cn(
                          'bg-shGray-800 block w-full appearance-none rounded-lg border py-2.5 pr-10 pl-10 text-zinc-100 transition-all',
                          'focus:ring-shPrimary-400/20 outline-none focus:ring-2',
                          'border-shGray-600 focus:border-shPrimary-400 hover:border-shGray-500',
                        )}
                      >
                        <option value='operator'>Operador</option>
                        <option value='viewer'>Visor</option>
                      </select>
                      <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
                        <svg
                          className='text-shGray-500 h-4 w-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              />
            </motion.div>
          </div>

          {/* Row 3: Area + Job Title */}
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            <motion.div
              custom={4}
              initial='hidden'
              animate='visible'
              variants={fieldAnimation}
            >
              <form.Field
                name='area'
                validators={{ onChange: newUserSchema.shape.area }}
                children={(field) => (
                  <FieldInput
                    name='area'
                    label='Área'
                    placeholder='Mantenimiento'
                    icon={MapPin}
                    field={field}
                  />
                )}
              />
            </motion.div>
            <motion.div
              custom={5}
              initial='hidden'
              animate='visible'
              variants={fieldAnimation}
            >
              <form.Field
                name='jobTitle'
                validators={{ onChange: newUserSchema.shape.jobTitle }}
                children={(field) => (
                  <FieldInput
                    name='jobTitle'
                    label='Puesto'
                    placeholder='Técnico de Campo'
                    icon={Briefcase}
                    field={field}
                  />
                )}
              />
            </motion.div>
          </div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className='flex items-center justify-end gap-3 pt-2'
          >
            <button
              type='submit'
              disabled={createUser.isPending}
              className={cn(
                'flex items-center gap-2 rounded-lg px-6 py-2.5 font-medium text-white transition-all',
                'bg-shPrimary-600 hover:bg-shPrimary-500 active:scale-[0.98]',
                'disabled:bg-shPrimary-800 disabled:cursor-not-allowed disabled:opacity-60',
                'focus:ring-shPrimary-400/50 focus:ring-offset-shGray-900 focus:ring-2 focus:ring-offset-2 focus:outline-none',
              )}
            >
              {createUser.isPending ? (
                <>
                  <svg
                    className='h-4 w-4 animate-spin'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                    />
                  </svg>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Crear usuario</span>
                </>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}
