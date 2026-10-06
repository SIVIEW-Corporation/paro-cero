'use client';

import { useForm } from '@tanstack/react-form';
import { useCreateAssetMutation } from '@/app/(portal)/assets/hooks/use-create-asset-mutation';
import { newAssetSchema } from './lib/new-asset-schema';
import * as motion from 'motion/react-client';
import {
  Tag,
  Hash,
  MapPin,
  Fingerprint,
  Cpu,
  Factory,
  Banknote,
  Activity,
  AlertTriangle,
  Calendar,
  PackagePlus,
} from 'lucide-react';
import { FormField } from '@/global-components/FormField';
import Button from '@/global-components/Button';

interface NewAssetFormProps {
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

export default function NewAssetForm({ company_id }: NewAssetFormProps) {
  const createAsset = useCreateAssetMutation();

  const form = useForm({
    defaultValues: {
      name: '',
      code: '',
      area: '',
      serial: '',
      model: '',
      manufacturer: '',
      cost: undefined as number | undefined,
      companyId: company_id || '',
      status: 'operational' as
        | 'commissioning'
        | 'operational'
        | 'standby'
        | 'maintenance'
        | 'down'
        | 'decommissioned',
      criticality: 'medium' as 'low' | 'medium' | 'high' | 'critical',
      installedAt: null as Date | null,
    },
    onSubmit: async ({ value }) => {
      try {
        await createAsset.mutateAsync(value);
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
            Nuevo activo
          </h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className='text-shNeutral-500 font-inter text-sm'
        >
          Completa el formulario para registrar un nuevo asset en la plataforma.
        </motion.p>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className='border-shNeutral-200 somecard overflow-hidden rounded-2xl border bg-white p-5 md:p-6'
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          {/* Hidden companyId field for validation */}
          <form.Field
            name='companyId'
            validators={{
              onChange: newAssetSchema.shape.companyId,
            }}
            children={(field) => (
              <input
                type='hidden'
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          />

          {/* Section 1: Required Fields */}
          <div>
            <motion.h3
              custom={0}
              initial='hidden'
              animate='visible'
              variants={fieldAnimation}
              className='text-shNeutral-700 font-inter mb-4 text-xs font-bold tracking-wider uppercase'
            >
              Datos requeridos
            </motion.h3>

            {/* Row 1: Nombre + Código */}
            <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
              <form.Field
                name='name'
                validators={{
                  onChange: newAssetSchema.shape.name,
                }}
                children={(field) => (
                  <FormField
                    name='name'
                    label='Nombre'
                    placeholder='Motor principal'
                    icon={Tag}
                    field={field}
                  />
                )}
              />
              <form.Field
                name='code'
                validators={{
                  onChange: newAssetSchema.shape.code,
                }}
                children={(field) => (
                  <FormField
                    name='code'
                    label='Código'
                    placeholder='EQP-001'
                    icon={Hash}
                    field={field}
                  />
                )}
              />
            </div>

            {/* Row 2: Área (full width) */}
            <div className='mt-5'>
              <form.Field
                name='area'
                validators={{
                  onChange: newAssetSchema.shape.area,
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
          </div>

          {/* Section Separator */}
          <div className='border-shNeutral-100 mt-6 border-t pt-6 lg:mt-8 lg:pt-8'>
            {/* Section 2: Optional Fields */}
            <motion.h3
              custom={1}
              initial='hidden'
              animate='visible'
              variants={fieldAnimation}
              className='text-shNeutral-700 font-inter mb-4 text-xs font-bold tracking-wider uppercase'
            >
              Datos opcionales
            </motion.h3>

            {/* Row 1: Serial + Modelo */}
            <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
              <form.Field
                name='serial'
                validators={{
                  onChange: newAssetSchema.shape.serial.unwrap(),
                }}
                children={(field) => (
                  <FormField
                    name='serial'
                    label='Serial'
                    placeholder='SN-2024-001'
                    icon={Fingerprint}
                    field={field}
                  />
                )}
              />
              <form.Field
                name='model'
                validators={{
                  onChange: newAssetSchema.shape.model.unwrap(),
                }}
                children={(field) => (
                  <FormField
                    name='model'
                    label='Modelo'
                    placeholder='XYZ-5000'
                    icon={Cpu}
                    field={field}
                  />
                )}
              />
            </div>

            {/* Row 2: Fabricante + Costo */}
            <div className='mt-5 grid grid-cols-1 gap-5 md:grid-cols-2'>
              <form.Field
                name='manufacturer'
                validators={{
                  onChange: newAssetSchema.shape.manufacturer.unwrap(),
                }}
                children={(field) => (
                  <FormField
                    name='manufacturer'
                    label='Fabricante'
                    placeholder='Siemens'
                    icon={Factory}
                    field={field}
                  />
                )}
              />
              <form.Field
                name='cost'
                validators={{
                  onChange: newAssetSchema.shape.cost,
                }}
                children={(field) => {
                  const costField = {
                    ...field,
                    state: {
                      ...field.state,
                      value:
                        field.state.value === undefined
                          ? ''
                          : field.state.value,
                    },
                    handleChange: (value: string) => {
                      if (value === '') {
                        return field.handleChange(undefined);
                      }
                      return field.handleChange(Number(value));
                    },
                  };
                  return (
                    <FormField
                      name='cost'
                      label='Costo'
                      placeholder='0.00'
                      type='number'
                      icon={Banknote}
                      field={costField}
                    />
                  );
                }}
              />
            </div>

            {/* Row 3: Estado + Criticidad */}
            <div className='mt-5 grid grid-cols-1 gap-5 md:grid-cols-2'>
              <form.Field
                name='status'
                validators={{
                  onChange: newAssetSchema.shape.status.removeDefault(),
                }}
                children={(field) => (
                  <div className='group'>
                    <label
                      htmlFor='status'
                      className='text-shNeutral-700 group-focus-within:text-shPrimary-700 mb-1.5 block text-xs font-medium transition-colors duration-300'
                    >
                      Estado
                    </label>
                    <div className='custom-select-container border-shNeutral-200 focus-within:border-shPrimary-500 focus-within:ring-shPrimary-500/15 flex items-center overflow-hidden rounded-lg border bg-white transition-all focus-within:ring-2'>
                      <div className='text-shNeutral-600 group-focus-within:text-shPrimary-700 flex w-12 shrink-0 items-center justify-center transition-colors'>
                        <Activity size={16} />
                      </div>
                      <select
                        id='status'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            () =>
                              e.target.value as
                                | 'commissioning'
                                | 'operational'
                                | 'standby'
                                | 'maintenance'
                                | 'down'
                                | 'decommissioned',
                          )
                        }
                        className='text-shNeutral-900 border-shNeutral-100! bg-shNeutral-50! flex-1 cursor-pointer appearance-none rounded-none! border-0! border-l! py-2.5 pr-12 pl-2 shadow-inner! ring-0! outline-none!'
                      >
                        <option value='commissioning'>En instalación</option>
                        <option value='operational'>Operando</option>
                        <option value='standby'>En espera</option>
                        <option value='maintenance'>En mantenimiento</option>
                        <option value='down'>Fuera de servicio</option>
                        <option value='decommissioned'>Dado de baja</option>
                      </select>
                    </div>
                  </div>
                )}
              />

              <form.Field
                name='criticality'
                validators={{
                  onChange: newAssetSchema.shape.criticality.removeDefault(),
                }}
                children={(field) => (
                  <div className='group'>
                    <label
                      htmlFor='criticality'
                      className='text-shNeutral-700 group-focus-within:text-shPrimary-700 mb-1.5 block text-xs font-medium transition-colors duration-300'
                    >
                      Criticidad
                    </label>
                    <div className='custom-select-container border-shNeutral-200 focus-within:border-shPrimary-500 focus-within:ring-shPrimary-500/15 flex items-center overflow-hidden rounded-lg border bg-white transition-all focus-within:ring-2'>
                      <div className='text-shNeutral-600 group-focus-within:text-shPrimary-700 flex w-12 shrink-0 items-center justify-center transition-colors'>
                        <AlertTriangle size={16} />
                      </div>
                      <select
                        id='criticality'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            () =>
                              e.target.value as
                                | 'low'
                                | 'medium'
                                | 'high'
                                | 'critical',
                          )
                        }
                        className='text-shNeutral-900 border-shNeutral-100! bg-shNeutral-50! flex-1 cursor-pointer appearance-none rounded-none! border-0! border-l! py-2.5 pr-12 pl-2 shadow-inner! ring-0! outline-none!'
                      >
                        <option value='low'>Baja</option>
                        <option value='medium'>Media</option>
                        <option value='high'>Alta</option>
                        <option value='critical'>Crítica</option>
                      </select>
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Row 4: Fecha instalación (full width) */}
            <div className='mt-5'>
              <form.Field
                name='installedAt'
                validators={{
                  onChange: newAssetSchema.shape.installedAt.unwrap(),
                }}
                children={(field) => (
                  <div className='group'>
                    <label
                      htmlFor='installedAt'
                      className='text-shNeutral-700 group-focus-within:text-shPrimary-700 mb-1.5 block text-xs font-medium transition-colors duration-300'
                    >
                      Fecha instalación
                    </label>
                    <div className='border-shNeutral-200 focus-within:border-shPrimary-500 focus-within:ring-shPrimary-500/15 flex items-center overflow-hidden rounded-lg border bg-white transition-all focus-within:ring-2'>
                      <div className='text-shNeutral-600 group-focus-within:text-shPrimary-700 flex w-12 shrink-0 items-center justify-center transition-colors'>
                        <Calendar size={16} />
                      </div>
                      <input
                        id='installedAt'
                        type='date'
                        value={
                          field.state.value instanceof Date
                            ? field.state.value.toISOString().split('T')[0]
                            : ''
                        }
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.handleChange(
                            val ? new Date(val + 'T00:00:00') : null,
                          );
                        }}
                        className='text-shNeutral-900 border-shNeutral-100! bg-shNeutral-50! flex-1 appearance-none rounded-none! border-0! border-l! py-2.5 pr-4 pl-2 shadow-inner! ring-0! outline-none!'
                      />
                    </div>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className='flex items-center justify-end gap-3 pt-6'
          >
            <form.Subscribe
              selector={(state) => {
                const v = state.values;
                const allFilled =
                  v.name.length > 0 &&
                  v.code.length > 0 &&
                  v.area.length > 0 &&
                  v.companyId.length > 0;
                return [allFilled && state.canSubmit, state.isSubmitting];
              }}
              children={([canSubmit]) => (
                <Button
                  type='submit'
                  disabled={!canSubmit || createAsset.isPending}
                  loading={createAsset.isPending}
                  loadingText='Creando...'
                  icon={<PackagePlus size={18} />}
                  scale='101'
                  variant='primary'
                  intent='accent'
                  fullWidth={true}
                >
                  Crear activo
                </Button>
              )}
            />
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}
