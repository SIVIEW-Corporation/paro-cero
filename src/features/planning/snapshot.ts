import { z } from 'zod';
import { ASSIGNMENT_STATUS } from './domain';

// Legacy v1 assignments gain pendiente without replacing their IDs or schedule.
const date = z.iso.date();
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const breakTime = z.union([time, z.literal('')]);
const scheduleSchema = z.object({
  date,
  technicianId: z.string(),
  working: z.boolean(),
  start: time,
  end: time,
  breakStart: breakTime,
  breakEnd: breakTime,
});
export const snapshotSchema = z.object({
  schedules: z.array(scheduleSchema),
  templates: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        start: time,
        end: time,
        breakStart: breakTime,
        breakEnd: breakTime,
        weekdays: z.array(z.number().int().min(0).max(6)),
      }),
    )
    .length(3),
  assignments: z.array(
    z.object({
      id: z.string(),
      technicianId: z.string(),
      date,
      start: time,
      end: time,
      title: z.string(),
      notes: z.string(),
      workOrderId: z.string(),
      workOrderFolio: z.string(),
      updatedAt: z.string(),
      status: z.enum(ASSIGNMENT_STATUS).default(ASSIGNMENT_STATUS.PENDING),
      startedAt: z.iso.datetime().optional(),
      completedAt: z.iso.datetime().optional(),
    }),
  ),
  daysOff: z.array(
    z.object({
      id: z.string(),
      date,
      technicianId: z.string().nullable(),
      reason: z.string(),
    }),
  ),
  audit: z.array(
    z.object({
      id: z.string(),
      at: z.string(),
      action: z.string(),
      actor: z.string(),
    }),
  ),
});
