'use client';

import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
} from 'lucide-react';

import { TECNICOS } from '@/app/data/constants';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/cn';
import {
  ASSIGNMENT_STATUS,
  addDays,
  clockLabel,
  companyClock,
  dateLabel,
  daySegments,
  dayStart,
  intersection,
  isDayOff,
  isPending,
  nextAssignment,
  tasksForPeriod,
  timeRange,
  today,
  type PlanningData,
} from '@/features/planning/domain';
import { usePlanningStore } from '@/features/planning/store';
import { usePlanningSync } from '@/features/planning/use-planning-sync';
import {
  ActionButton,
  AvailabilityBar,
  ErrorMessage,
  Field,
  panelClass,
} from '@/features/planning/planning-ui';
import { technicianContext } from './access';
import TechnicianCalendar from './technician-calendar';
import TechnicianTaskCard from './technician-task-card';

const FILTER = {
  PENDING: 'pending',
  ALL: 'all',
  COMPLETED: 'completed',
} as const;
type Filter = (typeof FILTER)[keyof typeof FILTER];
function monthStart(date: string): string {
  return `${date.slice(0, 7)}-01`;
}
function moveMonth(date: string, step: number): string {
  const [year, month] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1 + step, 1))
    .toISOString()
    .slice(0, 10);
}

function DayScheduleSummary({
  data,
  technicianId,
  date,
}: {
  data: PlanningData;
  technicianId: string;
  date: string;
}) {
  const blocked = isDayOff(data, technicianId, date);
  const day = { start: dayStart(date), end: dayStart(date) + 1440 };
  const shifts = data.schedules.filter(
    (s) =>
      s.technicianId === technicianId &&
      s.working &&
      intersection(timeRange(s.date, s.start, s.end), day),
  );
  const rests = daySegments(data, technicianId, date).filter(
    (s) => s.kind === 'break',
  );
  if (blocked.length)
    return (
      <div className='border-shDanger-200 bg-shDanger-50 text-shDanger-800 rounded-xl border p-4 text-sm'>
        <p className='font-semibold'>Día no laboral</p>
        <p>{blocked.map((d) => d.reason).join(' · ')}</p>
      </div>
    );
  if (!shifts.length)
    return (
      <p className='border-app-border-soft bg-app-surface-subtle text-app-text-secondary rounded-xl border p-4 text-sm'>
        {data.schedules.some(
          (s) => s.date === date && s.technicianId === technicianId,
        )
          ? 'Día de descanso · sin jornada laboral.'
          : 'Todavía no tenés jornada configurada para este día.'}
      </p>
    );
  return (
    <div className='border-app-border-soft bg-app-surface-subtle text-app-text-secondary space-y-2 rounded-xl border p-4 text-sm'>
      {shifts.map((s) => {
        const slice = intersection(timeRange(s.date, s.start, s.end), day)!;
        return (
          <p key={s.date} className='flex flex-wrap items-center gap-2'>
            <Clock3 size={16} />
            <strong className='text-app-text-primary'>
              Jornada {clockLabel(slice.start - day.start)}–
              {clockLabel(slice.end - day.start)}
            </strong>
            {s.date !== date ? `Continuación del ${dateLabel(s.date)}` : ''}
          </p>
        );
      })}
      {rests.map((r) => (
        <p key={r.start}>
          Descanso {clockLabel(r.start)}–{clockLabel(r.end)}
        </p>
      ))}
    </div>
  );
}

export default function TechnicianScreen({
  demoMode = false,
}: {
  demoMode?: boolean;
}) {
  usePlanningSync();
  const data = usePlanningStore((state) => state.data);
  const notice = usePlanningStore((state) => state.notice);
  const user = useAuthStore((state) => state.user);
  const [demoTechnicianId, setDemoTechnicianId] = useState(TECNICOS[0].id);
  const [selectedDate, setSelectedDate] = useState('');
  const [month, setMonth] = useState('');
  const [now, setNow] = useState<Date | null>(null);
  const [filter, setFilter] = useState<Filter>(FILTER.PENDING);
  useEffect(() => {
    const current = today();
    setSelectedDate(current);
    setMonth(monthStart(current));
    const tick = () => setNow(new Date());
    tick();
    const timer = window.setInterval(tick, 30000);
    window.addEventListener('focus', tick);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', tick);
    };
  }, []);
  if (!data || !selectedDate || !month || !now)
    return (
      <div className='text-app-text-secondary p-8' role='status'>
        Cargando tus tareas…
      </div>
    );
  const context = technicianContext(user, demoMode, demoTechnicianId, TECNICOS);
  if (!context.technician)
    return (
      <section className={cn(panelClass, 'my-6')}>
        <h1 className='mb-3 text-xl font-bold'>Mis tareas</h1>
        <ErrorMessage error={context.error} />
        <p className='text-app-text-secondary mt-3 text-sm'>
          Esta versión usa exclusivamente datos de prueba. La vinculación real
          entre usuario, empresa y técnico requiere la integración con backend.
        </p>
      </section>
    );
  const technician = context.technician;
  const dayTasks = tasksForPeriod(
    data,
    technician.id,
    selectedDate,
    addDays(selectedDate, 1),
  );
  const monthTasks = tasksForPeriod(
    data,
    technician.id,
    monthStart(month),
    moveMonth(month, 1),
  );
  const dayPending = dayTasks.filter(isPending);
  const dayCompleted = dayTasks.filter(
    (t) => t.status === ASSIGNMENT_STATUS.COMPLETED,
  );
  const visible = dayTasks.filter(
    (task) =>
      filter === FILTER.ALL ||
      (filter === FILTER.COMPLETED
        ? task.status === ASSIGNMENT_STATUS.COMPLETED
        : isPending(task)),
  );
  const currentTask = data.assignments.find(
    (t) =>
      t.technicianId === technician.id &&
      t.status === ASSIGNMENT_STATUS.IN_PROGRESS,
  );
  const nextTask = currentTask ?? nextAssignment(data, technician.id, now);
  const clock = companyClock(now);
  const selectDay = (date: string) => {
    setSelectedDate(date);
    setMonth(monthStart(date));
  };
  return (
    <div className='space-y-5 py-5 sm:py-7'>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <div className='text-app-text-secondary mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase'>
            <ClipboardCheck size={15} />
            Espacio del técnico
          </div>
          <h1 className='text-app-text-primary text-3xl font-bold tracking-tight'>
            Mis tareas
          </h1>
          <p className='text-app-text-secondary mt-2 text-sm'>
            Tu jornada, tus pendientes y el avance de cada tarea.
          </p>
        </div>
        <div className='border-app-border-soft bg-app-surface-subtle rounded-xl border px-4 py-3'>
          <p className='text-app-text-secondary text-xs'>Técnico</p>
          <p className='text-app-text-primary font-semibold'>
            {technician.nombre}
          </p>
        </div>
      </header>
      <div className='border-app-border-soft bg-app-surface-subtle text-app-text-secondary space-y-3 rounded-xl border px-4 py-3 text-xs'>
        <p>
          <strong className='text-app-text-primary'>
            Modo demo · datos locales
          </strong>{' '}
          — Los cambios se comparten con Planeación en este navegador, no entre
          usuarios o dispositivos. Hora de empresa: Ciudad de México.
        </p>
        {context.canSimulate && (
          <div className='max-w-xs'>
            <Field label='Simular técnico (solo datos de prueba)'>
              <select
                className='bg-shNeutral-50! shadow-inner!'
                value={demoTechnicianId}
                onChange={(e) => setDemoTechnicianId(e.target.value)}
              >
                {TECNICOS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}
      </div>
      {notice && (
        <p
          role='status'
          className='border-app-border-soft bg-app-surface-subtle text-app-text-secondary rounded-lg border p-3 text-sm'
        >
          {notice}
        </p>
      )}
      <section
        className='grid grid-cols-2 gap-3 lg:grid-cols-4'
        aria-label='Resumen de tareas'
      >
        {[
          {
            label: 'Pendientes del día',
            value: String(dayPending.length),
            sub: dateLabel(selectedDate),
          },
          {
            label: 'Completadas del día',
            value: String(dayCompleted.length),
            sub: 'No se cuentan como pendientes',
          },
          {
            label: 'Pendientes del mes',
            value: String(monthTasks.filter(isPending).length),
            sub: dateLabel(month, { month: 'long', year: 'numeric' }),
          },
        ].map((item) => (
          <div key={item.label} className={panelClass}>
            <p className='text-app-text-secondary text-xs'>{item.label}</p>
            <p className='text-app-text-primary mt-2 text-2xl font-bold'>
              {item.value}
            </p>
            <p className='text-app-text-secondary mt-1 text-xs'>{item.sub}</p>
          </div>
        ))}
        <div className={panelClass}>
          <p className='text-app-text-secondary text-xs'>
            {currentTask ? 'En proceso ahora' : 'Próxima tarea desde ahora'}
          </p>
          <p className='text-app-text-primary mt-2 text-base font-bold'>
            {nextTask?.title || 'Sin próximas tareas'}
          </p>
          {nextTask ? (
            <button
              type='button'
              className='text-shPrimary-800 mt-2 rounded text-left text-xs font-semibold underline focus-visible:outline-2'
              onClick={() => {
                selectDay(nextTask.date);
                setFilter(FILTER.PENDING);
              }}
            >
              Ver {dateLabel(nextTask.date)} · {nextTask.start}
            </button>
          ) : (
            <p className='text-app-text-secondary mt-2 text-xs'>
              Los pendientes vencidos se consultan en su fecha.
            </p>
          )}
        </div>
      </section>
      <section
        className={cn(panelClass, 'space-y-4')}
        aria-labelledby='daily-tasks-title'
      >
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h2
              id='daily-tasks-title'
              className='text-app-text-primary text-xl font-bold'
            >
              Tareas del día
            </h2>
            <p
              className='text-app-text-secondary mt-1 text-sm'
              aria-live='polite'
            >
              {dateLabel(selectedDate, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <ActionButton
              aria-label='Día anterior'
              onClick={() => selectDay(addDays(selectedDate, -1))}
            >
              <ChevronLeft size={16} />
            </ActionButton>
            <ActionButton onClick={() => selectDay(clock.date)}>
              Hoy
            </ActionButton>
            <ActionButton
              aria-label='Día siguiente'
              onClick={() => selectDay(addDays(selectedDate, 1))}
            >
              <ChevronRight size={16} />
            </ActionButton>
            <label htmlFor='technician-date' className='sr-only'>
              Ir a fecha
            </label>
            <input
              id='technician-date'
              className='bg-shNeutral-50! w-auto! max-w-40 shadow-inner!'
              type='date'
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) selectDay(e.target.value);
              }}
            />
          </div>
        </div>
        <DayScheduleSummary
          data={data}
          technicianId={technician.id}
          date={selectedDate}
        />
        <div className='space-y-2'>
          <AvailabilityBar
            segments={daySegments(data, technician.id, selectedDate)}
          />
          <p className='text-app-text-secondary text-xs'>
            Ocupación planificada: completar una tarea no borra las horas
            reservadas ni registra horas reales.
          </p>
        </div>
        <div
          role='group'
          aria-label='Filtrar tareas'
          className='flex flex-wrap gap-2'
        >
          {[
            { value: FILTER.PENDING, label: 'Pendientes' },
            { value: FILTER.COMPLETED, label: 'Completadas' },
            { value: FILTER.ALL, label: 'Todas' },
          ].map((item) => (
            <ActionButton
              key={item.value}
              aria-pressed={filter === item.value}
              className={
                filter === item.value
                  ? 'border-shPrimary-800 bg-shPrimary-800 hover:bg-shPrimary-900 text-white'
                  : ''
              }
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </ActionButton>
          ))}
        </div>
        {visible.length ? (
          <div className='space-y-3'>
            {visible.map((task) => (
              <TechnicianTaskCard
                key={task.id}
                task={task}
                technicianId={technician.id}
                selectedDate={selectedDate}
                nowMinutes={clock.minutes}
                otherInProgress={Boolean(
                  currentTask && currentTask.id !== task.id,
                )}
              />
            ))}
          </div>
        ) : (
          <div className='border-app-border bg-app-surface-subtle rounded-xl border border-dashed p-8 text-center'>
            <ClipboardCheck className='text-app-text-muted mx-auto' size={28} />
            <p className='text-app-text-primary mt-3 font-semibold'>
              {!dayTasks.length
                ? 'No tenés tareas asignadas este día'
                : filter === FILTER.PENDING
                  ? 'No quedan tareas pendientes este día'
                  : 'No hay tareas con este filtro'}
            </p>
            <p className='text-app-text-secondary mt-1 text-sm'>
              Podés cambiar el filtro o elegir otra fecha en el calendario.
            </p>
          </div>
        )}
      </section>
      <section className='space-y-4' aria-labelledby='monthly-calendar-title'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h2
              id='monthly-calendar-title'
              className='text-app-text-primary text-xl font-bold'
            >
              Calendario del mes
            </h2>
            <p className='text-app-text-secondary mt-1 text-sm'>
              Consultá tareas, estados y días no laborales. Los turnos nocturnos
              aparecen en ambos días.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <ActionButton
              aria-label='Mes anterior'
              onClick={() => setMonth(moveMonth(month, -1))}
            >
              <ChevronLeft size={16} />
            </ActionButton>
            <h3
              className='min-w-36 text-center text-sm font-semibold capitalize'
              aria-live='polite'
            >
              {dateLabel(month, { month: 'long', year: 'numeric' })}
            </h3>
            <ActionButton
              aria-label='Mes siguiente'
              onClick={() => setMonth(moveMonth(month, 1))}
            >
              <ChevronRight size={16} />
            </ActionButton>
          </div>
        </div>
        <TechnicianCalendar
          data={data}
          technicianId={technician.id}
          selectedDate={selectedDate}
          month={month}
          currentDate={clock.date}
          onSelect={selectDay}
        />
      </section>
      <p className='text-app-text-secondary text-xs'>
        Podés iniciar y completar tus tareas. El jefe administra horarios,
        reasignaciones y cancelaciones. Completar una tarea no cierra la OT.
      </p>
    </div>
  );
}
