'use client';

import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import * as motion from 'motion/react-client';
import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';

import { loginSchema } from '@/lib/auth-schema';
import { useLoginMutation } from '@/hooks/use-login-mutation';
import { FormField, PasswordField } from '@/global-components/form-field';
import Button from '@/global-components/Button';

export default function LoginForm() {
  const router = useRouter();
  const mutation = useLoginMutation();
  const [rememberMe, setRememberMe] = useState(false);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      remember_me: false,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value, {
        onSuccess: () => {
          toast.success('¡Sesión iniciada!');
          router.push('/dashboard');
        },
        onError: (error) => {
          const message =
            error instanceof Error
              ? error.message
              : 'Error de conexión con el servidor';
          toast.error(message);
        },
      });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className='bg-shGray-800 border-shGray-700/60 w-full max-w-md rounded-3xl border p-8'
      style={{
        boxShadow: '10px 10px 30px #000000, -15px -15px 30px #171616',
      }}
    >
      <div className='mb-8 text-center lg:mb-12'>
        <h2 className='text-shGray-200 text-2xl font-semibold'>Bienvenido</h2>
        <p className='text-shGray-500 mt-2 text-sm'>
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className='space-y-5'
      >
        {/* Campo Email */}
        <form.Field
          name='email'
          validators={{
            onChange: loginSchema.shape.email,
          }}
          children={(field) => (
            <FormField
              name='email'
              label='Correo electrónico'
              placeholder='ejemplo@winba.com'
              icon={Mail}
              field={field}
            />
          )}
        />

        {/* Campo Password */}
        <form.Field
          name='password'
          validators={{
            onChange: loginSchema.shape.password,
          }}
          children={(field) => <PasswordField field={field} icon={Lock} />}
        />

        {/* Recordarme Checkbox */}
        <div className='flex items-center gap-2'>
          <button
            type='button'
            role='checkbox'
            aria-checked={rememberMe}
            id='remember_me'
            onClick={() => {
              const next = !rememberMe;
              setRememberMe(next);
              form.setFieldValue('remember_me', next);
            }}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all duration-200 ${
              rememberMe
                ? 'border-shPrimary-500 bg-shPrimary-500 text-white'
                : 'border-shGray-600 bg-shGray-800 hover:border-shGray-500'
            }`}
          >
            {rememberMe && (
              <svg
                className='h-3 w-3'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={3}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M5 13l4 4L19 7'
                />
              </svg>
            )}
          </button>
          <label
            htmlFor='remember_me'
            className='text-shGray-400 cursor-pointer text-sm select-none'
            onClick={() => {
              const next = !rememberMe;
              setRememberMe(next);
              form.setFieldValue('remember_me', next);
            }}
          >
            Recordarme por 30 días
          </label>
        </div>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type='submit'
              disabled={!canSubmit}
              loading={mutation.isPending}
              loadingText='Validando...'
              fullWidth
              scale='102'
            >
              Iniciar Sesión
            </Button>
          )}
        />
      </form>

      <p className='mt-8 border-t border-zinc-700 pt-6 text-center text-sm text-zinc-500'>
        Acceso seguro con encriptación de extremo a extremo
      </p>
    </motion.div>
  );
}
