import type { Metadata } from 'next';
import AssetDetail from '../components/AssetDetail';

export const metadata: Metadata = {
  title: 'Detalle de activo',
  robots: { index: false, follow: false },
};

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailPage({
  params,
}: AssetDetailPageProps) {
  const { id } = await params;
  return <AssetDetail assetId={id} />;
}
