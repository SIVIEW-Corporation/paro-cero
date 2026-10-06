'use client';

import {
  X,
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
  Save,
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { useForm } from '@tanstack/react-form';
import type { Asset } from '@/store/auth-store';
import { newAssetSchema } from '../lib/new-asset-schema';
import { useUpdateAssetMutation } from '../hooks/use-update-asset-mutation';
import { FormField } from '@/global-components/FormField';
import Button from '@/global-components/Button';

interface EditAssetModalProps {
  isOpen: boolean;
  asset: Asset;
  onClose: () => void;
}

export default function EditAssetModal({
  isOpen,
  asset,
  onClose,
}: EditAssetModalProps) {
  const updateAsset = useUpdateAssetMutation();

  const form = useForm({
    defaultValues: {
      name: asset.name,
      code: asset.code,
      area: asset.area,
      serial: asset.serial ?? '',
      model: asset.model ?? '',
      manufacturer: asset.manufacturer ?? '',
      cost: asset.cost ?? undefined,
      status: asset.status,
      criticality: asset.criticality,
      installedAt: asset.installed_at ? new Date(asset.installed_at) : null,
    },
    onSubmit: async ({ value }) => {
      const values: Record<string, unknown> = {};

      if (value.name !== '') values.name = value.name;
      if (value.code !== '') values.code = value.code;
      if (value.area !== '') values.area = value.area;
      if (value.serial !== '') values.serial = value.serial;
      if (value.model !== '') values.model = value.model;
      if (value.manufacturer !== '') values.manufacturer = value.manufacturer;
      if (value.cost !== undefined) values.cost = value.cost;
      values.status = value.status;
      values.criticality = value.criticality;
      if (value.installedAt)
        values.installedAt = value.installedAt.toISOString();

      await updateAsset.mutateAsync({
        id: asset.id,
        values: values as {
          name?: string;
          area?: string;
          code?: string;
          serial?: string | null;
          model?: string | null;
          manufacturer?: string | null;
          cost?: number | null;
          status?: string;
          criticality?: string;
          installedAt?: string | null;
          isActive?: boolean;
        },
      });
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
            Editar activo
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

              {/* Row 2: Área + Serial */}
              <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
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
                <form.Field
                  name='serial'
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
              </div>

              {/* Row 3: Modelo + Fabricante */}
              <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                <form.Field
                  name='model'
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
                <form.Field
                  name='manufacturer'
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
              </div>

              {/* Row 4: Costo + Estado */}
              <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                <form.Field
                  name='cost'
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
                <form.Field
                  name='status'
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
              </div>

              {/* Row 5: Criticidad + Fecha instalación */}
              <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                <form.Field
                  name='criticality'
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
                <form.Field
                  name='installedAt'
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
          </div>

          {/* Footer */}
          <div className='border-shNeutral-200 flex gap-3 border-t px-6 py-4'>
            <Button
              type='button'
              onClick={onClose}
              disabled={updateAsset.isPending}
              intent='neutral'
              variant='secondary'
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              loading={updateAsset.isPending}
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
