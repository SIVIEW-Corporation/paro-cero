/** Civil minutes in the company's demo calendar, not UTC instants.
 * Dates/times are intentionally timezone-free. Production must use company TZ.
 */
export interface Interval {
  start: number;
  end: number;
}
export interface DaySchedule {
  date: string;
  technicianId: string;
  working: boolean;
  start: string;
  end: string;
  breakStart: string;
  breakEnd: string;
}
export interface ShiftTemplate {
  id: string;
  name: string;
  start: string;
  end: string;
  breakStart: string;
  breakEnd: string;
  weekdays: number[];
}
export interface DayOff {
  id: string;
  date: string;
  technicianId: string | null;
  reason: string;
}
export const ASSIGNMENT_STATUS = {
  PENDING: 'pendiente',
  IN_PROGRESS: 'en_proceso',
  COMPLETED: 'completada',
  CANCELLED: 'cancelada',
} as const;
export type AssignmentStatus =
  (typeof ASSIGNMENT_STATUS)[keyof typeof ASSIGNMENT_STATUS];
export const ASSIGNMENT_STATUS_LABEL: Record<AssignmentStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  completada: 'Completada',
  cancelada: 'Cancelada',
};
export interface Assignment {
  id: string;
  technicianId: string;
  date: string;
  start: string;
  end: string;
  title: string;
  notes: string;
  workOrderId: string;
  workOrderFolio: string;
  updatedAt: string;
  status: AssignmentStatus;
  startedAt?: string;
  completedAt?: string;
}
export interface AuditEntry {
  id: string;
  at: string;
  action: string;
  actor: string;
}
export interface PlanningData {
  schedules: DaySchedule[];
  templates: ShiftTemplate[];
  daysOff: DayOff[];
  assignments: Assignment[];
  audit: AuditEntry[];
}
export const SEGMENT = {
  FREE: 'free',
  BUSY: 'busy',
  BREAK: 'break',
  OFF: 'off',
} as const;
export type SegmentKind = (typeof SEGMENT)[keyof typeof SEGMENT];
export interface Segment extends Interval {
  kind: SegmentKind;
  assignment?: Assignment;
}
export const MINUTES_PER_DAY = 1440;
export const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const DEFAULT_TEMPLATES: ShiftTemplate[] = [
  {
    id: 'morning',
    name: 'Matutino',
    start: '08:00',
    end: '16:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    weekdays: [0, 1, 2, 3, 4],
  },
  {
    id: 'afternoon',
    name: 'Vespertino',
    start: '14:00',
    end: '22:00',
    breakStart: '18:00',
    breakEnd: '18:30',
    weekdays: [0, 1, 2, 3, 4],
  },
  {
    id: 'night',
    name: 'Nocturno',
    start: '22:00',
    end: '06:00',
    breakStart: '02:00',
    breakEnd: '02:30',
    weekdays: [0, 1, 2, 3, 4],
  },
];
export function dayStart(date: string): number {
  return Date.parse(`${date}T00:00:00Z`) / 60000;
}
export function addDays(date: string, days: number): string {
  return new Date((dayStart(date) + days * MINUTES_PER_DAY) * 60000)
    .toISOString()
    .slice(0, 10);
}
export function weekStart(date: string): string {
  const day = new Date(dayStart(date) * 60000).getUTCDay();
  return addDays(date, -((day + 6) % 7));
}
export function today(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
export function dateLabel(
  date: string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' },
): string {
  return new Intl.DateTimeFormat('es-MX', {
    ...options,
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
}
export function clockMinutes(time: string): number {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return NaN;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
export function clockLabel(minutes: number): string {
  if (minutes === 1440) return '24:00';
  const n = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
}
export function hours(minutes: number): string {
  return `${Number((minutes / 60).toFixed(2))} h`;
}
export function timeRange(date: string, start: string, end: string): Interval {
  const s = clockMinutes(start),
    e = clockMinutes(end);
  return {
    start: dayStart(date) + s,
    end: dayStart(date) + e + (e < s ? 1440 : 0),
  };
}
export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}
export function intersection(a: Interval, b: Interval): Interval | null {
  const start = Math.max(a.start, b.start),
    end = Math.min(a.end, b.end);
  return end > start ? { start, end } : null;
}
export function mergeIntervals(intervals: Interval[]): Interval[] {
  const result: Interval[] = [];
  for (const interval of [...intervals].sort((a, b) => a.start - b.start)) {
    const last = result.at(-1);
    if (last && interval.start <= last.end)
      last.end = Math.max(last.end, interval.end);
    else result.push({ ...interval });
  }
  return result;
}
function subtract(interval: Interval, removed: Interval[]): Interval[] {
  let parts = [interval];
  for (const cut of removed)
    parts = parts.flatMap((part) => {
      if (!overlaps(part, cut)) return [part];
      return [
        { start: part.start, end: Math.min(part.end, cut.start) },
        { start: Math.max(part.start, cut.end), end: part.end },
      ].filter((p) => p.end > p.start);
    });
  return parts;
}
export function breakRange(schedule: DaySchedule): Interval | null {
  if (!schedule.breakStart || !schedule.breakEnd) return null;
  const shift = timeRange(schedule.date, schedule.start, schedule.end);
  let start = dayStart(schedule.date) + clockMinutes(schedule.breakStart);
  if (start < shift.start) start += 1440;
  let end = dayStart(schedule.date) + clockMinutes(schedule.breakEnd);
  while (end < start) end += 1440;
  return { start, end };
}
export function validateSchedule(schedule: DaySchedule): string | null {
  if (!Number.isFinite(dayStart(schedule.date))) return 'Fecha inválida.';
  if (!schedule.working) return null;
  const shift = timeRange(schedule.date, schedule.start, schedule.end);
  if (!Number.isFinite(shift.start + shift.end) || shift.end <= shift.start)
    return 'Entrada y salida deben ser válidas y diferentes.';
  if (Boolean(schedule.breakStart) !== Boolean(schedule.breakEnd))
    return 'Completá inicio y fin del descanso, o dejá ambos vacíos.';
  const rest = breakRange(schedule);
  if (
    rest &&
    (!Number.isFinite(rest.start + rest.end) ||
      rest.end <= rest.start ||
      rest.start < shift.start ||
      rest.end > shift.end ||
      rest.end - rest.start >= shift.end - shift.start)
  )
    return 'El descanso debe estar dentro de la jornada y no ocuparla por completo.';
  return null;
}
export function isDayOff(
  data: PlanningData,
  technicianId: string,
  date: string,
): DayOff[] {
  return data.daysOff.filter(
    (d) =>
      d.date === date && (!d.technicianId || d.technicianId === technicianId),
  );
}
export function availableIntervals(
  data: PlanningData,
  technicianId: string,
): Interval[] {
  const excluded = data.daysOff
    .filter((d) => !d.technicianId || d.technicianId === technicianId)
    .map((d) => ({ start: dayStart(d.date), end: dayStart(d.date) + 1440 }));
  return mergeIntervals(
    data.schedules
      .filter((s) => s.working && s.technicianId === technicianId)
      .flatMap((s) => {
        const rest = breakRange(s);
        return subtract(timeRange(s.date, s.start, s.end), [
          ...excluded,
          ...(rest ? [rest] : []),
        ]);
      }),
  );
}
export function validateAssignment(
  data: PlanningData,
  task: Assignment,
): string | null {
  if (task.status === ASSIGNMENT_STATUS.CANCELLED) return null;
  if (!task.title.trim()) return 'Ingresá el nombre de la tarea.';
  if (!task.technicianId) return 'Seleccioná un técnico.';
  const interval = timeRange(task.date, task.start, task.end);
  if (
    !Number.isFinite(interval.start + interval.end) ||
    interval.end <= interval.start
  )
    return 'El horario debe ser válido y tener una duración mayor a cero.';
  if (
    !availableIntervals(data, task.technicianId).some(
      (i) => i.start <= interval.start && i.end >= interval.end,
    )
  )
    return 'La tarea queda fuera de la jornada disponible o coincide con un descanso o día no laboral.';
  if (
    data.assignments.some(
      (a) =>
        a.id !== task.id &&
        a.status !== ASSIGNMENT_STATUS.CANCELLED &&
        a.technicianId === task.technicianId &&
        overlaps(timeRange(a.date, a.start, a.end), interval),
    )
  )
    return 'El técnico ya tiene otra tarea en ese horario.';
  return null;
}
export function dataConflicts(data: PlanningData): string[] {
  const errors: string[] = [];
  for (const schedule of data.schedules) {
    const error = validateSchedule(schedule);
    if (error) errors.push(`${schedule.date}: ${error}`);
  }
  const working = data.schedules.filter((s) => s.working);
  for (let i = 0; i < working.length; i++)
    for (let j = i + 1; j < working.length; j++) {
      if (
        working[i].technicianId === working[j].technicianId &&
        overlaps(
          timeRange(working[i].date, working[i].start, working[i].end),
          timeRange(working[j].date, working[j].start, working[j].end),
        )
      )
        errors.push(
          `Jornadas superpuestas: ${working[i].date} / ${working[j].date}.`,
        );
    }
  if (errors.length) return errors;
  for (const task of data.assignments) {
    const error = validateAssignment(data, task);
    if (error) errors.push(`${task.date} · ${task.title}: ${error}`);
  }
  return errors;
}
export function emptySchedule(technicianId: string, date: string): DaySchedule {
  return {
    technicianId,
    date,
    working: false,
    start: '08:00',
    end: '16:00',
    breakStart: '12:00',
    breakEnd: '13:00',
  };
}
export function weekSchedules(
  data: PlanningData,
  technicianId: string,
  monday: string,
): DaySchedule[] {
  return Array.from(
    { length: 7 },
    (_, n) =>
      data.schedules.find(
        (s) => s.technicianId === technicianId && s.date === addDays(monday, n),
      ) ?? emptySchedule(technicianId, addDays(monday, n)),
  );
}
export function replaceWeek(
  data: PlanningData,
  technicianId: string,
  monday: string,
  schedules: DaySchedule[],
): PlanningData {
  return {
    ...data,
    schedules: [
      ...data.schedules.filter(
        (s) =>
          s.technicianId !== technicianId ||
          s.date < monday ||
          s.date >= addDays(monday, 7),
      ),
      ...schedules,
    ],
  };
}
export function copyPreviousWeek(
  data: PlanningData,
  technicianId: string,
  monday: string,
): PlanningData {
  return replaceWeek(
    data,
    technicianId,
    monday,
    weekSchedules(data, technicianId, addDays(monday, -7)).map((s) => ({
      ...s,
      date: addDays(s.date, 7),
    })),
  );
}
export function daySegments(
  data: PlanningData,
  technicianId: string,
  date: string,
): Segment[] {
  const base = dayStart(date),
    day = { start: base, end: base + 1440 };
  const available = availableIntervals(data, technicianId)
    .map((i) => intersection(i, day))
    .filter((i): i is Interval => i !== null);
  const tasks = data.assignments.filter(
    (a) =>
      a.technicianId === technicianId &&
      a.status !== ASSIGNMENT_STATUS.CANCELLED &&
      overlaps(timeRange(a.date, a.start, a.end), day),
  );
  const breaks = isDayOff(data, technicianId, date).length
    ? []
    : data.schedules
        .filter((s) => s.technicianId === technicianId && s.working)
        .map(breakRange)
        .filter((i): i is Interval => i !== null)
        .map((i) => intersection(i, day))
        .filter((i): i is Interval => i !== null);
  const boundaries = [
    ...new Set([
      base,
      base + 1440,
      ...available.flatMap((i) => [i.start, i.end]),
      ...breaks.flatMap((i) => [i.start, i.end]),
      ...tasks.flatMap((a) => {
        const i = intersection(timeRange(a.date, a.start, a.end), day)!;
        return [i.start, i.end];
      }),
    ]),
  ].sort((a, b) => a - b);
  return boundaries.slice(0, -1).map((start, n) => {
    const end = boundaries[n + 1];
    const assignment = tasks.find((a) =>
      overlaps(timeRange(a.date, a.start, a.end), { start, end }),
    );
    const kind = assignment
      ? SEGMENT.BUSY
      : available.some((i) => i.start <= start && i.end >= end)
        ? SEGMENT.FREE
        : breaks.some((i) => overlaps(i, { start, end }))
          ? SEGMENT.BREAK
          : SEGMENT.OFF;
    return { start: start - base, end: end - base, kind, assignment };
  });
}
export function dayTotals(segments: Segment[]) {
  const total = (kind: SegmentKind) =>
    segments
      .filter((s) => s.kind === kind)
      .reduce((sum, s) => sum + s.end - s.start, 0);
  return {
    busy: total(SEGMENT.BUSY),
    free: total(SEGMENT.FREE),
    rest: total(SEGMENT.BREAK),
  };
}

export function isPending(task: Assignment): boolean {
  return (
    task.status === ASSIGNMENT_STATUS.PENDING ||
    task.status === ASSIGNMENT_STATUS.IN_PROGRESS
  );
}

/** Half-open civil date range. A cross-midnight task appears in both days,
 * but only once in a monthly result. */
export function tasksForPeriod(
  data: PlanningData,
  technicianId: string,
  from: string,
  until: string,
): Assignment[] {
  const interval = { start: dayStart(from), end: dayStart(until) };
  return data.assignments
    .filter(
      (task) =>
        task.technicianId === technicianId &&
        overlaps(timeRange(task.date, task.start, task.end), interval),
    )
    .sort(
      (a, b) =>
        timeRange(a.date, a.start, a.end).start -
          timeRange(b.date, b.start, b.end).start || a.id.localeCompare(b.id),
    );
}

export function companyClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  const date = `${part('year')}-${part('month')}-${part('day')}`;
  return {
    date,
    minutes:
      dayStart(date) + Number(part('hour')) * 60 + Number(part('minute')),
  };
}

export function nextAssignment(
  data: PlanningData,
  technicianId: string,
  now = new Date(),
): Assignment | undefined {
  const { minutes } = companyClock(now);
  return data.assignments
    .filter(
      (task) =>
        task.technicianId === technicianId &&
        task.status === ASSIGNMENT_STATUS.PENDING &&
        timeRange(task.date, task.start, task.end).end > minutes,
    )
    .sort(
      (a, b) =>
        timeRange(a.date, a.start, a.end).start -
        timeRange(b.date, b.start, b.end).start,
    )[0];
}

export interface TransitionResult {
  data: PlanningData | null;
  error: string | null;
}

/** Domain check, not a substitute for server authorization. */
export function transitionAssignment(
  data: PlanningData,
  taskId: string,
  technicianId: string,
  status: AssignmentStatus,
  at: string,
): TransitionResult {
  const task = data.assignments.find((item) => item.id === taskId);
  const fail = (error: string): TransitionResult => ({ data: null, error });
  if (!task || task.technicianId !== technicianId)
    return fail('La tarea no existe o no pertenece a este técnico.');
  const allowed =
    (task.status === ASSIGNMENT_STATUS.PENDING &&
      status === ASSIGNMENT_STATUS.IN_PROGRESS) ||
    (task.status === ASSIGNMENT_STATUS.IN_PROGRESS &&
      status === ASSIGNMENT_STATUS.COMPLETED);
  if (!allowed)
    return fail(
      'El estado cambió o la transición no está permitida. Primero iniciá la tarea; una tarea finalizada no se puede reabrir.',
    );
  if (
    status === ASSIGNMENT_STATUS.IN_PROGRESS &&
    data.assignments.some(
      (item) =>
        item.technicianId === technicianId &&
        item.status === ASSIGNMENT_STATUS.IN_PROGRESS,
    )
  )
    return fail(
      'Ya tenés una tarea en proceso. Completala antes de iniciar otra.',
    );
  if (!Number.isFinite(Date.parse(at)))
    return fail('La fecha del cambio no es válida.');
  const updated: Assignment = {
    ...task,
    status,
    updatedAt: at,
    ...(status === ASSIGNMENT_STATUS.IN_PROGRESS
      ? { startedAt: at }
      : { completedAt: at }),
  };
  return {
    data: {
      ...data,
      assignments: data.assignments.map((item) =>
        item.id === taskId ? updated : item,
      ),
    },
    error: null,
  };
}
