'use client';

import { useForm } from '@tanstack/react-form';
import { useCreateUserMutation } from '@/app/(portal)/users/hooks/use-newOperator-mutation';
import { newUserSchema } from './lib/new-user-schema';
import * as motion from 'motion/react-client';
import { Mail, User, Briefcase, MapPin, Shield, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormField, PasswordField } from '@/global-components/form-field';
import Button from '@/global-components/Button';

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
      <div className='mb-6 md:mb-8'>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className='mb-1 flex items-center gap-2'
        >
          <h2 className='font-inter text-shNeutral-900 text-lg font-bold md:text-xl xl:text-2xl'>
            Nuevo usuario
          </h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className='text-shNeutral-500 font-inter text-sm'
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
        className='border-shNeutral-200 overflow-hidden rounded-2xl border bg-white p-5 shadow-sm md:p-6'
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
                  <FormField
                    name='email'
                    label='Correo electrónico'
                    placeholder='ejemplo@winba.com'
                    type='email'
                    icon={Mail}
                    field={field}
                    autocomplete='off'
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
                children={(field) => (
                  <PasswordField field={field} autocomplete='new-password' />
                )}
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
                  <FormField
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
                  <div className='group'>
                    <label
                      htmlFor='role'
                      className='text-shNeutral-700 group-focus-within:text-shPrimary-700 mb-1.5 block text-xs font-medium transition-colors duration-300'
                    >
                      Rol
                    </label>
                    <div
                      className={cn(
                        'flex items-center overflow-hidden rounded-lg border bg-white transition-all',
                        'border-shNeutral-200 focus-within:border-shPrimary-500 focus-within:ring-shPrimary-500/15 focus-within:ring-2',
                      )}
                    >
                      <div className='text-shNeutral-600 group-focus-within:text-shPrimary-700 flex w-12 shrink-0 items-center justify-center transition-colors'>
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
                        className='text-shNeutral-900 placeholder:text-shNeutral-500 flex-1 appearance-none border-0! bg-transparent! py-2.5 pr-4 ring-0! outline-none!'
                      >
                        <option value='operator'>Operador</option>
                        <option value='viewer'>Visor</option>
                      </select>
                      <div className='text-shNeutral-600 flex w-12 shrink-0 items-center justify-center'>
                        <svg
                          className='h-4 w-4'
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
                  <FormField
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
                  <FormField
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
            className='flex items-center justify-end gap-3 pt-3 md:pt-4 lg:pt-6'
          >
            <Button
              type='submit'
              disabled={createUser.isPending}
              loading={createUser.isPending}
              loadingText='Creando...'
              icon={<UserPlus size={18} />}
              scale='101'
              variant='primary'
              intent='accent'
              fullWidth={true}
            >
              Crear usuario
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}
