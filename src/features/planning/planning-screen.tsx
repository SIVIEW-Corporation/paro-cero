'use client';

import { useEffect, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  History,
  Plus,
  Settings2,
  Users,
} from 'lucide-react';
import { TECNICOS } from '@/app/data/constants';
import { cn } from '@/lib/cn';
import {
  ASSIGNMENT_STATUS,
  addDays,
  dateLabel,
  daySegments,
  dayTotals,
  hours,
  today,
  weekStart,
  type Assignment,
} from './domain';
import { usePlanningStore } from './store';
import { usePlanningSync } from './use-planning-sync';
import { ActionButton, Dialog, Field, panelClass } from './planning-ui';
import {
  CopyDialog,
  DayOffDialog,
  ScheduleDialog,
  TaskDialog,
  TemplatesDialog,
} from './planning-dialogs';
import { MonthCalendar, WeekCalendar } from './planning-calendar';

const VIEW = { WEEK: 'week', MONTH: 'month' } as const;
type View = (typeof VIEW)[keyof typeof VIEW];
const MODAL = {
  SCHEDULE: 'schedule',
  TEMPLATES: 'templates',
  COPY: 'copy',
  AUDIT: 'audit',
} as const;
type Modal = (typeof MODAL)[keyof typeof MODAL];

export default function PlanningScreen() {
  const data = usePlanningStore((s) => s.data);
  const notice = usePlanningStore((s) => s.notice);
  usePlanningSync();
  const [technicianId, setTechnicianId] = useState(TECNICOS[0].id);
  const [date, setDate] = useState('');
  const [view, setView] = useState<View>(VIEW.WEEK);
  const [modal, setModal] = useState<Modal | null>(null);
  const [task, setTask] = useState<Assignment | null>(null);
  const [dayOff, setDayOff] = useState<string | null>(null);
  useEffect(() => {
    setDate(today());
  }, []);
  if (!data || !date)
    return (
      <div className='text-app-text-secondary p-8' role='status'>
        Cargando agenda de prueba…
      </div>
    );
  const monday = weekStart(date);
  const days = Array.from({ length: 7 }, (_, n) => addDays(monday, n));
  const totals = days
    .map((day) => dayTotals(daySegments(data, technicianId, day)))
    .reduce(
      (sum, t) => ({
        busy: sum.busy + t.busy,
        free: sum.free + t.free,
        rest: sum.rest + t.rest,
      }),
      { busy: 0, free: 0, rest: 0 },
    );
  const technician = TECNICOS.find((t) => t.id === technicianId)!;
  const close = () => {
    setModal(null);
    setTask(null);
    setDayOff(null);
  };
  const createTask = (taskDate = date, start = '08:00', end = '09:00') =>
    setTask({
      id: crypto.randomUUID(),
      technicianId,
      date: taskDate,
      start,
      end,
      title: '',
      notes: '',
      workOrderId: '',
      workOrderFolio: '',
      updatedAt: new Date().toISOString(),
      status: ASSIGNMENT_STATUS.PENDING,
    });
  const move = (direction: number) => {
    if (view === VIEW.WEEK) setDate(addDays(date, direction * 7));
    else {
      const [year, month] = date.split('-').map(Number);
      setDate(
        new Date(Date.UTC(year, month - 1 + direction, 1))
          .toISOString()
          .slice(0, 10),
      );
    }
  };
  const calendarProps = {
    data,
    technicianId,
    date,
    onTask: createTask,
    onEdit: setTask,
    onDayOff: setDayOff,
    onDay: (day: string) => {
      setDate(day);
      setView(VIEW.WEEK);
    },
  };
  return (
    <div className='space-y-5 py-5 sm:py-7'>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <div className='text-app-text-secondary mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase'>
            <CalendarDays size={15} /> Gestión del equipo
          </div>
          <h1 className='text-app-text-primary text-3xl font-bold tracking-tight'>
            Planeación
          </h1>
          <p className='text-app-text-secondary mt-2 max-w-xl text-sm'>
            Organizá la jornada, asigná tareas y encontrá el próximo espacio
            disponible.
          </p>
        </div>
        <ActionButton
          onClick={() => createTask()}
          className='border-app-brand bg-app-brand text-shForeground hover:bg-app-brand-soft px-4 py-3'
        >
          <Plus size={17} /> Asignar tarea
        </ActionButton>
      </header>
      <div className='border-app-border-soft bg-app-surface-subtle text-app-text-secondary flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-xs'>
        <p>
          <strong className='text-app-text-primary'>
            Modo demo · Jefe de mantenimiento
          </strong>{' '}
          — Datos de prueba guardados solo en este navegador. No se comparten
          entre usuarios.
        </p>
        <span>Hora de empresa: Ciudad de México</span>
      </div>
      {notice && (
        <p
          role='alert'
          className='bg-shDanger-50 text-shDanger-800 rounded-lg p-3 text-sm'
        >
          {notice}
        </p>
      )}
      <section
        className={cn(panelClass, 'space-y-4')}
        aria-label='Controles de la agenda'
      >
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div className='min-w-56'>
            <Field label='Técnico'>
              <select
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
              >
                {TECNICOS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <ActionButton onClick={() => setModal(MODAL.SCHEDULE)}>
              <Clock3 size={16} /> Horario semanal
            </ActionButton>
            <ActionButton onClick={() => setModal(MODAL.COPY)}>
              <Copy size={16} /> Copiar semana anterior
            </ActionButton>
            <ActionButton onClick={() => setModal(MODAL.TEMPLATES)}>
              <Settings2 size={16} /> Turnos guía
            </ActionButton>
            <ActionButton
              aria-label='Ver historial de cambios'
              title='Historial de cambios'
              onClick={() => setModal(MODAL.AUDIT)}
            >
              <History size={16} />
            </ActionButton>
          </div>
        </div>
        <div className='border-app-border-soft flex flex-wrap items-center justify-between gap-3 border-t pt-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <ActionButton
              aria-label={
                view === VIEW.WEEK ? 'Semana anterior' : 'Mes anterior'
              }
              onClick={() => move(-1)}
            >
              <ChevronLeft size={16} />
            </ActionButton>
            <ActionButton onClick={() => setDate(today())}>Hoy</ActionButton>
            <ActionButton
              aria-label={
                view === VIEW.WEEK ? 'Semana siguiente' : 'Mes siguiente'
              }
              onClick={() => move(1)}
            >
              <ChevronRight size={16} />
            </ActionButton>
            <h2
              aria-live='polite'
              className='text-app-text-primary ml-1 text-sm font-semibold capitalize'
            >
              {view === VIEW.WEEK
                ? `${dateLabel(monday)} — ${dateLabel(addDays(monday, 6), { day: 'numeric', month: 'short', year: 'numeric' })}`
                : dateLabel(date, { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <label className='sr-only' htmlFor='planning-date'>
              Ir a fecha
            </label>
            <input
              id='planning-date'
              className='w-auto! max-w-40'
              type='date'
              value={date}
              onChange={(e) => {
                if (e.target.value) setDate(e.target.value);
              }}
            />
            <div
              className='border-app-border-soft bg-app-surface-subtle flex rounded-lg border p-1'
              role='group'
              aria-label='Vista de calendario'
            >
              {[
                { value: VIEW.WEEK, label: 'Semana' },
                { value: VIEW.MONTH, label: 'Mes' },
              ].map((v) => (
                <button
                  type='button'
                  key={v.value}
                  aria-pressed={view === v.value}
                  onClick={() => setView(v.value)}
                  className={cn(
                    'rounded-md px-4 py-2 text-sm font-semibold focus-visible:outline-2',
                    view === v.value
                      ? 'bg-shPrimary-800 text-white shadow-sm'
                      : 'text-app-text-secondary',
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section
        className='grid grid-cols-2 gap-3 lg:grid-cols-4'
        aria-label='Resumen de la semana seleccionada'
      >
        {[
          {
            label: 'Técnico seleccionado',
            value: technician.nombre,
            sub: 'Jornada individual',
            icon: Users,
          },
          {
            label: 'Horas asignadas',
            value: hours(totals.busy),
            sub: 'Semana del ' + dateLabel(monday),
            icon: CalendarDays,
          },
          {
            label: 'Horas libres',
            value: hours(totals.free),
            sub: 'Sin contar descansos ni bloqueos',
            icon: Clock3,
          },
          {
            label: 'Ocupación semanal',
            value: `${totals.busy + totals.free ? Math.round((totals.busy / (totals.busy + totals.free)) * 100) : 0}%`,
            sub: `${hours(totals.rest)} de descanso`,
            icon: History,
          },
        ].map((item) => (
          <div key={item.label} className={panelClass}>
            <div className='text-app-text-secondary flex items-center justify-between gap-2'>
              <span className='text-xs'>{item.label}</span>
              <item.icon size={16} />
            </div>
            <p className='text-app-text-primary mt-3 text-xl font-bold sm:text-2xl'>
              {item.value}
            </p>
            <p className='text-app-text-secondary mt-1 text-[11px]'>
              {item.sub}
            </p>
          </div>
        ))}
      </section>
      <div className='text-app-text-secondary flex flex-wrap items-center justify-between gap-3 text-xs'>
        <p>
          {view === VIEW.WEEK
            ? 'Seleccioná un espacio libre para asignar trabajo o una tarea para editarla.'
            : 'Seleccioná un día para abrir su semana. Marcá ausencias y cierres desde “No laboral…”.'}
        </p>
        <div className='flex flex-wrap gap-3'>
          <span className='flex items-center gap-1'>
            <i className='bg-shPrimary-800 h-2.5 w-2.5 rounded-sm' /> OT
          </span>
          <span className='flex items-center gap-1'>
            <i className='border-shPrimary-300 bg-shPrimary-50 h-2.5 w-2.5 rounded-sm border' />{' '}
            General
          </span>
          <span className='flex items-center gap-1'>
            <i className='border-shSuccess-200 bg-shSuccess-50 h-2.5 w-2.5 rounded-sm border' />{' '}
            Libre
          </span>
          <span className='flex items-center gap-1'>
            <i className='bg-shNeutral-200 h-2.5 w-2.5 rounded-sm' /> Descanso
          </span>
        </div>
      </div>
      {view === VIEW.WEEK ? (
        <WeekCalendar {...calendarProps} />
      ) : (
        <MonthCalendar {...calendarProps} />
      )}
      <p className='text-app-text-secondary text-xs'>
        La barra diaria representa las 24 horas. Las semanas sin horario
        configurado no tienen disponibilidad. Un día no laboral bloquea su fecha
        completa, también en turnos nocturnos.
      </p>
      {task && (
        <TaskDialog key={task.id} data={data} task={task} onClose={close} />
      )}
      {modal === MODAL.SCHEDULE && (
        <ScheduleDialog
          data={data}
          technicianId={technicianId}
          monday={monday}
          onClose={close}
        />
      )}
      {modal === MODAL.TEMPLATES && (
        <TemplatesDialog data={data} onClose={close} />
      )}
      {modal === MODAL.COPY && (
        <CopyDialog
          data={data}
          technicianId={technicianId}
          monday={monday}
          onClose={close}
        />
      )}
      {dayOff && (
        <DayOffDialog
          data={data}
          technicianId={technicianId}
          date={dayOff}
          onClose={close}
        />
      )}
      {modal === MODAL.AUDIT && (
        <Dialog title='Historial local de cambios' onClose={close}>
          <p className='text-app-text-secondary text-xs'>
            Últimos 100 cambios de esta demo. No es un registro de auditoría de
            servidor.
          </p>
          {data.audit.length ? (
            <ol className='space-y-3'>
              {data.audit.map((entry) => (
                <li
                  key={entry.id}
                  className='border-app-border-soft rounded-lg border p-3 text-sm'
                >
                  <p className='font-semibold'>{entry.action}</p>
                  <p className='text-app-text-secondary text-xs'>
                    {entry.actor} ·{' '}
                    {new Date(entry.at).toLocaleString('es-MX', {
                      timeZone: 'America/Mexico_City',
                    })}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className='text-app-text-secondary text-sm'>
              Todavía no hay cambios registrados.
            </p>
          )}
        </Dialog>
      )}
    </div>
  );
}
