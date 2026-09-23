'use client';

import { create } from 'zustand';

import { TECNICOS } from '@/app/data/constants';
import { useWorkOrdersStore } from '@/app/stores/useWorkOrdersStore';
import { snapshotSchema } from './snapshot';
import {
  ASSIGNMENT_STATUS,
  ASSIGNMENT_STATUS_LABEL,
  transitionAssignment,
  type AssignmentStatus,
  DEFAULT_TEMPLATES,
  addDays,
  today,
  weekStart,
  dataConflicts,
  type PlanningData,
  type Assignment,
} from './domain';

export const STORAGE_KEY = 'paro-cero-planning-demo-v1';

function seed(): PlanningData {
  const monday = weekStart(today());
  const templates = DEFAULT_TEMPLATES.map((t) => ({
    ...t,
    weekdays: [...t.weekdays],
  }));
  const schedules = TECNICOS.flatMap((technician, index) =>
    [-1, 0, 1].flatMap((week) =>
      Array.from({ length: 7 }, (_, day) => {
        const template = templates[index % 3];
        return {
          technicianId: technician.id,
          date: addDays(monday, week * 7 + day),
          working: template.weekdays.includes(day),
          start: template.start,
          end: template.end,
          breakStart: template.breakStart,
          breakEnd: template.breakEnd,
        };
      }),
    ),
  );
  const task = (
    id: string,
    technicianId: string,
    day: number,
    start: string,
    end: string,
    title: string,
  ): Assignment => ({
    id,
    technicianId,
    date: addDays(monday, day),
    start,
    end,
    title,
    notes: 'Asignación de ejemplo. Podés editarla o vincularla a una OT.',
    workOrderId: '',
    workOrderFolio: '',
    updatedAt: new Date().toISOString(),
    status: ASSIGNMENT_STATUS.PENDING,
  });
  const demoOrder = useWorkOrdersStore
    .getState()
    .ordenes.find(
      (order) =>
        order.tecnicoId === 'T001' &&
        !['cerrada', 'cancelada', 'completada'].includes(order.status),
    );
  const linkedTask = task(
    'demo-check',
    'T001',
    0,
    '09:00',
    '11:00',
    demoOrder ? `Resolver ${demoOrder.folio}` : 'Revisión de equipo',
  );
  if (demoOrder) {
    linkedTask.workOrderId = demoOrder.id;
    linkedTask.workOrderFolio = demoOrder.folio;
  }
  return {
    templates,
    schedules,
    daysOff: [],
    audit: [],
    assignments: [
      task('demo-clean', 'T001', 0, '08:00', '09:00', 'Limpieza de almacén'),
      linkedTask,
      task(
        'demo-tools',
        'T001',
        1,
        '08:00',
        '10:00',
        'Inventario de herramientas',
      ),
      task(
        'demo-round',
        'T002',
        0,
        '14:00',
        '16:00',
        'Recorrido de inspección',
      ),
      task('demo-night', 'T003', 0, '23:00', '01:00', 'Inspección nocturna'),
    ],
  };
}

interface PlanningStore {
  data: PlanningData | null;
  notice: string;
  initialize: () => void;
  sync: () => void;
  commit: (next: PlanningData, action: string) => string | null;
  changeTaskStatus: (
    taskId: string,
    technicianId: string,
    target: AssignmentStatus,
    expected: AssignmentStatus,
  ) => string | null;
}
export const usePlanningStore = create<PlanningStore>((set, get) => {
  let lastSaved: string | null = null;

  function checkForExternalChanges(): string | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === lastSaved) return null;
    if (!raw)
      return 'La agenda local fue eliminada en otra pestaña. Recargá antes de guardar.';
    const latest = snapshotSchema.parse(JSON.parse(raw));
    if (dataConflicts(latest).length)
      return 'La agenda externa tiene conflictos. No se sobrescribieron los datos.';
    lastSaved = raw;
    set({ data: latest });
    return 'La agenda cambió en otra pestaña y se actualizó. Revisá los datos antes de volver a guardar.';
  }

  function persistData(
    next: PlanningData,
    action: string,
    actor: string,
  ): string | null {
    try {
      const changed = checkForExternalChanges();
      if (changed) return changed;
      const result = snapshotSchema.safeParse(next);
      if (!result.success)
        return 'Revisá los datos: hay campos incompletos o inválidos.';
      const conflicts = dataConflicts(result.data);
      if (conflicts.length) return conflicts.join('\n');
      const saved: PlanningData = {
        ...result.data,
        audit: [
          {
            id: crypto.randomUUID(),
            at: new Date().toISOString(),
            action,
            actor,
          },
          ...(get().data?.audit ?? []),
        ].slice(0, 100),
      };
      const serialized = JSON.stringify(saved);
      // Write first: failed storage must not look like a successful status change.
      localStorage.setItem(STORAGE_KEY, serialized);
      lastSaved = serialized;
      set({ data: saved, notice: '' });
      return null;
    } catch {
      return 'No se pudo leer o guardar la agenda local. Revisá el almacenamiento del navegador y volvé a intentar. No se aplicó el cambio.';
    }
  }

  return {
    data: null,
    notice: '',
    initialize: () => {
      if (get().data) return;
      try {
        const workOrders = useWorkOrdersStore.getState();
        workOrders.setOrdenes(workOrders.ordenes);
        const raw = localStorage.getItem(STORAGE_KEY);
        lastSaved = raw;
        const parsed = raw ? snapshotSchema.parse(JSON.parse(raw)) : seed();
        if (dataConflicts(parsed).length)
          throw new Error('Agenda guardada inválida');
        set({ data: parsed });
        if (!raw) {
          const serialized = JSON.stringify(parsed);
          localStorage.setItem(STORAGE_KEY, serialized);
          lastSaved = serialized;
        }
      } catch {
        set({
          data: get().data ?? seed(),
          notice:
            'No se pudo recuperar o guardar la agenda local. Revisá el almacenamiento del navegador; tus cambios solo se confirmarán si se pueden guardar.',
        });
      }
    },
    sync: () => {
      try {
        const changed = checkForExternalChanges();
        if (changed) set({ notice: changed });
      } catch {
        set({
          notice:
            'No se pudo sincronizar la agenda local. Se conserva la última vista disponible.',
        });
      }
    },
    commit: (next, action) => {
      const current = get().data;
      if (!current) return 'La agenda todavía no se cargó.';
      // Planning edits cannot revert execution reported by the technician.
      for (const task of next.assignments) {
        const previous = current.assignments.find(
          (item) => item.id === task.id,
        );
        if (!previous) {
          if (task.status !== ASSIGNMENT_STATUS.PENDING)
            return 'Las tareas nuevas deben comenzar pendientes.';
          continue;
        }
        const cancelling =
          task.status === ASSIGNMENT_STATUS.CANCELLED &&
          previous.status !== ASSIGNMENT_STATUS.COMPLETED;
        if (
          (!cancelling && task.status !== previous.status) ||
          task.startedAt !== previous.startedAt ||
          task.completedAt !== previous.completedAt
        )
          return 'El técnico actualizó esta tarea. Cerrá el formulario y revisá su estado actual.';
        if (
          (previous.status === ASSIGNMENT_STATUS.COMPLETED ||
            previous.status === ASSIGNMENT_STATUS.CANCELLED) &&
          JSON.stringify(task) !== JSON.stringify(previous)
        )
          return 'Las tareas finalizadas se conservan como historial y no se pueden editar.';
      }
      if (
        current.assignments.some(
          (task) => !next.assignments.some((item) => item.id === task.id),
        )
      )
        return 'Cancelá la asignación en lugar de eliminar su historial.';
      return persistData(next, action, 'Jefe · demo');
    },
    changeTaskStatus: (taskId, technicianId, target, expected) => {
      const current = get().data;
      if (!current) return 'La agenda todavía no se cargó.';
      const technician = TECNICOS.find((item) => item.id === technicianId);
      if (!technician) return 'El técnico no pertenece al equipo de prueba.';
      const task = current.assignments.find((item) => item.id === taskId);
      if (task?.status !== expected)
        return 'El estado de la tarea cambió. Revisá su estado actual antes de continuar.';
      const result = transitionAssignment(
        current,
        taskId,
        technicianId,
        target,
        new Date().toISOString(),
      );
      if (!result.data) return result.error;
      return persistData(
        result.data,
        `${task?.title} · ${ASSIGNMENT_STATUS_LABEL[target]} (sin modificar OT)`,
        `${technician.nombre} · técnico demo`,
      );
    },
  };
});
