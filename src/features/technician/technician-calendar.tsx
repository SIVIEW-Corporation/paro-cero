import { cn } from '@/lib/cn';
import {
  ASSIGNMENT_STATUS,
  ASSIGNMENT_STATUS_LABEL,
  WEEKDAYS,
  addDays,
  dateLabel,
  isDayOff,
  isPending,
  tasksForPeriod,
  weekStart,
  type PlanningData,
} from '@/features/planning/domain';
import { assignmentStatusClasses } from '@/features/planning/assignment-status-badge';
import { panelClass } from '@/features/planning/planning-ui';

export default function TechnicianCalendar({
  data,
  technicianId,
  selectedDate,
  month,
  currentDate,
  onSelect,
}: {
  data: PlanningData;
  technicianId: string;
  selectedDate: string;
  month: string;
  currentDate: string;
  onSelect: (date: string) => void;
}) {
  const start = weekStart(`${month.slice(0, 7)}-01`);
  const days = Array.from({ length: 42 }, (_, n) => addDays(start, n));
  return (
    <div className={cn(panelClass, 'overflow-hidden p-0 sm:p-0')}>
      <div className='border-app-border-soft bg-app-surface-subtle grid grid-cols-7 border-b'>
        {WEEKDAYS.map((name) => (
          <div
            key={name}
            className='text-app-text-secondary p-2 text-center text-xs font-semibold sm:p-3'
          >
            {name}
          </div>
        ))}
      </div>
      <div className='grid grid-cols-7'>
        {days.map((date) => {
          const tasks = tasksForPeriod(
            data,
            technicianId,
            date,
            addDays(date, 1),
          );
          const pending = tasks.filter(isPending).length;
          const completed = tasks.filter(
            (t) => t.status === ASSIGNMENT_STATUS.COMPLETED,
          ).length;
          const off = isDayOff(data, technicianId, date).length > 0;
          const today = date === currentDate;
          return (
            <button
              type='button'
              key={date}
              onClick={() => onSelect(date)}
              aria-pressed={selectedDate === date}
              aria-label={`${dateLabel(date, { weekday: 'long', day: 'numeric', month: 'long' })}, ${pending} pendientes, ${completed} completadas${off ? ', no laboral' : ''}`}
              className={cn(
                'border-app-border-soft hover:bg-app-surface-subtle focus-visible:outline-shPrimary-500 min-h-28 min-w-0 overflow-hidden border-r border-b p-1.5 text-left align-top transition-colors focus-visible:z-10 focus-visible:outline-2 sm:min-h-36 sm:p-3',
                date.slice(0, 7) !== month.slice(0, 7) &&
                  'bg-app-surface-subtle/60 text-app-text-muted',
                selectedDate === date &&
                  'bg-shPrimary-50 ring-shPrimary-500 ring-2 ring-inset',
              )}
            >
              <span
                className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                  today && 'bg-shPrimary-800 text-white',
                )}
              >
                {Number(date.slice(8))}
              </span>
              {off && (
                <span className='text-shDanger-700 mt-1 block text-[10px] font-semibold'>
                  No laboral
                </span>
              )}
              <span className='text-app-text-secondary mt-1 block text-[10px] font-semibold sm:text-xs'>
                {tasks.length ? `${pending} pend.` : 'Sin tareas'}
              </span>
              {completed > 0 && (
                <span className='text-shSuccess-800 block text-[10px]'>
                  {completed} completadas
                </span>
              )}
              <span className='mt-2 block space-y-1'>
                {tasks.slice(0, 2).map((t) => (
                  <span
                    key={t.id}
                    className={cn(
                      'block truncate rounded border px-1 py-1 text-[10px]',
                      assignmentStatusClasses[t.status],
                    )}
                    title={`${t.title} · ${ASSIGNMENT_STATUS_LABEL[t.status]}${t.date !== date ? ' · continúa del día anterior' : ''}`}
                  >
                    {t.date !== date ? '↳' : t.start} · {t.title}
                  </span>
                ))}
                {tasks.length > 2 && (
                  <span className='text-app-text-secondary block text-[10px]'>
                    +{tasks.length - 2} más
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
