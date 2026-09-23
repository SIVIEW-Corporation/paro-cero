import { cn } from '@/lib/cn';
import { ASSIGNMENT_STATUS_LABEL, type AssignmentStatus } from './domain';

export const assignmentStatusClasses: Record<AssignmentStatus, string> = {
  pendiente: 'border-shNeutral-200 bg-shNeutral-50 text-shNeutral-700',
  en_proceso: 'border-shPrimary-200 bg-shPrimary-50 text-shPrimary-800',
  completada: 'border-shSuccess-200 bg-shSuccess-50 text-shSuccess-800',
  cancelada: 'border-shDanger-200 bg-shDanger-50 text-shDanger-800',
};

export default function AssignmentStatusBadge({
  status,
}: {
  status: AssignmentStatus;
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
        assignmentStatusClasses[status],
      )}
    >
      {ASSIGNMENT_STATUS_LABEL[status]}
    </span>
  );
}
