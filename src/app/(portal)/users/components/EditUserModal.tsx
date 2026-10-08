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
  TriangleAlert,
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FormField, PasswordField } from '@/global-components/FormField';
import Button from '@/global-components/Button';
import type { User as UserType } from '@/store/auth-store';
import { getRoleLabel } from '@/features/technician/access';
import {
  ROLE_CHANGE_WARNING,
  buildEditUserValues,
  editUserSchema,
  hasRoleChanged,
} from '../lib/edit-user-schema';
import {
  EDITABLE_ROLES,
  isEditableRole,
  type CreatableRole,
  type EditableRole,
} from '../lib/user-role-options';
import { useUpdateUserMutation } from '../hooks/use-update-user-mutation';

interface EditUserModalProps {
  isOpen: boolean;
  user: UserType;
  onClose: () => void;
}

export default function EditUserModal({
  isOpen,
  user,
  onClose,
}: EditUserModalProps) {
  const updateUser = useUpdateUserMutation();

  // Supervisor, Operador and Visor can be reassigned in any direction; any
  // other role (superadmin or unrecognized) is read-only and never sent back.
  const isRoleLocked = !isEditableRole(user.role);

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: user.email ?? '',
      fullName: user.full_name ?? '',
      role: user.role as CreatableRole,
      area: user.area ?? '',
      jobTitle: user.job_title ?? '',
      profileImage: user.profile_image ?? '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      // Role is sent only when it changes (the API then revokes sessions).
      const values = buildEditUserValues(value, user.role);
      await updateUser.mutateAsync({ id: user.id, values });
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
                            field.handleChange(
                              () => e.target.value as EditableRole,
                            )
                          }
                          disabled={isRoleLocked}
                          className={cn(
                            'text-shNeutral-900 placeholder:text-shNeutral-500 flex-1 appearance-none border-0! bg-transparent! py-2.5 pr-4 ring-0! outline-none!',
                            isRoleLocked &&
                              'text-shNeutral-500 cursor-not-allowed',
                          )}
                        >
                          {(isRoleLocked ? [user.role] : EDITABLE_ROLES).map(
                            (value) => (
                              <option key={value} value={value}>
                                {getRoleLabel(value)}
                              </option>
                            ),
                          )}
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
                      {hasRoleChanged(user.role, field.state.value) && (
                        <p
                          role='status'
                          className='bg-shDanger-50 border-shDanger-200 text-shDanger-700 mt-2 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs font-medium'
                        >
                          <TriangleAlert
                            size={14}
                            className='mt-0.5 shrink-0'
                            aria-hidden='true'
                          />
                          {ROLE_CHANGE_WARNING}
                        </p>
                      )}
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
