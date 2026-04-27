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
    <div className='border-app-border-soft [@media(hover:hover)_and_(pointer:fine)]:hover:border-app-brand/30 relative w-full max-w-md overflow-hidden rounded-3xl border bg-white/95 p-6 shadow-[0_24px_80px_rgb(15_23_42_/_0.12)] backdrop-blur transition-[transform,border-color,box-shadow,background-color] duration-300 ease-out motion-reduce:transition-none sm:p-8 lg:p-10 [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_30px_90px_rgb(15_23_42_/_0.16)] motion-reduce:[@media(hover:hover)_and_(pointer:fine)]:hover:translate-y-0'>
      <div className='from-app-brand/12 pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r via-amber-300/70 to-transparent' />
      <div className='from-app-brand/8 pointer-events-none absolute -top-24 right-8 h-40 w-40 rounded-full bg-gradient-to-br to-transparent blur-3xl' />

      <div className='relative mb-8 text-center'>
        <div className='bg-app-brand mx-auto mb-5 h-1 w-14 rounded-full' />
        <h2 className='text-app-text-primary text-2xl font-semibold tracking-[-0.02em]'>
          Iniciar sesión
        </h2>
        <p className='text-app-text-secondary mt-2 text-sm leading-6'>
          Ingresa tus credenciales para continuar.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className='relative space-y-5 [&_.group>div:has(input)]:border-app-border-soft [&_.group>div:has(input)]:rounded-xl [&_.group>div:has(input)]:bg-white/95 [&_.group>div:has(input)]:shadow-[0_1px_2px_rgb(15_23_42_/_0.04)] [&_.group>div:has(input)]:transition-[background-color,border-color,box-shadow] [&_.group>div:has(input)]:duration-200 [&_.group>div:has(input)]:ease-out [&_.group>div:has(input:focus)]:border-app-brand [&_.group>div:has(input:focus)]:bg-white [&_.group>div:has(input:focus)]:shadow-[0_0_0_4px_rgb(216_155_43_/_0.12),0_8px_22px_rgb(15_23_42_/_0.06)] [&_.group:focus-within_label]:text-app-brand-dark [&_.group:focus-within_svg]:text-app-brand-dark motion-reduce:[&_.group>div:has(input)]:transition-none [&_button[type=button]]:rounded-lg [&_button[type=button]]:text-app-text-secondary [&_button[type=button]]:transition-[background-color,color,box-shadow,transform] [&_button[type=button]]:duration-200 [&_button[type=button]]:ease-out [&_button[type=button]:hover]:bg-app-brand-soft/60 [&_button[type=button]:hover]:text-app-text-primary [&_button[type=button]:active]:scale-[0.98] [&_button[type=button]:focus-visible]:ring-app-brand [&_button[type=button]:focus-visible]:ring-2 [&_button[type=button]:focus-visible]:ring-offset-2 [&_button[type=button]:focus-visible]:ring-offset-white [&_button[type=button]:focus-visible]:outline-none motion-reduce:[&_button[type=button]]:transition-none motion-reduce:[&_button[type=button]:active]:scale-100'
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
              autocomplete='username'
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
              disabled={!canSubmit}
              aria-busy={mutation.isPending}
              loading={mutation.isPending}
              loadingText='Iniciando sesión...'
              fullWidth
              scale='101'
              className='bg-app-brand hover:bg-app-brand-dark focus-visible:ring-app-brand disabled:hover:bg-app-brand mt-10 min-h-11 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgb(216_155_43_/_0.24)] ring-offset-2 ring-offset-white transition-[background-color,box-shadow,transform,opacity] duration-200 ease-out hover:shadow-[0_16px_32px_rgb(216_155_43_/_0.28)] focus-visible:ring-2 focus-visible:outline-none active:translate-y-px active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:active:scale-100 [&_svg]:size-4 [&_svg]:text-white/90 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 motion-reduce:[&_svg]:animate-none'
            >
              Iniciar sesión
            </Button>
          )}
        />
      </form>

      <p className='border-app-border-soft text-app-text-secondary mt-8 border-t pt-6 text-center text-sm'>
        Acceso seguro a la plataforma PM0.
      </p>
    </div>
  );
}
