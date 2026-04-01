'use client';

import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import * as motion from 'motion/react-client';

import { loginSchema } from '@/lib/auth-schema';
import { useLoginMutation } from '@/hooks/use-login-mutation';

export default function LoginForm() {
  const router = useRouter();
  const mutation = useLoginMutation();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
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
            <div className='flex flex-col gap-1.5'>
              <label
                htmlFor={field.name}
                className='text-shGray-400 text-sm font-medium'
              >
                Correo electrónico
              </label>
              <input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder='ejemplo@winba.com'
                className={`bg-shGray-800 rounded-lg border px-4 py-2.5 text-zinc-100 transition-all outline-none placeholder:text-zinc-500 ${
                  field.state.meta.errors.length > 0
                    ? 'border-red-500 focus:ring-0'
                    : 'focus:border-shPrimary-400 border-shGray-600 focus:ring-0'
                }`}
              />
              {/* CORRECCIÓN: Mapeo de errores para evitar [object Object] */}
              {field.state.meta.errors.length > 0 && (
                <p className='text-xs font-medium text-red-500'>
                  {field.state.meta.errors
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map((err: any) =>
                      typeof err === 'object' ? err.message : err,
                    )
                    .join(', ')}
                </p>
              )}
            </div>
          )}
        />

        {/* Campo Password */}
        <form.Field
          name='password'
          validators={{
            onChange: loginSchema.shape.password,
          }}
          children={(field) => (
            <div className='flex flex-col gap-1.5'>
              <label
                htmlFor={field.name}
                className='text-shGray-400 text-sm font-medium'
              >
                Contraseña
              </label>
              <input
                id={field.name}
                type='password'
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder='••••••••'
                className={`bg-shGray-800 rounded-lg border px-4 py-2.5 text-zinc-100 transition-all outline-none placeholder:text-zinc-500 ${
                  field.state.meta.errors.length > 0
                    ? 'border-red-500 focus:ring-0'
                    : 'focus:border-shPrimary-400 border-shGray-600 focus:ring-0'
                }`}
              />
              {field.state.meta.errors.length > 0 && (
                <p className='text-xs font-medium text-red-500'>
                  {field.state.meta.errors
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map((err: any) =>
                      typeof err === 'object' ? err.message : err,
                    )
                    .join('\n')}
                </p>
              )}
            </div>
          )}
        />

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button
              type='submit'
              disabled={!canSubmit || mutation.isPending}
              className='bg-shPrimary-500 hover:bg-shPrimary-400 shadow-shPrimary-800/10 mt-4 w-full cursor-pointer rounded-lg py-3 font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:shadow-none'
            >
              {mutation.isPending || isSubmitting ? (
                <span className='flex items-center justify-center gap-2'>
                  <svg
                    className='h-4 w-4 animate-spin text-white'
                    xmlns='http://www.w3.org/2000/svg'
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
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Validando...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          )}
        />
      </form>

      <p className='mt-8 border-t border-zinc-700 pt-6 text-center text-sm text-zinc-500'>
        Acceso seguro con encriptación de extremo a extremo
      </p>
    </motion.div>
  );
}
