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
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4'
      onClick={onCancel}
    >
      <div
        className='shadow-shPrimary-800/70 bg-shGray-800 border-shGray-700 w-full max-w-md rounded-2xl border shadow-md'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='border-shGray-700/50 flex items-center justify-between border-b px-6 py-4'>
          <h2 className='text-lg font-bold text-white'>¿Eliminar usuario?</h2>
          <button
            type='button'
            onClick={onCancel}
            className='cursor-pointer rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white'
            aria-label='Cerrar'
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-5'>
          <p className='text-zinc-300'>
            ¿Estás seguro de eliminar a{' '}
            <span className='font-bold text-white'>{userName}</span>? <br />
            Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Footer */}
        <div className='border-shGray-700/50 flex gap-3 border-t px-6 py-4'>
          <Button
            variant='secondary'
            intent='zinc'
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
