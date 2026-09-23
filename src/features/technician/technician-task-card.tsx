'use client';

import { useState } from 'react';
import { Check, ClipboardCheck, Clock3, Play } from 'lucide-react';
import { toast } from 'sonner';

import { useWorkOrdersStore } from '@/app/stores/useWorkOrdersStore';
import {
  ASSIGNMENT_STATUS,
  clockMinutes,
  dateLabel,
  dayStart,
  intersection,
  isPending,
  timeRange,
  clockLabel,
  type Assignment,
} from '@/features/planning/domain';
import { usePlanningStore } from '@/features/planning/store';
import AssignmentStatusBadge from '@/features/planning/assignment-status-badge';
import {
  ActionButton,
  Dialog,
  ErrorMessage,
} from '@/features/planning/planning-ui';

export default function TechnicianTaskCard({
  task,
  technicianId,
  selectedDate,
  nowMinutes,
  otherInProgress,
}: {
  task: Assignment;
  technicianId: string;
  selectedDate: string;
  nowMinutes: number;
  otherInProgress: boolean;
}) {
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [error, setError] = useState('');
  const changeStatus = usePlanningStore((s) => s.changeTaskStatus);
  const orders = useWorkOrdersStore((s) => s.ordenes);
  const order = orders.find(
    (o) =>
      o.id === task.workOrderId &&
      (!o.tecnicoId || o.tecnicoId === technicianId),
  );
  const interval = timeRange(task.date, task.start, task.end);
  const day = {
    start: dayStart(selectedDate),
    end: dayStart(selectedDate) + 1440,
  };
  const clipped = intersection(interval, day);
  const overdue = isPending(task) && interval.end <= nowMinutes;
  const finish = () => {
    const message = changeStatus(
      task.id,
      technicianId,
      ASSIGNMENT_STATUS.COMPLETED,
      task.status,
    );
    if (message) {
      setError(message);
      toast.error(message);
      return;
    }
    setConfirmComplete(false);
    setError('');
    toast.success('Tarea completada. La OT relacionada no se modificó.');
  };
  return (
    <article
      className='border-app-border-soft bg-app-surface rounded-xl border p-4 shadow-sm'
      aria-label={`Tarea: ${task.title}`}
    >
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='flex min-w-0 items-start gap-3'>
          <span
            className='bg-shPrimary-800 rounded-lg p-2 text-white'
            aria-hidden='true'
          >
            <ClipboardCheck size={17} />
          </span>
          <div className='min-w-0'>
            <h3 className='text-app-text-primary font-semibold'>
              {task.title}
            </h3>
            <p className='text-app-text-secondary mt-1 flex items-center gap-1 text-sm'>
              <Clock3 size={14} />
              {task.start}–{task.end}
              {clockMinutes(task.end) < clockMinutes(task.start)
                ? ' · termina al día siguiente'
                : ''}
            </p>
          </div>
        </div>
        <AssignmentStatusBadge status={task.status} />
      </div>
      {(task.date !== selectedDate || interval.end > day.end) && clipped && (
        <p className='text-shPrimary-800 mt-3 text-xs'>
          Inicia el {dateLabel(task.date)}. Tramo de este día:{' '}
          {clockLabel(clipped.start - day.start)}–
          {clockLabel(clipped.end - day.start)}.
        </p>
      )}
      {overdue && (
        <p className='text-shDanger-700 mt-2 text-xs'>
          Horario planificado vencido · todavía sin completar
        </p>
      )}
      <p className='text-app-text-secondary mt-3 text-xs font-medium'>
        {task.workOrderFolio
          ? `OT relacionada: ${task.workOrderFolio}`
          : 'Tarea general · sin OT'}
      </p>
      {task.notes && (
        <p className='border-app-border-soft text-app-text-secondary mt-3 border-t pt-3 text-sm whitespace-pre-wrap'>
          {task.notes}
        </p>
      )}
      {task.workOrderId &&
        (order ? (
          <details className='border-app-border-soft bg-app-surface-subtle mt-3 rounded-lg border p-3 text-sm'>
            <summary className='text-shPrimary-800 cursor-pointer font-semibold'>
              Ver detalle de {order.folio}
            </summary>
            <dl className='mt-3 space-y-2'>
              <div>
                <dt className='text-app-text-secondary text-xs'>Título</dt>
                <dd>{order.titulo}</dd>
              </div>
              <div>
                <dt className='text-app-text-secondary text-xs'>
                  Estado / prioridad de la OT
                </dt>
                <dd>
                  {order.status} · {order.prioridad}
                </dd>
              </div>
              <div>
                <dt className='text-app-text-secondary text-xs'>Descripción</dt>
                <dd>
                  {order.descripcionProblema ||
                    order.descripcion ||
                    'Sin descripción'}
                </dd>
              </div>
            </dl>
            <p className='text-app-text-secondary mt-3 text-xs'>
              Consulta de OT: completar esta tarea no realiza el cierre técnico
              ni administrativo de la orden.
            </p>
          </details>
        ) : (
          <p className='text-app-text-secondary mt-3 text-xs'>
            El detalle de esta OT no está disponible para este técnico en la
            sesión de prueba. La tarea conserva su folio de referencia.
          </p>
        ))}
      {(task.startedAt || task.completedAt) && (
        <p className='text-app-text-secondary mt-3 text-xs'>
          {task.completedAt ? 'Completada' : 'Iniciada'}:{' '}
          {new Date(task.completedAt || task.startedAt!).toLocaleString(
            'es-MX',
            { timeZone: 'America/Mexico_City' },
          )}
        </p>
      )}
      <ErrorMessage error={confirmComplete ? '' : error} />
      {isPending(task) && (
        <div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
          <p className='text-app-text-secondary max-w-sm text-xs'>
            {otherInProgress && task.status === ASSIGNMENT_STATUS.PENDING
              ? 'Completá tu tarea en proceso antes de iniciar otra.'
              : 'El jefe administra los horarios; vos registrás el avance.'}
          </p>
          {task.status === ASSIGNMENT_STATUS.PENDING ? (
            <ActionButton
              disabled={otherInProgress}
              className='border-shPrimary-800 bg-shPrimary-800 hover:bg-shPrimary-900 text-white'
              onClick={() => {
                const message = changeStatus(
                  task.id,
                  technicianId,
                  ASSIGNMENT_STATUS.IN_PROGRESS,
                  task.status,
                );
                if (message) {
                  setError(message);
                  toast.error(message);
                } else {
                  setError('');
                  toast.success('Tarea en proceso');
                }
              }}
            >
              <Play size={15} />
              Marcar en proceso
            </ActionButton>
          ) : (
            <ActionButton
              className='border-shPrimary-800 bg-shPrimary-800 hover:bg-shPrimary-900 text-white'
              onClick={() => {
                setError('');
                setConfirmComplete(true);
              }}
            >
              <Check size={15} />
              Marcar completada
            </ActionButton>
          )}
        </div>
      )}
      {confirmComplete && (
        <Dialog
          title='Completar tarea'
          onClose={() => setConfirmComplete(false)}
        >
          <p className='font-semibold'>{task.title}</p>
          <p className='text-app-text-secondary text-sm'>
            Se guardará la fecha de finalización y dejará de contarse como
            pendiente. No se cerrará la OT relacionada ni se modificará tu
            horario planificado.
          </p>
          <p className='text-app-text-secondary text-sm'>
            En esta versión no se pueden reabrir tareas completadas.
          </p>
          <ErrorMessage error={error} />
          <div className='flex justify-end gap-2'>
            <ActionButton onClick={() => setConfirmComplete(false)}>
              Volver
            </ActionButton>
            <ActionButton
              className='border-shPrimary-800 bg-shPrimary-800 hover:bg-shPrimary-900 text-white'
              onClick={finish}
            >
              Confirmar completada
            </ActionButton>
          </div>
        </Dialog>
      )}
    </article>
  );
}
