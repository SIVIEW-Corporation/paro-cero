'use client';

import { useForm } from '@tanstack/react-form';
import * as motion from 'motion/react-client';
import {
  Tag,
  Hash,
  MapPin,
  Fingerprint,
  Cpu,
  Factory,
  Banknote,
  PackagePlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { FormField } from '@/global-components/FormField';
import Button from '@/global-components/Button';
import {
  AssetCriticalitySelect,
  AssetInstalledAtInput,
  AssetStatusSelect,
  firstErrorMessage,
} from './components/asset-form-controls';
import { useCreateAssetMutation } from './hooks/use-create-asset-mutation';
import {
  EMPTY_ASSET_FORM_VALUES,
  newAssetSchema,
} from './lib/new-asset-schema';
import { buildAssetCreatePayload } from './lib/asset-payload';
import {
  toAssetFormFieldErrors,
  type AssetFormField,
} from './lib/asset-server-errors';
import { isAssetApiError } from './services/assets-service';

const fieldAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
};

export default function NewAssetForm() {
  const createAsset = useCreateAssetMutation();

  const form = useForm({
    defaultValues: EMPTY_ASSET_FORM_VALUES,
    onSubmit: async ({ value }) => {
      let payload;
      try {
        payload = buildAssetCreatePayload(value);
      } catch {
        toast.error('Revisa los campos del activo.');
        return;
      }

      try {
        await createAsset.mutateAsync(payload);
        form.reset();
      } catch (error) {
        // Toast (general message) is shown by the mutation hook; surface
        // field-level server errors (409 code, 422 validation) inline.
        if (!isAssetApiError(error)) return;
        const serverErrors = toAssetFormFieldErrors(error.fieldErrors);
        for (const field of Object.keys(serverErrors) as AssetFormField[]) {
          const message = serverErrors[field];
          form.setFieldMeta(field, (meta) => ({
            ...meta,
            isTouched: true,
            errorMap: { ...meta.errorMap, onServer: message },
          }));
        }
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
          Completa el formulario para registrar un nuevo activo en la
          plataforma.
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
                  onChange: newAssetSchema.shape.serial,
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
                  onChange: newAssetSchema.shape.model,
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
                  onChange: newAssetSchema.shape.manufacturer,
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
            </div>

            {/* Row 3: Estado + Criticidad */}
            <div className='mt-5 grid grid-cols-1 gap-5 md:grid-cols-2'>
              <form.Field
                name='status'
                children={(field) => (
                  <AssetStatusSelect
                    id='status'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    error={firstErrorMessage(field.state.meta.errors)}
                    onChange={(status) => field.handleChange(status)}
                  />
                )}
              />
              <form.Field
                name='criticality'
                children={(field) => (
                  <AssetCriticalitySelect
                    id='criticality'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    error={firstErrorMessage(field.state.meta.errors)}
                    onChange={(criticality) => field.handleChange(criticality)}
                  />
                )}
              />
            </div>

            {/* Row 4: Fecha instalación (full width) */}
            <div className='mt-5'>
              <form.Field
                name='installedAt'
                validators={{ onChange: newAssetSchema.shape.installedAt }}
                children={(field) => (
                  <AssetInstalledAtInput
                    id='installedAt'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(value) => field.handleChange(value)}
                    error={firstErrorMessage(field.state.meta.errors)}
                  />
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
              selector={(state) => [state.canSubmit, state.isSubmitting]}
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
