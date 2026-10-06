'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as motion from 'motion/react-client';
import {
  AlertCircle,
  ArrowLeft,
  ClipboardCheck,
  ClipboardList,
  LockKeyhole,
  Pencil,
  RotateCw,
  SearchX,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/global-components/Button';
import ConfirmModal from './confirm-modal';
import EditAssetModal from './EditAssetModal';
import { AssetCriticalityBadge, AssetStatusBadge } from './asset-badges';
import { useAssetQuery } from '../hooks/use-assets-query';
import { useDeleteAssetMutation } from '../hooks/use-delete-asset-mutation';
import {
  SERVER_SESSION_KEY,
  useAssetSessionKey,
} from '../hooks/use-asset-session-key';
import { canManageAssets } from '../lib/asset-permissions';
import {
  EMPTY_VALUE,
  formatAssetCost,
  formatAssetDateTime,
  formatInstalledAt,
} from '../lib/asset-format';
import { isUuid } from '../lib/is-uuid';
import { isAssetApiError } from '../services/assets-service';
import type { Asset } from '../types';

interface AssetDetailProps {
  assetId: string;
}

const PAGE_CLASS = 'z-10 container mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8';

function BackLink() {
  return (
    <Link
      href='/assets'
      className='text-shPrimary-800 hover:text-shPrimary-700 mb-4 inline-flex items-center gap-1.5 text-sm font-medium'
    >
      <ArrowLeft size={16} />
      Volver a activos
    </Link>
  );
}

interface StateMessageProps {
  icon: ReactNode;
  title: string;
  description: string;
  tone?: 'danger' | 'neutral';
  action?: ReactNode;
}

function StateMessage({
  icon,
  title,
  description,
  tone = 'neutral',
  action,
}: StateMessageProps) {
  return (
    <main className={PAGE_CLASS}>
      <BackLink />
      <section
        role='alert'
        className='somecard flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-16 text-center'
      >
        <div
          className={
            tone === 'danger'
              ? 'bg-shDanger-50 text-shDanger-600 mb-4 rounded-full p-3'
              : 'bg-shNeutral-50 border-shNeutral-200 text-shNeutral-500 mb-4 rounded-full border p-3'
          }
        >
          {icon}
        </div>
        <h1 className='text-shNeutral-900 mb-1 text-lg font-bold'>{title}</h1>
        <p className='text-shNeutral-500 mb-6 max-w-md text-sm'>
          {description}
        </p>
        {action}
      </section>
    </main>
  );
}

function NotFoundState() {
  return (
    <StateMessage
      icon={<SearchX size={32} />}
      title='El activo no existe o fue eliminado'
      description='Es posible que el enlace sea incorrecto o que el activo ya no esté disponible en tu empresa.'
      action={
        <Link
          href='/assets'
          className='bg-shPrimary-800 hover:bg-shPrimary-700 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white'
        >
          <ArrowLeft size={16} />
          Ir al listado de activos
        </Link>
      }
    />
  );
}

function LoadingState() {
  return (
    <div className='flex h-full items-center justify-center p-4'>
      <div className='flex flex-col items-center gap-4' role='status'>
        <Image
          src='/PM0-logo.webp'
          alt='Logo PM0 by SIVIEW corporation'
          height={240}
          width={240}
          className='h-40 w-auto animate-pulse object-contain'
          loading='eager'
        />
        <p className='text-shNeutral-400'>Cargando activo...</p>
      </div>
    </div>
  );
}

interface DetailItemProps {
  label: string;
  children: ReactNode;
  mono?: boolean;
}

function DetailItem({ label, children, mono }: DetailItemProps) {
  return (
    <div className='border-shNeutral-100 flex flex-col gap-1 border-b pb-3'>
      <dt className='text-shNeutral-500 text-xs font-medium tracking-wide uppercase'>
        {label}
      </dt>
      <dd
        className={
          mono
            ? 'text-shNeutral-900 font-mono text-xs break-all'
            : 'text-shNeutral-900 text-sm break-words'
        }
      >
        {children}
      </dd>
    </div>
  );
}

const RELATED_SECTIONS = [
  {
    title: 'Planes',
    description:
      'Aquí se mostrarán los planes de mantenimiento preventivo asociados a este activo.',
    icon: ClipboardList,
  },
  {
    title: 'Órdenes de trabajo',
    description:
      'Aquí se mostrarán las órdenes de trabajo registradas para este activo.',
    icon: Wrench,
  },
  {
    title: 'Inspecciones',
    description: 'Aquí se mostrarán las inspecciones realizadas a este activo.',
    icon: ClipboardCheck,
  },
] as const;

/**
 * Placeholder sections. The asset detail endpoint returns only main data;
 * related entities live in their own modules and are NOT fetched here yet.
 */
function RelatedPlaceholders() {
  return (
    <section aria-label='Información relacionada' className='mt-6'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        {RELATED_SECTIONS.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className='border-shNeutral-200 rounded-2xl border border-dashed bg-white p-5'
          >
            <div className='mb-2 flex items-center gap-2'>
              <Icon size={18} className='text-shPrimary-800' />
              <h2 className='text-shNeutral-900 text-base font-semibold'>
                {title}
              </h2>
              <span className='bg-shNeutral-100 text-shNeutral-600 ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase'>
                Próximamente
              </span>
            </div>
            <p className='text-shNeutral-500 text-sm'>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function AssetMainData({ asset }: { asset: Asset }) {
  return (
    <section className='somecard rounded-2xl bg-white p-5 md:p-6'>
      <h2 className='text-shNeutral-700 font-inter mb-4 text-xs font-bold tracking-wider uppercase'>
        Datos del activo
      </h2>
      <dl className='grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3'>
        <DetailItem label='Nombre'>{asset.name}</DetailItem>
        <DetailItem label='Código'>{asset.code}</DetailItem>
        <DetailItem label='Área'>{asset.area}</DetailItem>
        <DetailItem label='Estado'>
          <span className='flex flex-wrap items-center gap-2'>
            <AssetStatusBadge status={asset.status} />
            <code className='text-shNeutral-500 text-xs'>{asset.status}</code>
          </span>
        </DetailItem>
        <DetailItem label='Criticidad'>
          <span className='flex flex-wrap items-center gap-2'>
            <AssetCriticalityBadge criticality={asset.criticality} />
            <code className='text-shNeutral-500 text-xs'>
              {asset.criticality}
            </code>
          </span>
        </DetailItem>
        <DetailItem label='Serial'>{asset.serial ?? EMPTY_VALUE}</DetailItem>
        <DetailItem label='Modelo'>{asset.model ?? EMPTY_VALUE}</DetailItem>
        <DetailItem label='Fabricante'>
          {asset.manufacturer ?? EMPTY_VALUE}
        </DetailItem>
        <DetailItem label='Costo'>{formatAssetCost(asset.cost)}</DetailItem>
        <DetailItem label='Fecha de instalación'>
          {formatInstalledAt(asset.installed_at)}
        </DetailItem>
        <DetailItem label='Activo'>{asset.is_active ? 'Sí' : 'No'}</DetailItem>
        <DetailItem label='Fecha de registro'>
          {formatAssetDateTime(asset.created_at)}
        </DetailItem>
        <DetailItem label='Última actualización'>
          {formatAssetDateTime(asset.updated_at)}
        </DetailItem>
        {asset.deleted_at && (
          <DetailItem label='Fecha de eliminación'>
            {formatAssetDateTime(asset.deleted_at)}
          </DetailItem>
        )}
        <DetailItem label='ID del activo' mono>
          {asset.id}
        </DetailItem>
        <DetailItem label='ID de empresa' mono>
          {asset.company_id}
        </DetailItem>
      </dl>
    </section>
  );
}

export default function AssetDetail({ assetId }: AssetDetailProps) {
  const router = useRouter();
  const session = useAssetSessionKey();
  const user = useAuthStore((s) => s.user);
  const isAdmin = canManageAssets(user?.role);
  const validId = isUuid(assetId);

  const {
    data: asset,
    error,
    isPending,
    isFetching,
    refetch,
  } = useAssetQuery(assetId);
  const deleteMutation = useDeleteAssetMutation();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (!validId) return <NotFoundState />;
  if (session === SERVER_SESSION_KEY) return <LoadingState />;

  if (error) {
    const status = isAssetApiError(error) ? error.status : null;
    if (status === 404) return <NotFoundState />;
    if (status === 403) {
      return (
        <StateMessage
          icon={<LockKeyhole size={32} />}
          tone='danger'
          title='No tienes permiso para ver este activo'
          description={error.message}
        />
      );
    }
    if (status === 401) {
      return (
        <StateMessage
          icon={<LockKeyhole size={32} />}
          tone='danger'
          title='Tu sesión expiró'
          description={error.message}
          action={
            <Link
              href='/login'
              className='bg-shPrimary-800 hover:bg-shPrimary-700 inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white'
            >
              Iniciar sesión
            </Link>
          }
        />
      );
    }
    return (
      <StateMessage
        icon={<AlertCircle size={32} />}
        tone='danger'
        title='No se pudo cargar el activo'
        description={error.message}
        action={
          <Button
            type='button'
            onClick={() => refetch()}
            loading={isFetching}
            loadingText='Reintentando...'
            icon={<RotateCw size={16} />}
            intent='primary'
            variant='secondary'
          >
            Reintentar
          </Button>
        }
      />
    );
  }

  if (isPending || !asset) return <LoadingState />;

  const handleConfirmDelete = () => {
    if (deleteMutation.isPending) return;
    deleteMutation.mutate(asset.id, {
      onSuccess: () => router.push('/assets'),
      onError: (deleteError) => {
        // Already gone: nothing left to show here.
        if (isAssetApiError(deleteError) && deleteError.status === 404) {
          router.push('/assets');
        }
      },
      onSettled: () => setIsDeleteOpen(false),
    });
  };

  return (
    <main className={PAGE_CLASS}>
      <BackLink />

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-start md:justify-between'
      >
        <div className='min-w-0'>
          <p className='text-shNeutral-500 font-inter mb-1 text-sm'>
            {asset.code}
          </p>
          <h1 className='font-inter text-shNeutral-900 mb-2 text-2xl font-semibold tracking-[-0.02em] break-words md:text-3xl'>
            {asset.name}
          </h1>
          <div className='flex flex-wrap items-center gap-2'>
            <AssetStatusBadge status={asset.status} />
            <AssetCriticalityBadge criticality={asset.criticality} />
          </div>
        </div>

        {isAdmin && (
          <div className='flex shrink-0 gap-2'>
            <Button
              type='button'
              onClick={() => setIsEditOpen(true)}
              icon={<Pencil size={16} />}
              intent='primary'
              variant='primary'
              scale='101'
            >
              Editar
            </Button>
            <Button
              type='button'
              onClick={() => setIsDeleteOpen(true)}
              icon={<Trash2 size={16} />}
              intent='danger'
              variant='secondary'
              scale='101'
            >
              Eliminar
            </Button>
          </div>
        )}
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <AssetMainData asset={asset} />
        <RelatedPlaceholders />
      </motion.div>

      {isAdmin && (
        <>
          <ConfirmModal
            isOpen={isDeleteOpen}
            assetName={asset.name}
            onCancel={() => {
              if (!deleteMutation.isPending) setIsDeleteOpen(false);
            }}
            onConfirm={handleConfirmDelete}
            isPending={deleteMutation.isPending}
          />
          {isEditOpen && (
            <EditAssetModal
              key={asset.updated_at ?? asset.id}
              isOpen={isEditOpen}
              asset={asset}
              onClose={() => setIsEditOpen(false)}
            />
          )}
        </>
      )}
    </main>
  );
}
