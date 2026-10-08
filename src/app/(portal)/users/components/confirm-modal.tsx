'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import Button from '@/global-components/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  userName: string;
  onCancel: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  /** Overrides for non-delete confirmations (defaults: delete user). */
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  loadingText?: string;
  confirmIntent?: 'danger' | 'primary' | 'success';
}

export default function ConfirmModal({
  isOpen,
  userName,
  onCancel,
  onConfirm,
  isPending,
  title = '¿Eliminar usuario?',
  description,
  confirmLabel = 'Eliminar',
  loadingText = 'Eliminando...',
  confirmIntent = 'danger',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className='bg-shNeutral-900/35 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm'
      onClick={onCancel}
    >
      <div
        className='border-shNeutral-200 w-full max-w-md rounded-2xl border bg-white shadow-lg'
        onClick={(e) => e.stopPropagation()}
        role='alertdialog'
        aria-modal='true'
        aria-label={title}
      >
        {/* Header */}
        <div className='border-shNeutral-200 flex items-center justify-between border-b px-6 py-4'>
          <h2 className='text-shNeutral-900 text-lg font-bold'>{title}</h2>
          <Button
            type='button'
            onClick={onCancel}
            intent='neutral'
            variant='ghost'
            icon={<X size={18} />}
            aria-label='Cerrar'
            className='size-8 rounded-lg p-0'
          />
        </div>

        {/* Body */}
        <div className='px-6 py-5'>
          {description ?? (
            <p className='text-shNeutral-500'>
              ¿Estás seguro de eliminar a{' '}
              <span className='text-shNeutral-900 font-bold'>{userName}</span>
              ? <br />
              Esta acción no se puede deshacer.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className='border-shNeutral-200 flex gap-3 border-t px-6 py-4'>
          <Button
            type='button'
            onClick={onCancel}
            disabled={isPending}
            intent='neutral'
            variant='secondary'
            fullWidth
          >
            Cancelar
          </Button>
          <Button
            type='button'
            onClick={onConfirm}
            loading={isPending}
            loadingText={loadingText}
            intent={confirmIntent}
            variant='primary'
            fullWidth
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
