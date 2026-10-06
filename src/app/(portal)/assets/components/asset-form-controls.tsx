'use client';

import { Activity, AlertTriangle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ASSET_CRITICALITIES,
  ASSET_CRITICALITY_LABELS,
  ASSET_STATUSES,
  ASSET_STATUS_LABELS,
  type AssetCriticality,
  type AssetStatus,
} from '../types';

const LABEL_CLASS =
  'text-shNeutral-700 group-focus-within:text-shPrimary-700 mb-1.5 block text-xs font-medium transition-colors duration-300';
const ICON_CLASS =
  'text-shNeutral-600 group-focus-within:text-shPrimary-700 flex w-12 shrink-0 items-center justify-center transition-colors';
const CONTROL_CLASS =
  'text-shNeutral-900 border-shNeutral-100! bg-shNeutral-50! flex-1 appearance-none rounded-none! border-0! border-l! py-2.5 pl-2 shadow-inner! ring-0! outline-none!';

/** First message from TanStack Form errors (strings or Standard Schema issues). */
export function firstErrorMessage(errors: readonly unknown[]): string | null {
  for (const error of errors) {
    if (typeof error === 'string' && error) return error;
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return error.message;
    }
  }
  return null;
}

interface SelectProps<T extends string> {
  id: string;
  value: T;
  onChange: (value: T) => void;
  onBlur: () => void;
  error?: string | null;
}

const SELECT_BOX_CLASS =
  'custom-select-container flex items-center overflow-hidden rounded-lg border bg-white transition-all';
const SELECT_BOX_OK_CLASS =
  'border-shNeutral-200 focus-within:border-shPrimary-500 focus-within:ring-shPrimary-500/15 focus-within:ring-2';

function FieldError({ error }: { error?: string | null }) {
  if (!error) return null;
  return (
    <p className='text-shDanger-700 mt-1.5 text-xs font-medium'>{error}</p>
  );
}

export function AssetStatusSelect({
  id,
  value,
  onChange,
  onBlur,
  error,
}: SelectProps<AssetStatus>) {
  return (
    <div className='group'>
      <label htmlFor={id} className={LABEL_CLASS}>
        Estado
      </label>
      <div
        className={cn(
          SELECT_BOX_CLASS,
          error ? 'border-shDanger-500' : SELECT_BOX_OK_CLASS,
        )}
      >
        <div className={cn(ICON_CLASS, error && 'text-shDanger-500')}>
          <Activity size={16} />
        </div>
        <select
          id={id}
          value={value}
          onBlur={onBlur}
          onChange={(e) => {
            const next = ASSET_STATUSES.find((item) => item === e.target.value);
            if (next) onChange(next);
          }}
          aria-invalid={Boolean(error)}
          className={cn(CONTROL_CLASS, 'cursor-pointer pr-12')}
        >
          {ASSET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {ASSET_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
      <FieldError error={error} />
    </div>
  );
}

export function AssetCriticalitySelect({
  id,
  value,
  onChange,
  onBlur,
  error,
}: SelectProps<AssetCriticality>) {
  return (
    <div className='group'>
      <label htmlFor={id} className={LABEL_CLASS}>
        Criticidad
      </label>
      <div
        className={cn(
          SELECT_BOX_CLASS,
          error ? 'border-shDanger-500' : SELECT_BOX_OK_CLASS,
        )}
      >
        <div className={cn(ICON_CLASS, error && 'text-shDanger-500')}>
          <AlertTriangle size={16} />
        </div>
        <select
          id={id}
          value={value}
          onBlur={onBlur}
          onChange={(e) => {
            const next = ASSET_CRITICALITIES.find(
              (item) => item === e.target.value,
            );
            if (next) onChange(next);
          }}
          aria-invalid={Boolean(error)}
          className={cn(CONTROL_CLASS, 'cursor-pointer pr-12')}
        >
          {ASSET_CRITICALITIES.map((criticality) => (
            <option key={criticality} value={criticality}>
              {ASSET_CRITICALITY_LABELS[criticality]}
            </option>
          ))}
        </select>
      </div>
      <FieldError error={error} />
    </div>
  );
}

interface InstalledAtInputProps {
  id: string;
  /** `YYYY-MM-DD` or ''. */
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string | null;
}

export function AssetInstalledAtInput({
  id,
  value,
  onChange,
  onBlur,
  error,
}: InstalledAtInputProps) {
  return (
    <div className='group'>
      <label htmlFor={id} className={LABEL_CLASS}>
        Fecha instalación
      </label>
      <div
        className={cn(
          'flex items-center overflow-hidden rounded-lg border bg-white transition-all',
          error
            ? 'border-shDanger-500'
            : 'border-shNeutral-200 focus-within:border-shPrimary-500 focus-within:ring-shPrimary-500/15 focus-within:ring-2',
        )}
      >
        <div className={cn(ICON_CLASS, error && 'text-shDanger-500')}>
          <Calendar size={16} />
        </div>
        <input
          id={id}
          type='date'
          value={value}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className={cn(CONTROL_CLASS, 'pr-4')}
        />
      </div>
      {error && (
        <p className='text-shDanger-700 mt-1.5 text-xs font-medium'>{error}</p>
      )}
    </div>
  );
}
