'use client';

import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Activo } from '@/app/data/types';
import { BtnGhost, Modal, ModalFooter } from '@/components/ui';
import { assetsService, type ApiAsset } from '@/services/assets-service';
import {
  useDeleteAssetMutation,
  useUpdateAssetMutation,
} from '@/hooks/use-asset-mutations';
import {
  isAssetSessionCurrent,
  useAssetSession,
} from '@/hooks/use-asset-session';
import AssetFormFields from './asset-form-fields';
import {
  assetToForm,
  buildAssetUpdate,
  type AssetFormState,
} from './asset-form';

interface AssetDetailActionsProps {
  asset: Activo;
  onUpdated: (asset: Activo) => void;
  onDeleted: () => void;
}

export default function AssetDetailActions({
  asset,
  onUpdated,
  onDeleted,
}: AssetDetailActionsProps) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const session = useAssetSession();
  const deletion = useDeleteAssetMutation();
  const submitting = useRef(false);
  const [error, setError] = useState('');

  function closeDelete() {
    if (!submitting.current) setConfirmDelete(false);
  }

  function remove() {
    if (
      submitting.current ||
      !session.canManage ||
      !isAssetSessionCurrent(session)
    )
      return;
    submitting.current = true;
    setError('');
    deletion.mutate(asset.id, {
      onSuccess: () => {
        if (!isAssetSessionCurrent(session)) return;
        setConfirmDelete(false);
        onDeleted();
        toast.success('Activo dado de baja correctamente.');
      },
      onError: (failure) => {
        if (isAssetSessionCurrent(session)) setError(failure.message);
      },
      onSettled: () => {
        submitting.current = false;
      },
    });
  }

  if (!session.canManage) return null;

  return (
    <>
      <BtnGhost onClick={() => setEditing(true)}>Editar activo</BtnGhost>
      <button
        type='button'
        className='border-shDanger-200 text-shDanger-700 rounded-lg border px-3.5 py-1.5 text-xs font-semibold'
        onClick={() => {
          setError('');
          setConfirmDelete(true);
        }}
      >
        Dar de baja
      </button>
      {editing && (
        <AssetEditDialog
          assetId={asset.id}
          onClose={() => setEditing(false)}
          onUpdated={onUpdated}
        />
      )}
      {confirmDelete && (
        <Modal title='Dar de baja activo' onClose={closeDelete}>
          <p className='text-shNeutral-700 text-sm'>
            ¿Dar de baja a{' '}
            <strong>
              {asset.code} — {asset.name}
            </strong>
            ? Dejará de aparecer en la lista de activos. Se conservará su
            registro histórico.
          </p>
          {error && (
            <p role='alert' className='text-shDanger-700 mt-3 text-sm'>
              {error}
            </p>
          )}
          <fieldset
            disabled={deletion.isPending}
            className='mt-5 flex min-w-0 gap-3 disabled:opacity-60'
          >
            <button
              type='button'
              className='border-shNeutral-200 text-shNeutral-700 flex-1 rounded-lg border p-2.5 text-sm'
              onClick={closeDelete}
            >
              Cancelar
            </button>
            <button
              type='button'
              className='bg-shDanger-700 text-shDanger-50 flex-1 rounded-lg p-2.5 text-sm font-semibold'
              onClick={remove}
            >
              {deletion.isPending ? 'Dando de baja...' : 'Confirmar baja'}
            </button>
          </fieldset>
        </Modal>
      )}
    </>
  );
}

interface AssetEditDialogProps {
  assetId: string;
  onClose: () => void;
  onUpdated: (asset: Activo) => void;
}

function AssetEditDialog({
  assetId,
  onClose,
  onUpdated,
}: AssetEditDialogProps) {
  const session = useAssetSession();
  const detail = useQuery({
    queryKey: ['assets', session.key, 'detail', assetId],
    queryFn: async () => {
      const asset = await assetsService.getAsset(assetId, {
        isRequestCurrent: () =>
          session.canManage && isAssetSessionCurrent(session),
      });
      if (asset.company_id !== session.companyId)
        throw new Error('El activo no pertenece a tu empresa.');
      return asset;
    },
    enabled: session.canManage,
    gcTime: 0,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  if (detail.isPending || detail.isFetching)
    return (
      <Modal title='Editar activo' onClose={onClose}>
        <p role='status'>Cargando datos del activo...</p>
      </Modal>
    );
  if (detail.error || !detail.data)
    return (
      <Modal title='Editar activo' onClose={onClose}>
        <p role='alert' className='text-shDanger-700 text-sm'>
          {detail.error?.message || 'No se pudo obtener el activo.'}
        </p>
        <BtnGhost
          onClick={() => {
            void detail.refetch();
          }}
        >
          Reintentar
        </BtnGhost>
      </Modal>
    );
  return (
    <AssetEditor asset={detail.data} onClose={onClose} onUpdated={onUpdated} />
  );
}

interface AssetEditorProps {
  asset: ApiAsset;
  onClose: () => void;
  onUpdated: (asset: Activo) => void;
}

function AssetEditor({ asset, onClose, onUpdated }: AssetEditorProps) {
  const [form, setForm] = useState(() => assetToForm(asset));
  const [error, setError] = useState('');
  const update = useUpdateAssetMutation();
  const session = useAssetSession();
  const submitting = useRef(false);

  function close() {
    if (!submitting.current) onClose();
  }

  function change<K extends keyof AssetFormState>(
    field: K,
    value: AssetFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function save() {
    if (
      submitting.current ||
      !session.canManage ||
      !isAssetSessionCurrent(session)
    )
      return;
    setError('');
    try {
      const data = buildAssetUpdate(asset, form);
      if (Object.keys(data).length === 0) {
        onClose();
        return;
      }
      submitting.current = true;
      update.mutate(
        { assetId: asset.id, data },
        {
          onSuccess: (updated) => {
            if (!isAssetSessionCurrent(session)) return;
            onUpdated(updated);
            onClose();
            toast.success('Activo actualizado correctamente.');
          },
          onError: (failure) => {
            if (isAssetSessionCurrent(session)) setError(failure.message);
          },
          onSettled: () => {
            submitting.current = false;
          },
        },
      );
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Revisa los datos del activo.',
      );
    }
  }

  return (
    <Modal title='Editar activo' onClose={close}>
      <fieldset
        disabled={update.isPending}
        className='min-w-0 disabled:opacity-60'
      >
        <AssetFormFields value={form} onChange={change} editing />
        {error && (
          <p role='alert' className='text-shDanger-700 text-sm'>
            {error}
          </p>
        )}
        <ModalFooter
          onCancel={close}
          onConfirm={save}
          confirmLabel={update.isPending ? 'Guardando...' : 'Guardar cambios'}
        />
      </fieldset>
    </Modal>
  );
}
