'use client';

import { X } from 'lucide-react';
import Button from '@/global-components/Button';

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
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
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
            className='text-app-text-muted hover:bg-app-surface-subtle hover:text-app-text-primary cursor-pointer rounded p-1 transition-colors'
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
          <Button
            variant='secondary'
            intent='primary'
            onClick={onCancel}
            disabled={isPending}
            fullWidth
          >
            Cancelar
          </Button>
          <Button
            variant='primary'
            intent='red'
            onClick={onConfirm}
            disabled={isPending}
            loading={isPending}
            loadingText='Eliminando'
            fullWidth
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}
