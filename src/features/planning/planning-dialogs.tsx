'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

import { TECNICOS } from '@/app/data/constants';
import { useWorkOrdersStore } from '@/app/stores/useWorkOrdersStore';
import {
  ASSIGNMENT_STATUS,
  addDays,
  clockMinutes,
  copyPreviousWeek,
  dataConflicts,
  dateLabel,
  isDayOff,
  replaceWeek,
  validateSchedule,
  weekSchedules,
  WEEKDAYS,
  type Assignment,
  type DaySchedule,
  type PlanningData,
} from './domain';
import { usePlanningStore } from './store';
import AssignmentStatusBadge from './assignment-status-badge';
import { ActionButton, Dialog, ErrorMessage, Field } from './planning-ui';

interface BaseProps {
  data: PlanningData;
  onClose: () => void;
}
interface WeekProps extends BaseProps {
  technicianId: string;
  monday: string;
}
const primaryClass =
  'border-shPrimary-800 bg-shPrimary-800 text-white hover:bg-shPrimary-900';

function useSave(onClose: () => void) {
  const [error, setError] = useState('');
  const commit = usePlanningStore((s) => s.commit);
  const save = (next: PlanningData, action: string) => {
    const message = commit(next, action);
    if (message) {
      setError(message);
      return;
    }
    toast.success(action);
    onClose();
  };
  return { error, setError, save };
}

export function TaskDialog({
  data,
  task,
  onClose,
}: BaseProps & { task: Assignment }) {
  const [draft, setDraft] = useState(task);
  const [query, setQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const orders = useWorkOrdersStore((s) => s.ordenes);
  const { error, setError, save } = useSave(onClose);
  const editing = data.assignments.some((a) => a.id === task.id);
  const selectedOrder = orders.find((o) => o.id === draft.workOrderId);
  const eligible = orders.filter(
    (o) =>
      (o.tecnicoId === draft.technicianId || !o.tecnicoId) &&
      !['cerrada', 'cancelada', 'completada'].includes(o.status),
  );
  const matches = eligible
    .filter((o) =>
      `${o.folio} ${o.titulo}`.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 60);
  const visibleOrders =
    selectedOrder && !matches.some((o) => o.id === selectedOrder.id)
      ? [selectedOrder, ...matches]
      : matches;
  const technician = TECNICOS.find((t) => t.id === draft.technicianId);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const latest = data.assignments.find((a) => a.id === task.id);
    if (editing && latest?.updatedAt !== task.updatedAt) {
      setError(
        'Esta tarea cambió mientras la editabas. Cerrá y volvé a abrir el detalle antes de guardar.',
      );
      return;
    }
    if (draft.workOrderId && !selectedOrder) {
      setError(
        'La OT ya no está disponible en la demo. Desvinculala o elegí otra.',
      );
      return;
    }
    if (
      selectedOrder?.tecnicoId &&
      selectedOrder.tecnicoId !== draft.technicianId
    ) {
      setError(
        'La OT pertenece a otro técnico. Elegí una OT del técnico seleccionado.',
      );
      return;
    }
    const updated = {
      ...draft,
      title: draft.title.trim(),
      notes: draft.notes.trim(),
      updatedAt: new Date().toISOString(),
    };
    save(
      {
        ...data,
        assignments: [
          ...data.assignments.filter((a) => a.id !== draft.id),
          updated,
        ],
      },
      `${editing ? 'Tarea actualizada' : 'Tarea asignada'} · ${technician?.nombre} · ${updated.title} · ${updated.date} ${updated.start}–${updated.end}`,
    );
  }
  function linkOrder(id: string) {
    const order = orders.find((o) => o.id === id);
    setDraft({
      ...draft,
      workOrderId: id,
      workOrderFolio: order?.folio || '',
      title: draft.title || order?.titulo || '',
    });
  }
  const currentTask = data.assignments.find((a) => a.id === task.id) ?? task;
  if (
    currentTask.status === ASSIGNMENT_STATUS.COMPLETED ||
    currentTask.status === ASSIGNMENT_STATUS.CANCELLED
  ) {
    return (
      <Dialog title='Detalle de asignación' onClose={onClose}>
        <AssignmentStatusBadge status={currentTask.status} />
        <h3 className='text-lg font-semibold'>{currentTask.title}</h3>
        <p>
          {technician?.nombre} · {currentTask.date} · {currentTask.start}–
          {currentTask.end}
        </p>
        <p className='text-app-text-secondary text-sm'>{currentTask.notes}</p>
        {currentTask.workOrderFolio && (
          <p className='text-sm'>
            OT relacionada: {currentTask.workOrderFolio}. Su estado se gestiona
            por separado.
          </p>
        )}
        <p className='text-app-text-secondary text-sm'>
          Esta asignación se conserva como historial y no puede editarse.
        </p>
      </Dialog>
    );
  }
  return (
    <Dialog
      title={editing ? 'Editar asignación' : 'Asignar tarea'}
      onClose={onClose}
    >
      <p className='text-app-text-secondary text-sm'>
        Técnico:{' '}
        <strong className='text-app-text-primary'>{technician?.nombre}</strong>
      </p>
      <AssignmentStatusBadge status={currentTask.status} />
      <form onSubmit={submit} className='space-y-4'>
        <Field label='Tarea'>
          <input
            required
            maxLength={140}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder='Ej. Limpieza de almacén'
          />
        </Field>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <Field label='Fecha de inicio'>
            <input
              required
              type='date'
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
          </Field>
          <Field label='Desde'>
            <input
              required
              type='time'
              value={draft.start}
              onChange={(e) => setDraft({ ...draft, start: e.target.value })}
            />
          </Field>
          <Field label='Hasta'>
            <input
              required
              type='time'
              value={draft.end}
              onChange={(e) => setDraft({ ...draft, end: e.target.value })}
            />
          </Field>
        </div>
        {clockMinutes(draft.end) < clockMinutes(draft.start) && (
          <p className='text-shPrimary-700 text-sm'>
            Finaliza el día siguiente a las {draft.end}.
          </p>
        )}
        <div className='border-app-border-soft bg-app-surface-subtle space-y-2 rounded-xl border p-3'>
          <Field label='Buscar OT (opcional)'>
            <input
              type='search'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Folio o título'
            />
          </Field>
          <Field label='Orden de trabajo relacionada'>
            <select
              value={draft.workOrderId}
              onChange={(e) => linkOrder(e.target.value)}
            >
              <option value=''>Sin OT · tarea general</option>
              {draft.workOrderId && !selectedOrder && (
                <option value={draft.workOrderId}>
                  {draft.workOrderFolio} · ya no disponible
                </option>
              )}
              {visibleOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.folio} · {o.titulo}
                </option>
              ))}
            </select>
          </Field>
          <p className='text-app-text-secondary text-xs'>
            OT abiertas del técnico o sin responsable. Vincular no cambia el
            estado ni el responsable de la orden. Se muestran hasta 60
            coincidencias.
          </p>
          {selectedOrder && (
            <details className='border-app-border-soft bg-app-surface rounded-lg border p-3 text-sm'>
              <summary className='text-shPrimary-800 cursor-pointer font-semibold'>
                Ver detalle de {selectedOrder.folio}
              </summary>
              <dl className='mt-3 space-y-2'>
                <div>
                  <dt className='text-app-text-secondary text-xs'>Título</dt>
                  <dd>{selectedOrder.titulo}</dd>
                </div>
                <div>
                  <dt className='text-app-text-secondary text-xs'>
                    Estado / prioridad
                  </dt>
                  <dd>
                    {selectedOrder.status} · {selectedOrder.prioridad}
                  </dd>
                </div>
                <div>
                  <dt className='text-app-text-secondary text-xs'>
                    Responsable
                  </dt>
                  <dd>{selectedOrder.tecnicoNombre || 'Sin asignar'}</dd>
                </div>
                <div>
                  <dt className='text-app-text-secondary text-xs'>
                    Descripción
                  </dt>
                  <dd>
                    {selectedOrder.descripcionProblema ||
                      selectedOrder.descripcion ||
                      'Sin descripción'}
                  </dd>
                </div>
              </dl>
            </details>
          )}
          {selectedOrder && (
            <Link
              href={`/dashboard/workorders?ot=${encodeURIComponent(selectedOrder.id)}`}
              className='text-shPrimary-700 inline-block text-sm font-semibold underline'
            >
              Abrir {selectedOrder.folio} en Órdenes de Trabajo →
            </Link>
          )}
        </div>
        <Field label='Indicaciones (opcional)'>
          <textarea
            maxLength={2000}
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            placeholder='Instrucciones para el técnico'
          />
        </Field>
        {editing && (
          <p className='text-app-text-secondary text-xs'>
            Última modificación:{' '}
            {new Date(task.updatedAt).toLocaleString('es-MX', {
              timeZone: 'America/Mexico_City',
            })}
          </p>
        )}
        <ErrorMessage error={error} />
        <div className='flex flex-wrap justify-end gap-2'>
          {editing && (
            <ActionButton
              className='text-shDanger-700 mr-auto'
              onClick={() => setConfirmDelete(true)}
            >
              Cancelar asignación
            </ActionButton>
          )}
          <ActionButton onClick={onClose}>Cerrar</ActionButton>
          <ActionButton type='submit' className={primaryClass}>
            Guardar tarea
          </ActionButton>
        </div>
        {confirmDelete && (
          <div className='border-shDanger-200 bg-shDanger-50 text-shDanger-800 space-y-2 rounded-lg border p-3 text-sm'>
            <p>
              ¿Cancelar esta asignación y liberar su horario? La OT relacionada
              no se modifica.
            </p>
            <div className='flex gap-2'>
              <ActionButton onClick={() => setConfirmDelete(false)}>
                Volver
              </ActionButton>
              <ActionButton
                onClick={() =>
                  save(
                    {
                      ...data,
                      assignments: data.assignments.map((a) =>
                        a.id === task.id
                          ? {
                              ...a,
                              status: ASSIGNMENT_STATUS.CANCELLED,
                              updatedAt: new Date().toISOString(),
                            }
                          : a,
                      ),
                    },
                    'Asignación cancelada',
                  )
                }
              >
                Confirmar cancelación
              </ActionButton>
            </div>
          </div>
        )}
      </form>
    </Dialog>
  );
}

export function ScheduleDialog({
  data,
  technicianId,
  monday,
  onClose,
}: WeekProps) {
  const [draft, setDraft] = useState(() =>
    weekSchedules(data, technicianId, monday),
  );
  const [templateId, setTemplateId] = useState(data.templates[0].id);
  const { error, save } = useSave(onClose);
  const update = (index: number, patch: Partial<DaySchedule>) =>
    setDraft(draft.map((s, n) => (n === index ? { ...s, ...patch } : s)));
  const applyTemplate = () => {
    const template = data.templates.find((t) => t.id === templateId)!;
    setDraft(
      draft.map((s, index) => ({
        ...s,
        working: template.weekdays.includes(index),
        start: template.start,
        end: template.end,
        breakStart: template.breakStart,
        breakEnd: template.breakEnd,
      })),
    );
  };
  return (
    <Dialog
      title={`Horario · ${dateLabel(monday)} al ${dateLabel(addDays(monday, 6))}`}
      onClose={onClose}
      wide
    >
      <p className='text-app-text-secondary text-sm'>
        Personalizá la jornada de{' '}
        <strong>{TECNICOS.find((t) => t.id === technicianId)?.nombre}</strong>.
        Solo afecta esta semana. Una salida anterior a la entrada termina al día
        siguiente.
      </p>
      <div className='flex flex-wrap items-end gap-3'>
        <Field label='Turno guía'>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
          >
            {data.templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {t.start}–{t.end}
              </option>
            ))}
          </select>
        </Field>
        <ActionButton onClick={applyTemplate}>
          Aplicar guía a esta semana
        </ActionButton>
      </div>
      <form
        className='space-y-4'
        onSubmit={(e) => {
          e.preventDefault();
          save(
            replaceWeek(data, technicianId, monday, draft),
            'Horario semanal guardado',
          );
        }}
      >
        <div className='space-y-3'>
          {draft.map((s, n) => (
            <div
              key={s.date}
              className='border-app-border-soft bg-app-surface-subtle rounded-xl border p-3'
            >
              <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                <label className='flex items-center gap-2 text-sm font-semibold'>
                  <input
                    type='checkbox'
                    className='w-auto!'
                    checked={s.working}
                    onChange={(e) => update(n, { working: e.target.checked })}
                  />
                  {WEEKDAYS[n]} · {dateLabel(s.date)}{' '}
                  {s.working ? '' : '· Sin jornada'}
                </label>
                {isDayOff(data, technicianId, s.date).length > 0 && (
                  <span className='text-shDanger-700 text-xs'>
                    Día no laboral: se respetará el bloqueo
                  </span>
                )}
              </div>
              {s.working && (
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                  <Field label='Entrada'>
                    <input
                      required
                      type='time'
                      value={s.start}
                      onChange={(e) => update(n, { start: e.target.value })}
                    />
                  </Field>
                  <Field label='Salida'>
                    <input
                      required
                      type='time'
                      value={s.end}
                      onChange={(e) => update(n, { end: e.target.value })}
                    />
                  </Field>
                  <Field label='Inicio descanso'>
                    <input
                      type='time'
                      value={s.breakStart}
                      onChange={(e) =>
                        update(n, { breakStart: e.target.value })
                      }
                    />
                  </Field>
                  <Field label='Fin descanso'>
                    <input
                      type='time'
                      value={s.breakEnd}
                      onChange={(e) => update(n, { breakEnd: e.target.value })}
                    />
                  </Field>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className='text-app-text-secondary text-xs'>
          Dejá ambos campos de descanso vacíos si no corresponde. Si hay tareas
          afectadas, deberás reprogramarlas o cancelarlas antes de cambiar la
          jornada.
        </p>
        <ErrorMessage error={error} />
        <div className='flex justify-end gap-2'>
          <ActionButton onClick={onClose}>Cancelar</ActionButton>
          <ActionButton type='submit' className={primaryClass}>
            Guardar horario
          </ActionButton>
        </div>
      </form>
    </Dialog>
  );
}

export function TemplatesDialog({ data, onClose }: BaseProps) {
  const [templates, setTemplates] = useState(
    data.templates.map((t) => ({ ...t, weekdays: [...t.weekdays] })),
  );
  const { error, setError, save } = useSave(onClose);
  return (
    <Dialog title='Turnos guía de la empresa' onClose={onClose} wide>
      <p className='text-app-text-secondary text-sm'>
        Plantillas de ejemplo editables. Cambiarlas no modifica jornadas ya
        asignadas: aplicá la guía desde “Horario semanal”.
      </p>
      <form
        className='space-y-4'
        onSubmit={(e) => {
          e.preventDefault();
          for (const t of templates) {
            const message = validateSchedule({
              ...t,
              date: '2026-01-01',
              technicianId: 'template',
              working: true,
            });
            if (message) {
              setError(`${t.name}: ${message}`);
              return;
            }
          }
          save({ ...data, templates }, 'Turnos guía actualizados');
        }}
      >
        {templates.map((t, index) => {
          const update = (patch: Partial<typeof t>) =>
            setTemplates(
              templates.map((item, n) =>
                n === index ? { ...item, ...patch } : item,
              ),
            );
          return (
            <div
              key={t.id}
              className='border-app-border-soft bg-app-surface-subtle space-y-3 rounded-xl border p-3'
            >
              <Field label='Nombre del turno'>
                <input
                  required
                  maxLength={40}
                  value={t.name}
                  onChange={(e) => update({ name: e.target.value })}
                />
              </Field>
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                <Field label='Entrada'>
                  <input
                    required
                    type='time'
                    value={t.start}
                    onChange={(e) => update({ start: e.target.value })}
                  />
                </Field>
                <Field label='Salida'>
                  <input
                    required
                    type='time'
                    value={t.end}
                    onChange={(e) => update({ end: e.target.value })}
                  />
                </Field>
                <Field label='Inicio descanso'>
                  <input
                    type='time'
                    value={t.breakStart}
                    onChange={(e) => update({ breakStart: e.target.value })}
                  />
                </Field>
                <Field label='Fin descanso'>
                  <input
                    type='time'
                    value={t.breakEnd}
                    onChange={(e) => update({ breakEnd: e.target.value })}
                  />
                </Field>
              </div>
              <fieldset>
                <legend className='text-app-text-secondary mb-2 text-sm'>
                  Días laborales
                </legend>
                <div className='flex flex-wrap gap-3'>
                  {WEEKDAYS.map((name, day) => (
                    <label
                      key={name}
                      className='flex items-center gap-1 text-sm'
                    >
                      <input
                        type='checkbox'
                        className='w-auto!'
                        checked={t.weekdays.includes(day)}
                        onChange={(e) =>
                          update({
                            weekdays: e.target.checked
                              ? [...t.weekdays, day]
                              : t.weekdays.filter((d) => d !== day),
                          })
                        }
                      />
                      {name}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          );
        })}
        <ErrorMessage error={error} />
        <div className='flex justify-end gap-2'>
          <ActionButton onClick={onClose}>Cancelar</ActionButton>
          <ActionButton type='submit' className={primaryClass}>
            Guardar guías
          </ActionButton>
        </div>
      </form>
    </Dialog>
  );
}

export function CopyDialog({ data, technicianId, monday, onClose }: WeekProps) {
  const { error, save } = useSave(onClose);
  const candidate = copyPreviousWeek(data, technicianId, monday);
  const conflicts = dataConflicts(candidate);
  const sourceExists = data.schedules.some(
    (s) =>
      s.technicianId === technicianId &&
      s.date >= addDays(monday, -7) &&
      s.date < monday,
  );
  const before = weekSchedules(data, technicianId, monday),
    after = weekSchedules(candidate, technicianId, monday);
  const label = (s: DaySchedule) =>
    s.working
      ? `${s.start}–${s.end}${s.breakStart ? ` · descanso ${s.breakStart}–${s.breakEnd}` : ''}`
      : 'Sin jornada';
  return (
    <Dialog title='Copiar semana anterior' onClose={onClose} wide>
      <p className='text-app-text-secondary text-sm'>
        De {dateLabel(addDays(monday, -7))}–{dateLabel(addDays(monday, -1))} a{' '}
        {dateLabel(monday)}–{dateLabel(addDays(monday, 6))}. Se reemplaza el
        horario del técnico seleccionado.{' '}
        <strong>No se copian tareas ni OT.</strong>
      </p>
      <div className='overflow-x-auto'>
        <table className='w-full text-left text-sm'>
          <caption className='sr-only'>
            Vista previa de horarios antes y después de copiar
          </caption>
          <thead>
            <tr className='border-app-border-soft text-app-text-secondary border-b'>
              <th className='p-2'>Día</th>
              <th className='p-2'>Actual</th>
              <th className='p-2'>Después de copiar</th>
            </tr>
          </thead>
          <tbody>
            {after.map((s, n) => (
              <tr key={s.date} className='border-app-border-soft border-b'>
                <th className='p-2 font-medium'>
                  {dateLabel(s.date)}
                  {isDayOff(data, technicianId, s.date).length > 0 && (
                    <span className='text-shDanger-700 block text-xs'>
                      No laboral: se mantiene
                    </span>
                  )}
                </th>
                <td className='p-2'>{label(before[n])}</td>
                <td className='p-2'>{label(s)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!sourceExists && (
        <ErrorMessage error='La semana anterior no tiene horarios configurados. Configurá primero su jornada.' />
      )}
      <ErrorMessage
        error={
          conflicts.length
            ? `No se puede aplicar todavía. Reprogramá las tareas afectadas o ajustá los horarios:\n${conflicts.join('\n')}`
            : error
        }
      />
      <div className='flex justify-end gap-2'>
        <ActionButton onClick={onClose}>Volver</ActionButton>
        <ActionButton
          disabled={!sourceExists || conflicts.length > 0}
          className={primaryClass}
          onClick={() =>
            save(candidate, 'Jornada copiada de la semana anterior')
          }
        >
          Confirmar copia
        </ActionButton>
      </div>
    </Dialog>
  );
}

export function DayOffDialog({
  data,
  technicianId,
  date,
  onClose,
}: BaseProps & { technicianId: string; date: string }) {
  const [selectedDate, setSelectedDate] = useState(date);
  const [scope, setScope] = useState(technicianId);
  const [reason, setReason] = useState('');
  const { error, setError, save } = useSave(onClose);
  const existing = isDayOff(data, technicianId, selectedDate);
  return (
    <Dialog title='Días no laborales y ausencias' onClose={onClose}>
      <p className='text-app-text-secondary text-sm'>
        Bloquea de 00:00 a 24:00 del día elegido, incluso la parte de un turno
        nocturno iniciado el día anterior.
      </p>
      <form
        className='space-y-4'
        onSubmit={(e) => {
          e.preventDefault();
          const technician = scope || null;
          if (
            data.daysOff.some(
              (d) => d.date === selectedDate && d.technicianId === technician,
            )
          ) {
            setError(
              'Ese bloqueo ya existe. Podés quitarlo desde la lista inferior.',
            );
            return;
          }
          save(
            {
              ...data,
              daysOff: [
                ...data.daysOff,
                {
                  id: crypto.randomUUID(),
                  date: selectedDate,
                  technicianId: technician,
                  reason: reason.trim(),
                },
              ],
            },
            'Día no laboral registrado',
          );
        }}
      >
        <Field label='Fecha'>
          <input
            required
            type='date'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </Field>
        <Field label='Aplicar a'>
          <select value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value={technicianId}>
              {TECNICOS.find((t) => t.id === technicianId)?.nombre}
            </option>
            <option value=''>Toda la empresa</option>
          </select>
        </Field>
        <Field label='Motivo'>
          <input
            required
            maxLength={120}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder='Ej. Vacaciones, permiso, cierre de planta'
          />
        </Field>
        <ErrorMessage error={error} />
        <div className='flex justify-end gap-2'>
          <ActionButton onClick={onClose}>Cerrar</ActionButton>
          <ActionButton type='submit' className={primaryClass}>
            Marcar no laboral
          </ActionButton>
        </div>
      </form>
      {existing.length > 0 && (
        <div className='border-app-border-soft space-y-2 border-t pt-4'>
          <h3 className='font-semibold'>Bloqueos de este día</h3>
          {existing.map((d) => (
            <div
              key={d.id}
              className='bg-app-surface-subtle flex items-center justify-between gap-2 rounded-lg p-3 text-sm'
            >
              <div>
                <p>{d.reason}</p>
                <p className='text-app-text-secondary text-xs'>
                  {d.technicianId ? 'Solo este técnico' : 'Toda la empresa'}
                </p>
              </div>
              <ActionButton
                onClick={() =>
                  save(
                    {
                      ...data,
                      daysOff: data.daysOff.filter((item) => item.id !== d.id),
                    },
                    'Día no laboral retirado',
                  )
                }
              >
                Quitar
              </ActionButton>
            </div>
          ))}
        </div>
      )}
    </Dialog>
  );
}
