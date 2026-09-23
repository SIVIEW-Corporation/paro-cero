'use client';

import { useEffect, useRef } from 'react';
import { CalendarOff, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  ASSIGNMENT_STATUS,
  ASSIGNMENT_STATUS_LABEL,
  SEGMENT,
  WEEKDAYS,
  addDays,
  clockLabel,
  dateLabel,
  daySegments,
  dayTotals,
  hours,
  isDayOff,
  today,
  weekStart,
  type Assignment,
  type PlanningData,
} from './domain';
import {
  ActionButton,
  AvailabilityBar,
  segmentClasses,
  segmentLabels,
} from './planning-ui';

interface CalendarProps {
  data: PlanningData;
  technicianId: string;
  date: string;
  onTask: (date: string, start: string, end: string) => void;
  onEdit: (task: Assignment) => void;
  onDayOff: (date: string) => void;
  onDay: (date: string) => void;
}
const HOUR_HEIGHT = 44;

export function WeekCalendar({
  data,
  technicianId,
  date,
  onTask,
  onEdit,
  onDayOff,
}: CalendarProps) {
  const monday = weekStart(date);
  const days = Array.from({ length: 7 }, (_, n) => addDays(monday, n));
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scroll.current) {
      const starts = data.schedules
        .filter(
          (s) =>
            s.technicianId === technicianId &&
            s.working &&
            s.date >= monday &&
            s.date <= addDays(monday, 6),
        )
        .map((s) => Number(s.start.slice(0, 2)));
      scroll.current.scrollTop =
        Math.max(0, Math.min(...starts, 8) - 1) * HOUR_HEIGHT;
    }
  }, [technicianId, monday, data.schedules]);
  return (
    <>
      <div
        ref={scroll}
        className='border-app-border-soft bg-app-surface hidden max-h-[680px] overflow-auto rounded-2xl border md:block'
      >
        <div className='min-w-[1000px]'>
          <div className='border-app-border-soft bg-app-surface sticky top-0 z-20 grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b'>
            <div className='text-app-text-secondary flex items-end p-2 text-[10px]'>
              Hora local
            </div>
            {days.map((day, n) => {
              const segments = daySegments(data, technicianId, day);
              const off = isDayOff(data, technicianId, day);
              return (
                <div
                  key={day}
                  className={cn(
                    'border-app-border-soft space-y-2 border-l px-2 py-3',
                    day === today() && 'bg-app-brand-soft/50',
                  )}
                >
                  <div className='flex items-center justify-between'>
                    <span className='text-app-text-secondary text-xs font-semibold'>
                      {WEEKDAYS[n]}
                    </span>
                    <button
                      type='button'
                      aria-label={`Días no laborales del ${dateLabel(day)}`}
                      title='Marcar o quitar día no laboral'
                      className='text-app-text-secondary hover:bg-app-surface-muted rounded p-1 focus-visible:outline-2'
                      onClick={() => onDayOff(day)}
                    >
                      <CalendarOff size={14} />
                    </button>
                  </div>
                  <p className='text-app-text-primary text-lg font-bold'>
                    {dateLabel(day)}
                  </p>
                  <AvailabilityBar segments={segments} />
                  {off.length > 0 && (
                    <p
                      className='text-shDanger-700 truncate text-[11px]'
                      title={off.map((d) => d.reason).join(', ')}
                    >
                      {off.map((d) => d.reason).join(', ')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className='grid grid-cols-[60px_repeat(7,minmax(0,1fr))]'>
            <div
              className='bg-app-surface-subtle relative'
              style={{ height: 24 * HOUR_HEIGHT }}
            >
              {Array.from({ length: 24 }, (_, h) => (
                <span
                  key={h}
                  className='text-app-text-secondary absolute right-2 text-[10px] tabular-nums'
                  style={{ top: h * HOUR_HEIGHT + 2 }}
                >
                  {clockLabel(h * 60)}
                </span>
              ))}
            </div>
            {days.map((day) => (
              <div
                key={day}
                className='border-app-border-soft bg-app-surface relative border-l'
                style={{ height: 24 * HOUR_HEIGHT }}
              >
                {daySegments(data, technicianId, day).flatMap((segment) => {
                  if (segment.kind === SEGMENT.FREE) {
                    const slots = [];
                    for (let start = segment.start; start < segment.end; ) {
                      const end = Math.min(
                        segment.end,
                        (Math.floor(start / 60) + 1) * 60,
                      );
                      slots.push({ start, end });
                      start = end;
                    }
                    return slots.map((slot) => (
                      <button
                        type='button'
                        key={`free-${slot.start}`}
                        onClick={() =>
                          onTask(
                            day,
                            clockLabel(slot.start),
                            clockLabel(slot.end % 1440),
                          )
                        }
                        aria-label={`Asignar tarea el ${dateLabel(day)} de ${clockLabel(slot.start)} a ${clockLabel(slot.end)}`}
                        title={`${clockLabel(slot.start)}–${clockLabel(slot.end)} · Disponible`}
                        className='border-shSuccess-100 bg-shSuccess-50/60 text-shSuccess-800 hover:bg-shSuccess-100 focus-visible:outline-shPrimary-500 absolute inset-x-0 flex items-center justify-center border-b focus-visible:z-10 focus-visible:outline-2'
                        style={{
                          top: (slot.start / 60) * HOUR_HEIGHT,
                          height: ((slot.end - slot.start) / 60) * HOUR_HEIGHT,
                        }}
                      >
                        <Plus size={12} className='opacity-40' />
                      </button>
                    ));
                  }
                  if (segment.assignment) {
                    const task = segment.assignment;
                    const small = segment.end - segment.start < 60;
                    return (
                      <button
                        type='button'
                        key={`task-${segment.start}`}
                        onClick={() => onEdit(task)}
                        title={`${clockLabel(segment.start)}–${clockLabel(segment.end)} · ${ASSIGNMENT_STATUS_LABEL[task.status]} · ${task.title}${task.workOrderFolio ? ` · ${task.workOrderFolio}` : ''}`}
                        className={cn(
                          'focus-visible:outline-shPrimary-500 absolute inset-x-1 z-10 overflow-hidden rounded-lg border-l-4 p-1.5 text-left shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2',
                          task.status === ASSIGNMENT_STATUS.COMPLETED
                            ? 'border-shSuccess-500 bg-shSuccess-50 text-shSuccess-800'
                            : task.workOrderId
                              ? 'border-shPrimary-500 bg-shPrimary-800 text-white'
                              : 'border-shPrimary-300 bg-shPrimary-50 text-shPrimary-900',
                        )}
                        style={{
                          top: (segment.start / 60) * HOUR_HEIGHT + 1,
                          height: Math.max(
                            12,
                            ((segment.end - segment.start) / 60) * HOUR_HEIGHT -
                              2,
                          ),
                        }}
                      >
                        <p className='truncate text-[10px] font-semibold'>
                          {clockLabel(segment.start)}–{clockLabel(segment.end)}
                          {small ? ` ${task.title}` : ''}
                        </p>
                        {!small && (
                          <p className='mt-1 line-clamp-2 text-xs font-bold'>
                            {task.title}
                          </p>
                        )}
                        {segment.end - segment.start >= 90 && (
                          <p className='mt-1 truncate text-[10px]'>
                            {ASSIGNMENT_STATUS_LABEL[task.status]} ·{' '}
                            {task.workOrderFolio || 'Tarea general'}
                          </p>
                        )}
                      </button>
                    );
                  }
                  return (
                    <div
                      key={`${segment.kind}-${segment.start}`}
                      className={cn(
                        'border-app-border-soft absolute inset-x-0 overflow-hidden border-b p-1 text-center text-[10px]',
                        segmentClasses[segment.kind],
                        segment.kind === SEGMENT.OFF && 'opacity-60',
                      )}
                      style={{
                        top: (segment.start / 60) * HOUR_HEIGHT,
                        height:
                          ((segment.end - segment.start) / 60) * HOUR_HEIGHT,
                      }}
                      title={`${clockLabel(segment.start)}–${clockLabel(segment.end)} · ${segmentLabels[segment.kind]}`}
                    >
                      {segment.kind === SEGMENT.BREAK ? 'Descanso' : ''}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='space-y-3 md:hidden'>
        {days.map((day) => {
          const segments = daySegments(data, technicianId, day);
          return (
            <section
              key={day}
              className='border-app-border-soft bg-app-surface space-y-3 rounded-xl border p-4'
            >
              <div className='flex items-center justify-between'>
                <h3 className='font-semibold'>
                  {dateLabel(day, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                  })}
                </h3>
                <ActionButton
                  aria-label={`No laborales ${day}`}
                  onClick={() => onDayOff(day)}
                >
                  <CalendarOff size={16} />
                </ActionButton>
              </div>
              <AvailabilityBar segments={segments} />
              {isDayOff(data, technicianId, day).map((d) => (
                <p key={d.id} className='text-shDanger-700 text-sm'>
                  {d.reason}
                </p>
              ))}
              {segments
                .filter((s) => s.kind !== SEGMENT.OFF)
                .map((s) => (
                  <div
                    key={s.start}
                    className={cn(
                      'rounded-lg p-3 text-sm',
                      segmentClasses[s.kind],
                    )}
                  >
                    {s.assignment ? (
                      <button
                        type='button'
                        className='w-full text-left'
                        onClick={() => onEdit(s.assignment!)}
                      >
                        <strong>
                          {clockLabel(s.start)}–{clockLabel(s.end)} ·{' '}
                          {s.assignment.title}
                        </strong>
                        <span className='block text-xs'>
                          {ASSIGNMENT_STATUS_LABEL[s.assignment.status]} ·{' '}
                          {s.assignment.workOrderFolio || 'Tarea general'}
                        </span>
                      </button>
                    ) : s.kind === SEGMENT.FREE ? (
                      <button
                        type='button'
                        className='w-full text-left'
                        onClick={() =>
                          onTask(
                            day,
                            clockLabel(s.start),
                            clockLabel(Math.min(s.end, s.start + 60) % 1440),
                          )
                        }
                      >
                        {clockLabel(s.start)}–{clockLabel(s.end)} · Disponible ·
                        Asignar +
                      </button>
                    ) : (
                      `${clockLabel(s.start)}–${clockLabel(s.end)} · Descanso`
                    )}
                  </div>
                ))}
              {segments.every((s) => s.kind === SEGMENT.OFF) && (
                <p className='text-app-text-secondary text-sm'>
                  Sin disponibilidad. Revisá el horario semanal o los días no
                  laborales.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

export function MonthCalendar({
  data,
  technicianId,
  date,
  onDay,
  onDayOff,
}: CalendarProps) {
  const first = `${date.slice(0, 7)}-01`,
    firstCell = weekStart(first);
  const days = Array.from({ length: 42 }, (_, n) => addDays(firstCell, n));
  return (
    <div className='border-app-border-soft bg-app-surface overflow-hidden rounded-2xl border'>
      <div className='bg-app-surface-subtle grid grid-cols-7'>
        {WEEKDAYS.map((name) => (
          <div
            key={name}
            className='text-app-text-secondary p-2 text-center text-xs font-semibold'
          >
            {name}
          </div>
        ))}
      </div>
      <div className='grid grid-cols-7'>
        {days.map((day) => {
          const segments = daySegments(data, technicianId, day),
            totals = dayTotals(segments);
          const off = isDayOff(data, technicianId, day);
          return (
            <div
              key={day}
              className={cn(
                'border-app-border-soft min-h-28 border-t border-r p-1.5 sm:min-h-36 sm:p-3',
                day.slice(0, 7) !== date.slice(0, 7) &&
                  'bg-app-surface-subtle text-app-text-secondary',
                day === today() && 'bg-app-brand-soft/50',
              )}
            >
              <button
                type='button'
                onClick={() => onDay(day)}
                className='w-full rounded text-left focus-visible:outline-2'
                aria-label={`Ver semana del ${dateLabel(day)}. ${hours(totals.busy)} asignadas de ${hours(totals.busy + totals.free)} disponibles`}
              >
                <span
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                    day === today() && 'bg-shPrimary-800 text-white',
                  )}
                >
                  {Number(day.slice(8))}
                </span>
                <span className='mt-2 block text-[10px] sm:text-xs'>
                  {hours(totals.busy)} / {hours(totals.busy + totals.free)}
                </span>
                <span className='bg-app-surface-muted mt-2 flex h-1.5 overflow-hidden rounded-full'>
                  <span
                    className='bg-shPrimary-700'
                    style={{
                      width: `${totals.busy + totals.free ? (totals.busy / (totals.busy + totals.free)) * 100 : 0}%`,
                    }}
                  />
                </span>
                <span className='mt-2 block text-[9px] sm:text-[11px]'>
                  {off.length
                    ? 'No laboral'
                    : totals.busy + totals.free
                      ? `${hours(totals.free)} libres`
                      : 'Sin jornada'}
                </span>
              </button>
              <button
                type='button'
                onClick={() => onDayOff(day)}
                className={cn(
                  'mt-1 w-full truncate rounded text-left text-[9px] underline sm:text-[11px]',
                  off.length ? 'text-shDanger-700' : 'text-app-text-secondary',
                )}
                aria-label={`Configurar días no laborales del ${dateLabel(day)}`}
                title={
                  off.map((d) => d.reason).join(', ') || 'Marcar día no laboral'
                }
              >
                {off.length
                  ? off.map((d) => d.reason).join(', ')
                  : 'No laboral…'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
