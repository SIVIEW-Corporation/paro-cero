'use client';

import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { Mail, Lock } from 'lucide-react';

import { loginSchema } from '@/lib/auth-schema';
import { useLoginMutation } from '@/hooks/use-login-mutation';
import { FormField, PasswordField } from '@/global-components/form-field';
import Button from '@/global-components/Button';

export default function LoginForm() {
  const router = useRouter();
  const mutation = useLoginMutation();

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
    <div className='border-shNeutral-200 [@media(hover:hover)_and_(pointer:fine)]:hover:border-shAccent-500/30 relative w-full max-w-md overflow-hidden rounded-3xl border bg-white p-6 shadow-2xl backdrop-blur transition-[border-color,box-shadow,background-color] duration-300 ease-out motion-reduce:transition-none sm:p-8 lg:p-10 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-2xl'>
      <div className='from-shAccent-500/10 via-shAccent-400/50 pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r to-transparent' />
      <div className='from-shAccent-500/10 pointer-events-none absolute -top-24 right-8 h-40 w-40 rounded-full bg-gradient-to-br to-transparent blur-3xl' />

      <div className='relative mb-8 text-center'>
        <div className='bg-shAccent-500 mx-auto mb-5 h-1 w-14 rounded-full' />
        <h2 className='text-shNeutral-900 text-2xl font-semibold tracking-[-0.02em]'>
          Iniciar sesión
        </h2>
        <p className='text-shNeutral-500 mt-2 text-sm leading-6'>
          Ingresa tus credenciales para continuar.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className='relative space-y-5'
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
              type='email'
              label='Correo electrónico'
              placeholder='ejemplo@winba.com'
              icon={Mail}
              field={field}
              autocomplete='email'
            />
          )}
        />

        {/* Campo Password */}
        <form.Field
          name='password'
          validators={{
            onChange: loginSchema.shape.password,
          }}
          children={(field) => (
            <PasswordField
              field={field}
              icon={Lock}
              name='password'
              autocomplete='current-password'
            />
          )}
        />

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit]) => (
            <Button
              type='submit'
              intent='accent'
              variant='primary'
              disabled={!canSubmit}
              aria-busy={mutation.isPending}
              loading={mutation.isPending}
              loadingText='Iniciando sesión...'
              fullWidth
              className='mt-10 min-h-11 rounded-xl'
            >
              Iniciar sesión
            </Button>
          )}
        />
      </form>

      <p className='border-shNeutral-200 text-shNeutral-500 mt-8 border-t pt-6 text-center text-sm'>
        Acceso seguro a la plataforma PM0.
      </p>
    </div>
  );
}
