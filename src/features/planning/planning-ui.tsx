'use client';

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type ButtonHTMLAttributes,
} from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { SEGMENT, clockLabel, hours, dayTotals, type Segment } from './domain';

export const panelClass =
  'rounded-2xl border border-app-border-soft bg-app-surface p-4 shadow-sm sm:p-5';
export const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-app-border-soft bg-app-surface px-3 py-2 text-sm font-semibold text-app-text-primary transition-colors hover:bg-app-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shPrimary-500 disabled:cursor-not-allowed disabled:opacity-45';
export const segmentClasses = {
  [SEGMENT.FREE]: 'bg-shSuccess-50 text-shSuccess-800',
  [SEGMENT.BUSY]: 'bg-shPrimary-800 text-white',
  [SEGMENT.BREAK]: 'bg-shNeutral-200 text-shNeutral-700',
  [SEGMENT.OFF]: 'bg-app-surface-muted text-app-text-secondary',
};
export const segmentLabels = {
  [SEGMENT.FREE]: 'Disponible',
  [SEGMENT.BUSY]: 'Asignado',
  [SEGMENT.BREAK]: 'Descanso',
  [SEGMENT.OFF]: 'No disponible',
};
export function ActionButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type='button' className={cn(buttonClass, className)} {...props} />
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className='text-app-text-secondary flex min-w-0 flex-col gap-1.5 text-sm font-medium'>
      {label}
      {children}
    </label>
  );
}
export function Dialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={cn(
        'auth-shell border-app-border-soft bg-app-surface text-app-text-primary backdrop:bg-shPrimary-950/50 fixed inset-0 m-auto max-h-[90dvh] min-h-0! w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border p-0 shadow-xl',
        wide && 'max-w-4xl',
      )}
    >
      <div className='border-app-border-soft bg-app-surface sticky top-0 z-10 flex items-center justify-between gap-3 border-b p-4'>
        <h2 id={titleId} className='text-lg font-bold'>
          {title}
        </h2>
        <ActionButton aria-label='Cerrar' onClick={onClose}>
          <X size={18} />
        </ActionButton>
      </div>
      <div className='space-y-4 p-4 sm:p-5'>{children}</div>
    </dialog>
  );
}
export function ErrorMessage({ error }: { error: string }) {
  return error ? (
    <p
      role='alert'
      className='border-shDanger-200 bg-shDanger-50 text-shDanger-800 rounded-lg border p-3 text-sm whitespace-pre-line'
    >
      {error}
    </p>
  ) : null;
}
export function AvailabilityBar({ segments }: { segments: Segment[] }) {
  const totals = dayTotals(segments);
  return (
    <div className='space-y-1.5'>
      <div
        className='border-app-border-soft flex h-3 overflow-hidden rounded-full border'
        role='img'
        aria-label={`${hours(totals.busy)} asignadas, ${hours(totals.free)} libres, ${hours(totals.rest)} de descanso`}
      >
        {segments.map((s) => (
          <span
            key={s.start}
            className={segmentClasses[s.kind]}
            style={{ width: `${(s.end - s.start) / 14.4}%` }}
            title={`${clockLabel(s.start)}–${clockLabel(s.end)} · ${s.assignment?.title || segmentLabels[s.kind]}`}
          />
        ))}
      </div>
      <p className='text-app-text-secondary text-[11px]'>
        <strong className='text-app-text-primary'>{hours(totals.busy)}</strong>{' '}
        asignadas · {hours(totals.free)} libres
        {totals.rest > 0 ? ` · ${hours(totals.rest)} descanso` : ''}
      </p>
    </div>
  );
}
