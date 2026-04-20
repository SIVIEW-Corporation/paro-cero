'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';

import {
  demoLeadSchema,
  type DemoLeadField,
  type DemoLeadInput,
} from '@/components/demo/demo-lead-schema';

export const DEMO_FORM_SUBMIT_STATUS = {
  IDLE: 'idle',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export type DemoFormSubmitStatus =
  (typeof DEMO_FORM_SUBMIT_STATUS)[keyof typeof DEMO_FORM_SUBMIT_STATUS];

export type DemoFormValues = DemoLeadInput;

type DemoFormFieldErrors = Partial<Record<DemoLeadField, string>>;

interface DemoCaptureFormProps {
  onSubmit: (values: DemoFormValues) => Promise<void>;
  submitStatus: DemoFormSubmitStatus;
  submitError: string;
  serverFieldErrors?: DemoFormFieldErrors;
}

function extractFieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): DemoFormFieldErrors {
  const errors: DemoFormFieldErrors = {};

  for (const issue of issues) {
    const firstPath = issue.path[0];
    if (typeof firstPath !== 'string') {
      continue;
    }

    if (!(firstPath in errors)) {
      errors[firstPath as DemoLeadField] = issue.message;
    }
  }

  return errors;
}

export default function DemoCaptureForm({
  onSubmit,
  submitStatus,
  submitError,
  serverFieldErrors = {},
}: DemoCaptureFormProps) {
  const [fieldErrors, setFieldErrors] = useState<DemoFormFieldErrors>({});

  const isSubmitting = submitStatus === DEMO_FORM_SUBMIT_STATUS.SUBMITTING;
  const isSuccess = submitStatus === DEMO_FORM_SUBMIT_STATUS.SUCCESS;
  const mergedFieldErrors = { ...serverFieldErrors, ...fieldErrors };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting || isSuccess) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const values: DemoFormValues = {
      fullName: String(formData.get('fullName') ?? '').trim(),
      companyName: String(formData.get('companyName') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      interestMessage: String(formData.get('interestMessage') ?? '').trim(),
    };

    const parsed = demoLeadSchema.safeParse(values);

    if (!parsed.success) {
      setFieldErrors(extractFieldErrors(parsed.error.issues));
      return;
    }

    setFieldErrors({});

    await onSubmit(parsed.data);
  };

  return (
    <section className='border-shGray-700/80 rounded-2xl border bg-[linear-gradient(150deg,rgba(37,35,35,0.92),rgba(29,27,22,0.96))] p-6 sm:p-7'>
      <p className='text-shPrimary-300 text-xs font-semibold tracking-[0.2em] uppercase'>
        Paso 1
      </p>
      <h2 className='text-shGray-200 mt-3 text-2xl leading-tight font-semibold'>
        Completa tus datos para desbloquear la demo completa
      </h2>
      <p className='text-shGray-400 mt-3 text-sm leading-relaxed'>
        Solo pedimos informacion clave para adaptar la conversacion comercial a
        tu contexto operativo.
      </p>

      <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <label className='space-y-2'>
            <span className='text-shGray-300 text-sm font-medium'>Nombre</span>
            <input
              name='fullName'
              required
              disabled={isSubmitting || isSuccess}
              autoComplete='name'
              className='border-shGray-600 bg-shBackground/80 text-shGray-200 placeholder:text-shGray-500 focus:border-shPrimary-400 h-11 w-full rounded-lg border px-3 text-sm transition-colors outline-none'
              placeholder='Ej: Martina Acosta'
            />
            {mergedFieldErrors.fullName ? (
              <p className='text-xs text-red-300'>
                {mergedFieldErrors.fullName}
              </p>
            ) : null}
          </label>

          <label className='space-y-2'>
            <span className='text-shGray-300 text-sm font-medium'>Empresa</span>
            <input
              name='companyName'
              required
              disabled={isSubmitting || isSuccess}
              autoComplete='organization'
              className='border-shGray-600 bg-shBackground/80 text-shGray-200 placeholder:text-shGray-500 focus:border-shPrimary-400 h-11 w-full rounded-lg border px-3 text-sm transition-colors outline-none'
              placeholder='Ej: Aceros del Sur'
            />
            {mergedFieldErrors.companyName ? (
              <p className='text-xs text-red-300'>
                {mergedFieldErrors.companyName}
              </p>
            ) : null}
          </label>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <label className='space-y-2'>
            <span className='text-shGray-300 text-sm font-medium'>Correo</span>
            <input
              type='email'
              name='email'
              required
              disabled={isSubmitting || isSuccess}
              autoComplete='email'
              className='border-shGray-600 bg-shBackground/80 text-shGray-200 placeholder:text-shGray-500 focus:border-shPrimary-400 h-11 w-full rounded-lg border px-3 text-sm transition-colors outline-none'
              placeholder='nombre@empresa.com'
            />
            {mergedFieldErrors.email ? (
              <p className='text-xs text-red-300'>{mergedFieldErrors.email}</p>
            ) : null}
          </label>

          <label className='space-y-2'>
            <span className='text-shGray-300 text-sm font-medium'>
              Telefono (opcional)
            </span>
            <input
              type='tel'
              name='phone'
              disabled={isSubmitting || isSuccess}
              autoComplete='tel'
              className='border-shGray-600 bg-shBackground/80 text-shGray-200 placeholder:text-shGray-500 focus:border-shPrimary-400 h-11 w-full rounded-lg border px-3 text-sm transition-colors outline-none'
              placeholder='+54 9 ...'
            />
            {mergedFieldErrors.phone ? (
              <p className='text-xs text-red-300'>{mergedFieldErrors.phone}</p>
            ) : null}
          </label>
        </div>

        <label className='space-y-2'>
          <span className='text-shGray-300 text-sm font-medium'>
            Mensaje o interes (opcional)
          </span>
          <textarea
            name='interestMessage'
            rows={4}
            disabled={isSubmitting || isSuccess}
            className='border-shGray-600 bg-shBackground/80 text-shGray-200 placeholder:text-shGray-500 focus:border-shPrimary-400 w-full rounded-lg border px-3 py-2.5 text-sm transition-colors outline-none'
            placeholder='Ej: Estamos evaluando digitalizar OT y PM en dos plantas.'
          />
          {mergedFieldErrors.interestMessage ? (
            <p className='text-xs text-red-300'>
              {mergedFieldErrors.interestMessage}
            </p>
          ) : null}
        </label>

        {submitStatus === DEMO_FORM_SUBMIT_STATUS.ERROR && submitError ? (
          <p className='text-sm text-red-300'>{submitError}</p>
        ) : null}

        {isSuccess ? (
          <p className='text-shPrimary-200 text-sm'>
            Listo, ya registramos tus datos y desbloqueamos la demo.
          </p>
        ) : null}

        <button
          type='submit'
          disabled={isSubmitting || isSuccess}
          className='bg-shPrimary-400 text-shBackground hover:bg-shPrimary-300 inline-flex h-11 w-full items-center justify-center rounded-lg px-5 text-sm font-semibold transition-colors sm:w-auto'
        >
          {isSubmitting ? 'Enviando...' : 'Desbloquear demo completa'}
        </button>
      </form>
    </section>
  );
}
