'use client';

import { Building2, FileText, Plus, Save, ToggleRight, X } from 'lucide-react';
import * as motion from 'motion/react-client';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { FormField } from '@/global-components/FormField';
import Button from '@/global-components/Button';
import {
  buildCompanyCreatePayload,
  buildCompanyUpdatePayload,
  companyFormSchema,
  companyToFormValues,
  EMPTY_COMPANY_FORM_VALUES,
  hasCompanyChanges,
  type CompanyFormValues,
} from '../../lib/company-schema';
import {
  isCompanyApiError,
  type Company,
  type CompanyField,
} from '../../services/companies-service';
import {
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
} from '../../hooks/use-companies-mutations';

interface CompanyFormModalProps {
  /** Company to edit; omit to create a new one. */
  company?: Company | null;
  onClose: () => void;
}

export default function CompanyFormModal({
  company,
  onClose,
}: CompanyFormModalProps) {
  const isEdit = Boolean(company);
  const createCompany = useCreateCompanyMutation();
  const updateCompany = useUpdateCompanyMutation();
  const isPending = createCompany.isPending || updateCompany.isPending;

  const submit = async (value: CompanyFormValues) => {
    const parsed = companyFormSchema.safeParse(value);
    if (!parsed.success) {
      toast.error('Revisa los campos de la empresa.');
      return;
    }

    if (!company) {
      await createCompany.mutateAsync(buildCompanyCreatePayload(value));
      onClose();
      return;
    }

    const payload = buildCompanyUpdatePayload(company, value);
    if (!hasCompanyChanges(payload)) {
      toast.info('No hay cambios para guardar.');
      onClose();
      return;
    }
    await updateCompany.mutateAsync({ id: company.id, payload });
    onClose();
  };

  const form = useForm({
    defaultValues: company
      ? companyToFormValues(company)
      : EMPTY_COMPANY_FORM_VALUES,
    onSubmit: async ({ value }) => {
      try {
        await submit(value);
      } catch (error) {
        // Toast is shown by the mutation hook; surface field-level errors.
        if (!isCompanyApiError(error)) return;
        if (error.status === 404) {
          onClose();
          return;
        }
        for (const field of Object.keys(error.fieldErrors) as CompanyField[]) {
          const message = error.fieldErrors[field];
          form.setFieldMeta(field, (meta) => ({
            ...meta,
            isTouched: true,
            errorMap: { ...meta.errorMap, onServer: message },
          }));
        }
      }
    },
  });

  /** A server error belongs to the submitted value; drop it once edited. */
  const clearServerError = (field: CompanyField) => {
    form.setFieldMeta(field, (meta) =>
      meta.errorMap.onServer
        ? { ...meta, errorMap: { ...meta.errorMap, onServer: undefined } }
        : meta,
    );
  };

  return (
    <div
      className='bg-shNeutral-900/35 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className='border-shNeutral-200 w-full max-w-xl rounded-2xl border bg-white shadow-lg'
        onClick={(e) => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-labelledby='company-form-title'
      >
        {/* Header */}
        <div className='border-shNeutral-200 flex items-center justify-between border-b px-6 py-4'>
          <h2
            id='company-form-title'
            className='text-shNeutral-900 text-lg font-bold'
          >
            {isEdit ? 'Editar empresa' : 'Nueva empresa'}
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
          <div className='max-h-[calc(100vh-16rem)] space-y-5 overflow-y-auto px-4 py-5 sm:px-6'>
            <form.Field
              name='name'
              validators={{ onChange: companyFormSchema.shape.name }}
              listeners={{ onChange: () => clearServerError('name') }}
              children={(field) => (
                <FormField
                  name='name'
                  label='Nombre'
                  placeholder='Industrias del Norte S.A. de C.V.'
                  icon={Building2}
                  field={field}
                />
              )}
            />

            <form.Field
              name='rfc'
              validators={{ onChange: companyFormSchema.shape.rfc }}
              listeners={{ onChange: () => clearServerError('rfc') }}
              children={(field) => (
                <FormField
                  name='rfc'
                  label='RFC'
                  placeholder='INO010203AB1'
                  icon={FileText}
                  field={field}
                  autocomplete='off'
                />
              )}
            />

            <form.Field
              name='active'
              listeners={{ onChange: () => clearServerError('active') }}
              children={(field) => (
                <div className='group'>
                  <label
                    htmlFor='company-active'
                    className='text-shNeutral-700 group-focus-within:text-shPrimary-700 mb-1.5 block text-xs font-medium transition-colors duration-300'
                  >
                    Estado
                  </label>
                  <div className='border-shNeutral-200 focus-within:border-shPrimary-500 focus-within:ring-shPrimary-500/15 flex items-center overflow-hidden rounded-lg border bg-white transition-all focus-within:ring-2'>
                    <div className='text-shNeutral-600 group-focus-within:text-shPrimary-700 flex w-12 shrink-0 items-center justify-center transition-colors'>
                      <ToggleRight size={16} />
                    </div>
                    <select
                      id='company-active'
                      value={field.state.value ? '1' : '0'}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.target.value === '1')
                      }
                      className='text-shNeutral-900 border-shNeutral-100! bg-shNeutral-50! flex-1 cursor-pointer appearance-none rounded-none! border-0! border-l! py-2.5 pr-12 pl-2 shadow-inner! ring-0! outline-none!'
                    >
                      <option value='1'>Activa</option>
                      <option value='0'>Inactiva</option>
                    </select>
                  </div>
                  {field.state.meta.errorMap.onServer ? (
                    <p className='text-shDanger-700 mt-1.5 text-xs font-medium'>
                      {String(field.state.meta.errorMap.onServer)}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </div>

          {/* Footer */}
          <div className='border-shNeutral-200 flex gap-3 border-t px-6 py-4'>
            <Button
              type='button'
              onClick={onClose}
              disabled={isPending}
              intent='neutral'
              variant='secondary'
              fullWidth
            >
              Cancelar
            </Button>
            <form.Subscribe
              selector={(state) => state.canSubmit}
              children={(canSubmit) => (
                <Button
                  type='submit'
                  disabled={!canSubmit || isPending}
                  loading={isPending}
                  loadingText='Guardando...'
                  icon={isEdit ? <Save size={18} /> : <Plus size={18} />}
                  intent='accent'
                  variant='primary'
                  fullWidth
                >
                  {isEdit ? 'Guardar cambios' : 'Crear empresa'}
                </Button>
              )}
            />
          </div>
        </form>
      </motion.div>
    </div>
  );
}
