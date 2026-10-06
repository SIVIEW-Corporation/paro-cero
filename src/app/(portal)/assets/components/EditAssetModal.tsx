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
  Save,
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { FormField } from '@/global-components/FormField';
import Button from '@/global-components/Button';
import {
  AssetCriticalitySelect,
  AssetInstalledAtInput,
  AssetStatusSelect,
  firstErrorMessage,
} from './asset-form-controls';
import { newAssetSchema } from '../lib/new-asset-schema';
import {
  assetToFormValues,
  buildAssetUpdatePayload,
  hasAssetChanges,
} from '../lib/asset-payload';
import { useUpdateAssetMutation } from '../hooks/use-update-asset-mutation';
import { isAssetApiError } from '../services/assets-service';
import type { Asset } from '../types';

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
    defaultValues: assetToFormValues(asset),
    onSubmit: async ({ value }) => {
      let payload;
      try {
        payload = buildAssetUpdatePayload(asset, value);
      } catch {
        toast.error('Revisa los campos del activo.');
        return;
      }

      // The API rejects an empty body (422): skip the request entirely.
      if (!hasAssetChanges(payload)) {
        toast.info('No hay cambios para guardar.');
        onClose();
        return;
      }

      try {
        await updateAsset.mutateAsync({ id: asset.id, payload });
        onClose();
      } catch (error) {
        // Toast is shown by the mutation hook; surface field-level errors.
        if (!isAssetApiError(error)) return;
        if (error.status === 404) {
          onClose();
          return;
        }
        const codeError = error.fieldErrors.code;
        if (codeError) {
          form.setFieldMeta('code', (meta) => ({
            ...meta,
            isTouched: true,
            errorMap: { ...meta.errorMap, onServer: codeError },
          }));
        }
      }
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
        role='dialog'
        aria-modal='true'
        aria-labelledby='edit-asset-title'
      >
        {/* Header */}
        <div className='border-shNeutral-200 flex items-center justify-between border-b px-6 py-4'>
          <h2
            id='edit-asset-title'
            className='text-shNeutral-900 text-lg font-bold'
          >
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
                  validators={{ onChange: newAssetSchema.shape.name }}
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
                  validators={{ onChange: newAssetSchema.shape.code }}
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
                  validators={{ onChange: newAssetSchema.shape.area }}
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
                  validators={{ onChange: newAssetSchema.shape.serial }}
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
                  validators={{ onChange: newAssetSchema.shape.model }}
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
                  validators={{ onChange: newAssetSchema.shape.manufacturer }}
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
                  validators={{ onChange: newAssetSchema.shape.cost }}
                  children={(field) => (
                    <FormField
                      name='cost'
                      label='Costo'
                      placeholder='0'
                      type='number'
                      icon={Banknote}
                      field={field}
                    />
                  )}
                />
                <form.Field
                  name='status'
                  children={(field) => (
                    <AssetStatusSelect
                      id='edit-status'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(status) => field.handleChange(status)}
                    />
                  )}
                />
              </div>

              {/* Row 5: Criticidad + Fecha instalación */}
              <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                <form.Field
                  name='criticality'
                  children={(field) => (
                    <AssetCriticalitySelect
                      id='edit-criticality'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(criticality) =>
                        field.handleChange(criticality)
                      }
                    />
                  )}
                />
                <form.Field
                  name='installedAt'
                  validators={{ onChange: newAssetSchema.shape.installedAt }}
                  children={(field) => (
                    <AssetInstalledAtInput
                      id='edit-installedAt'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(value) => field.handleChange(value)}
                      error={firstErrorMessage(field.state.meta.errors)}
                    />
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
            <form.Subscribe
              selector={(state) => state.canSubmit}
              children={(canSubmit) => (
                <Button
                  type='submit'
                  disabled={!canSubmit || updateAsset.isPending}
                  loading={updateAsset.isPending}
                  loadingText='Guardando...'
                  icon={<Save size={18} />}
                  intent='accent'
                  variant='primary'
                  fullWidth
                >
                  Guardar cambios
                </Button>
              )}
            />
          </div>
        </form>
      </motion.div>
    </div>
  );
}
