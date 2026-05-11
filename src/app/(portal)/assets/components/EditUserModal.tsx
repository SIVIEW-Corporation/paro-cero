'use client';

import {
  X,
  Mail,
  User,
  Briefcase,
  MapPin,
  Shield,
  Image,
  Save,
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FormField, PasswordField } from '@/global-components/form-field';
import Button from '@/global-components/Button';
import type { User as UserType } from '@/store/auth-store';
import { editUserSchema } from '../lib/edit-user-schema';
import { useUpdateUserMutation } from '../hooks/use-update-user-mutation';

interface EditUserModalProps {
  isOpen: boolean;
  user: UserType;
  onClose: () => void;
}

const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
} as const;

type Role = (typeof ROLES)[keyof typeof ROLES];

const ALL_ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  supervisor: 'Supervisor',
  operator: 'Operador',
  viewer: 'Visor',
};

/** Roles que un usuario con permisos puede asignar desde el formulario de edición.
 *  admin/supervisor están excluidos — su rol no se puede modificar desde acá. */
const EDITABLE_ROLES: Role[] = [ROLES.OPERATOR, ROLES.VIEWER];

export default function EditUserModal({
  isOpen,
  user,
  onClose,
}: EditUserModalProps) {
  const updateUser = useUpdateUserMutation();

  const isPrivilegedRole =
    user.role === ROLES.ADMIN || user.role === ROLES.SUPERVISOR;

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: user.email ?? '',
      fullName: user.full_name ?? '',
      role: (user.role as Role) ?? ROLES.OPERATOR,
      area: user.area ?? '',
      jobTitle: user.job_title ?? '',
      profileImage: user.profile_image ?? '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      await updateUser.mutateAsync({ id: user.id, values: value });
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div
      className='bg-shNeutral-900/35 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className='border-shNeutral-200 w-full max-w-5xl rounded-2xl border bg-white shadow-lg'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='border-shNeutral-200 flex items-center justify-between border-b px-6 py-4'>
          <h2 className='text-shNeutral-900 text-lg font-bold'>
            Editar usuario
          </h2>
          <Button
            type='button'
            onClick={onClose}
            intent='neutral'
            variant='ghost'
            icon={<X size={18} />}
            aria-label='Cerrar'
            className='size-8 rounded-lg p-0'
          />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          {/* Body */}
          <div className='max-h-[calc(100vh-16rem)] overflow-y-auto px-4 py-5 sm:px-6 md:px-8'>
            <div className='space-y-5'>
              {/* Row 1: Email + Full Name */}
              <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                <form.Field
                  name='email'
                  validators={{
                    onChange: editUserSchema.shape.email.unwrap(),
                  }}
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
                <form.Field
                  name='fullName'
                  validators={{
                    onChange: editUserSchema.shape.fullName.unwrap(),
                  }}
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
              </div>

              {/* Row 2: Role + Area */}
              <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                <form.Field
                  name='role'
                  validators={{
                    onChange: editUserSchema.shape.role.unwrap(),
                  }}
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
                            field.handleChange(() => e.target.value as Role)
                          }
                          disabled={isPrivilegedRole}
                          className={cn(
                            'text-shNeutral-900 placeholder:text-shNeutral-500 flex-1 appearance-none border-0! bg-transparent! py-2.5 pr-4 ring-0! outline-none!',
                            isPrivilegedRole &&
                              'text-shNeutral-500 cursor-not-allowed',
                          )}
                        >
                          {(isPrivilegedRole
                            ? (Object.keys(ALL_ROLE_LABELS) as Role[])
                            : EDITABLE_ROLES
                          ).map((value) => (
                            <option key={value} value={value}>
                              {ALL_ROLE_LABELS[value]}
                            </option>
                          ))}
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
                <form.Field
                  name='area'
                  validators={{
                    onChange: editUserSchema.shape.area.unwrap(),
                  }}
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
              </div>

              {/* Row 3: Job Title + Profile Image */}
              <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                <form.Field
                  name='jobTitle'
                  validators={{
                    onChange: editUserSchema.shape.jobTitle.unwrap(),
                  }}
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
                <form.Field
                  name='profileImage'
                  validators={{
                    onChange: editUserSchema.shape.profileImage.unwrap(),
                  }}
                  children={(field) => (
                    <FormField
                      name='profileImage'
                      label='Imagen de perfil'
                      placeholder='https://...'
                      icon={Image}
                      field={field}
                    />
                  )}
                />
              </div>

              {/* Row 4: Password toggle */}
              <div className='space-y-4'>
                <label className='text-shNeutral-400 group hover:text-shPrimary-700 flex w-fit cursor-pointer items-center gap-3 rounded-lg bg-white p-3.5 transition-colors'>
                  <div
                    className={cn(
                      'group-hover:border-shPrimary-600 flex size-5 shrink-0 items-center justify-center rounded border transition-colors',
                      showPassword
                        ? 'border-shPrimary-500 bg-shPrimary-500'
                        : 'border-shNeutral-400 bg-white',
                    )}
                  >
                    {showPassword && (
                      <svg
                        className='size-3 text-white'
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
                  </div>
                  <span className='text-sm font-medium'>
                    Cambiar contraseña
                  </span>
                  <input
                    type='checkbox'
                    checked={showPassword}
                    onChange={(e) => {
                      setShowPassword(e.target.checked);
                      if (!e.target.checked) {
                        form.setFieldValue('password', '');
                      }
                    }}
                    className='sr-only'
                  />
                </label>

                {showPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <form.Field
                      name='password'
                      validators={{
                        onChange: editUserSchema.shape.password.unwrap(),
                      }}
                      children={(field) => (
                        <PasswordField
                          field={field}
                          label='Nueva contraseña'
                          name='password'
                          autocomplete='new-password'
                        />
                      )}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='border-shNeutral-200 flex gap-3 border-t px-6 py-4'>
            <Button
              type='button'
              onClick={onClose}
              disabled={updateUser.isPending}
              intent='neutral'
              variant='secondary'
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              loading={updateUser.isPending}
              loadingText='Guardando...'
              icon={<Save size={18} />}
              intent='accent'
              variant='primary'
              fullWidth
            >
              Guardar cambios
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
