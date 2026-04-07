'use client';

import { useForm } from '@tanstack/react-form';

import { newUserSchema } from './lib/new-user-schema';
import { useAuthStore } from '@/store/auth-store';
import { useCreateUserMutation } from '@/hooks/use-create-user-mutation';

export default function Users() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const createUser = useCreateUserMutation();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      role: 'operator' as 'operator' | 'viewer',
      companyId: user?.company_id || '',
      area: '',
      jobTitle: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await createUser.mutateAsync(value);
        // Reset form on success
        form.reset();
      } catch {
        // Error handled by mutation hook via toast
      }
    },
  });

  // Admin guard — redirect non-admin users
  if (role !== 'admin' && role !== 'superadmin') {
    return (
      <main className='container mx-auto max-w-7xl border border-slate-800 pt-2'>
        <div className='flex flex-col items-center justify-center py-16'>
          <h2 className='text-shGray-200 text-xl font-bold'>
            Acceso restringido
          </h2>
          <p className='text-shGray-500 mt-2 text-sm'>
            Solo los administradores pueden crear usuarios.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className='container mx-auto max-w-7xl border border-slate-800 pt-2'>
      <section>
        <h1 className='font-inter mb-1 text-center text-xl font-bold md:mb-1.5 md:text-2xl xl:text-3xl'>
          Gestionar usuarios
        </h1>
        <p className='text-shGray-500 font-inter text-center text-xs md:text-sm xl:text-base'>
          Aquí podrás crear, editar y eliminar perfiles. También podrás asignar
          roles y permisos.
        </p>
      </section>

      <section className='mt-8'>
        <div className='mb-2 md:mb-4'>
          <h2 className='font-inter text-shGray-200 mb-1 text-lg font-bold md:mb-1.5 md:text-xl xl:text-2xl'>
            Crear nuevo usuario
          </h2>
          <p className='text-shGray-500 font-inter text-xs md:text-sm xl:text-base'>
            Completa el formulario para crear un nuevo usuario.
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
              onChange: newUserSchema.shape.email,
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
              onChange: newUserSchema.shape.password,
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

          {/* Campo Nombre Completo */}
          <form.Field
            name='fullName'
            validators={{
              onChange: newUserSchema.shape.fullName,
            }}
            children={(field) => (
              <div className='flex flex-col gap-1.5'>
                <label
                  htmlFor={field.name}
                  className='text-shGray-400 text-sm font-medium'
                >
                  Nombre completo
                </label>
                <input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Esteban Rodriguez Barrios'
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
                      .join(', ')}
                  </p>
                )}
              </div>
            )}
          />

          {/* Campo Rol */}
          <form.Field
            name='role'
            children={(field) => (
              <div className='flex flex-col gap-1.5'>
                <label
                  htmlFor={field.name}
                  className='text-shGray-400 text-sm font-medium'
                >
                  Rol
                </label>
                <select
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(
                      () => e.target.value as 'operator' | 'viewer',
                    )
                  }
                  className={`bg-shGray-800 rounded-lg border px-4 py-2.5 text-zinc-100 transition-all outline-none ${
                    field.state.meta.errors.length > 0
                      ? 'border-red-500 focus:ring-0'
                      : 'focus:border-shPrimary-400 border-shGray-600 focus:ring-0'
                  }`}
                >
                  <option value='operator'>Operador</option>
                  <option value='viewer'>Visor</option>
                </select>
              </div>
            )}
          />

          {/* Campo Area */}
          <form.Field
            name='area'
            validators={{
              onChange: newUserSchema.shape.area,
            }}
            children={(field) => (
              <div className='flex flex-col gap-1.5'>
                <label
                  htmlFor={field.name}
                  className='text-shGray-400 text-sm font-medium'
                >
                  Área
                </label>
                <input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Mantenimiento'
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
                      .join(', ')}
                  </p>
                )}
              </div>
            )}
          />

          {/* Campo Puesto */}
          <form.Field
            name='jobTitle'
            validators={{
              onChange: newUserSchema.shape.jobTitle,
            }}
            children={(field) => (
              <div className='flex flex-col gap-1.5'>
                <label
                  htmlFor={field.name}
                  className='text-shGray-400 text-sm font-medium'
                >
                  Puesto
                </label>
                <input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Técnico de Campo'
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
                      .join(', ')}
                  </p>
                )}
              </div>
            )}
          />

          {/* Submit Button */}
          <div className='flex justify-end pt-2'>
            <button
              type='submit'
              disabled={createUser.isPending}
              className='bg-shPrimary-600 hover:bg-shPrimary-500 disabled:bg-shPrimary-800 rounded-lg px-6 py-2.5 font-medium text-white transition-all'
            >
              {createUser.isPending ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
