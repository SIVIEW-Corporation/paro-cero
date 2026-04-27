'use client';

import { X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  userName: string;
  onCancel: () => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export default function ConfirmModal({
  isOpen,
  userName,
  onCancel,
  onConfirm,
  isPending,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className='bg-app-text-primary/35 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm'
      onClick={onCancel}
    >
      <div
        className='border-app-border-soft bg-app-surface w-full max-w-md rounded-2xl border shadow-lg'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='border-app-border-soft flex items-center justify-between border-b px-6 py-4'>
          <h2 className='text-app-text-primary text-lg font-bold'>
            ¿Eliminar usuario?
          </h2>
          <button
            type='button'
            onClick={onCancel}
            className='text-app-text-muted hover:bg-app-surface-subtle hover:text-app-text-primary focus-visible:ring-app-brand focus-visible:ring-offset-app-surface inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            aria-label='Cerrar'
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-5'>
          <p className='text-app-text-secondary'>
            ¿Estás seguro de eliminar a{' '}
            <span className='text-app-text-primary font-bold'>{userName}</span>?{' '}
            <br />
            Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Footer */}
        <div className='border-app-border-soft flex gap-3 border-t px-6 py-4'>
          <button
            type='button'
            onClick={onCancel}
            disabled={isPending}
            className='border-app-border-soft bg-app-surface text-app-text-secondary hover:bg-app-surface-subtle hover:text-app-text-primary focus-visible:ring-app-brand focus-visible:ring-offset-app-surface inline-flex w-full cursor-pointer items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60'
          >
            Cancelar
          </button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={isPending}
            className='bg-app-danger text-app-surface focus-visible:ring-app-danger focus-visible:ring-offset-app-surface inline-flex w-full cursor-pointer items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isPending ? 'Eliminando' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
