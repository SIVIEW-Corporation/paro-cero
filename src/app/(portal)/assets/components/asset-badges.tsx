import { cn } from '@/lib/utils';
import {
  ASSET_CRITICALITY_LABELS,
  ASSET_STATUS_LABELS,
  type AssetCriticality,
  type AssetStatus,
} from '../types';

const FALLBACK_STYLE =
  'bg-shNeutral-50 text-shNeutral-700 border-shNeutral-200';

const STATUS_STYLES: Record<AssetStatus, string> = {
  commissioning: 'bg-shPrimary-50 text-shPrimary-800 border-shPrimary-200',
  operational: 'bg-shSuccess-50 text-shSuccess-800 border-shSuccess-200',
  standby: 'bg-shAccent-50 text-shAccent-800 border-shAccent-200',
  maintenance: 'bg-shNeutral-50 text-shNeutral-800 border-shNeutral-200',
  down: 'bg-shDanger-50 text-shDanger-800 border-shDanger-200',
  decommissioned: 'bg-shNeutral-100 text-shNeutral-500 border-shNeutral-200',
};

const CRITICALITY_STYLES: Record<AssetCriticality, string> = {
  low: 'bg-shSuccess-50 text-shSuccess-800 border-shSuccess-200',
  medium: 'bg-shPrimary-50 text-shPrimary-800 border-shPrimary-200',
  high: 'bg-shAccent-50 text-shAccent-800 border-shAccent-200',
  critical: 'bg-shDanger-50 text-shDanger-800 border-shDanger-200',
};

const BADGE_BASE =
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold';

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  const label = ASSET_STATUS_LABELS[status] ?? status;
  return (
    <span
      title={label}
      className={cn(BADGE_BASE, STATUS_STYLES[status] ?? FALLBACK_STYLE)}
    >
      {label}
    </span>
  );
}

export function AssetCriticalityBadge({
  criticality,
}: {
  criticality: AssetCriticality;
}) {
  const label = ASSET_CRITICALITY_LABELS[criticality] ?? criticality;
  return (
    <span
      title={label}
      className={cn(
        BADGE_BASE,
        CRITICALITY_STYLES[criticality] ?? FALLBACK_STYLE,
      )}
    >
      {label}
    </span>
  );
}
