import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('./domain.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  },
}).outputText;
const d = await import(
  `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`
);
const date = '2026-09-21';
const schedule = (changes = {}) => ({
  technicianId: 'T001',
  date,
  working: true,
  start: '08:00',
  end: '16:00',
  breakStart: '12:00',
  breakEnd: '13:00',
  ...changes,
});
const data = (changes = {}) => ({
  schedules: [schedule()],
  templates: [],
  assignments: [],
  daysOff: [],
  audit: [],
  ...changes,
});
const task = (changes = {}) => ({
  id: 'a',
  technicianId: 'T001',
  date,
  start: '09:00',
  end: '11:00',
  title: 'OT',
  notes: '',
  workOrderId: '',
  workOrderFolio: '',
  updatedAt: '',
  ...changes,
});
test('semana comienza lunes y cruza año', () => {
  assert.equal(d.weekStart('2027-01-01'), '2026-12-28');
});
test('acepta tarea disponible', () =>
  assert.equal(d.validateAssignment(data(), task()), null));
test('rechaza tarea fuera de jornada', () =>
  assert.match(
    d.validateAssignment(data(), task({ start: '07:00' })),
    /fuera/,
  ));
test('rechaza tarea que atraviesa descanso', () =>
  assert.match(
    d.validateAssignment(data(), task({ end: '14:00' })),
    /descanso/,
  ));
test('permite tareas contiguas, no superpuestas', () => {
  const state = data({ assignments: [task()] });
  assert.equal(
    d.validateAssignment(
      state,
      task({ id: 'b', start: '11:00', end: '12:00' }),
    ),
    null,
  );
  assert.match(
    d.validateAssignment(state, task({ id: 'b', start: '10:00' })),
    /otra tarea/,
  );
});
test('permite editar propia tarea', () =>
  assert.equal(
    d.validateAssignment(data({ assignments: [task()] }), task()),
    null,
  ));
test('rechaza duración cero y horas inválidas', () => {
  assert.ok(d.validateAssignment(data(), task({ end: '09:00' })));
  assert.ok(d.validateAssignment(data(), task({ start: '25:00' })));
});
test('no laboral global bloquea jornada', () =>
  assert.ok(
    d.validateAssignment(
      data({
        daysOff: [{ id: 'x', date, technicianId: null, reason: 'Cierre' }],
      }),
      task(),
    ),
  ));
test('ausencia de otro técnico no bloquea', () =>
  assert.equal(
    d.validateAssignment(
      data({
        daysOff: [{ id: 'x', date, technicianId: 'T002', reason: 'Permiso' }],
      }),
      task(),
    ),
    null,
  ));
test('nocturno acepta antes y después de medianoche', () => {
  const state = data({
    schedules: [
      schedule({
        start: '22:00',
        end: '06:00',
        breakStart: '02:00',
        breakEnd: '02:30',
      }),
    ],
  });
  assert.equal(
    d.validateAssignment(state, task({ start: '23:00', end: '01:00' })),
    null,
  );
  assert.equal(
    d.validateAssignment(
      state,
      task({ date: '2026-09-22', start: '03:00', end: '05:00' }),
    ),
    null,
  );
  assert.ok(
    d.validateAssignment(
      state,
      task({ date: '2026-09-22', start: '01:00', end: '03:00' }),
    ),
  );
});
test('día no laboral corta tramo nocturno de ese día', () => {
  const state = data({
    schedules: [
      schedule({ start: '22:00', end: '06:00', breakStart: '', breakEnd: '' }),
    ],
    daysOff: [
      { id: 'x', date: '2026-09-22', technicianId: null, reason: 'Cierre' },
    ],
  });
  assert.ok(
    d.validateAssignment(state, task({ start: '23:00', end: '01:00' })),
  );
  assert.equal(
    d.validateAssignment(state, task({ start: '22:00', end: '23:00' })),
    null,
  );
});
test('jornada valida descanso interior y rechaza parcial', () => {
  assert.equal(d.validateSchedule(schedule()), null);
  assert.ok(d.validateSchedule(schedule({ breakEnd: '' })));
  assert.ok(
    d.validateSchedule(schedule({ breakStart: '07:00', breakEnd: '08:00' })),
  );
  assert.ok(d.validateSchedule(schedule({ breakEnd: '12:00' })));
});
test('resumen resta tareas y descansos sin duplicación', () => {
  const totals = d.dayTotals(
    d.daySegments(data({ assignments: [task()] }), 'T001', date),
  );
  assert.deepEqual(totals, { busy: 120, free: 300, rest: 60 });
});
test('tarea nocturna se divide entre dos días', () => {
  const state = data({
    schedules: [
      schedule({ start: '22:00', end: '06:00', breakStart: '', breakEnd: '' }),
    ],
    assignments: [task({ start: '23:00', end: '01:00' })],
  });
  assert.equal(d.dayTotals(d.daySegments(state, 'T001', date)).busy, 60);
  assert.equal(
    d.dayTotals(d.daySegments(state, 'T001', '2026-09-22')).busy,
    60,
  );
});
test('copiar no duplica tareas ni excepciones y no muta origen', () => {
  const state = data({
    assignments: [task()],
    daysOff: [
      { id: 'x', date: '2026-09-28', technicianId: null, reason: 'Cierre' },
    ],
  });
  const copied = d.copyPreviousWeek(state, 'T001', '2026-09-28');
  assert.equal(copied.assignments, state.assignments);
  assert.equal(copied.daysOff, state.daysOff);
  assert.equal(state.schedules.length, 1);
  assert.equal(
    copied.schedules.find((s) => s.date === '2026-09-28').start,
    '08:00',
  );
  assert.equal(
    d.dayTotals(d.daySegments(copied, 'T001', '2026-09-28')).free,
    0,
  );
});
test('cambio de jornada detecta tareas afectadas', () =>
  assert.ok(
    d.dataConflicts(
      data({
        schedules: [schedule({ working: false })],
        assignments: [task()],
      }),
    ).length,
  ));
test('detecta superposición de jornadas nocturnas', () => {
  assert.ok(
    d.dataConflicts(
      data({
        schedules: [
          schedule({
            start: '22:00',
            end: '10:00',
            breakStart: '',
            breakEnd: '',
          }),
          schedule({ date: '2026-09-22' }),
        ],
      }),
    ).length,
  );
});
test('sin jornada configurada no hay disponibilidad', () =>
  assert.equal(
    d.dayTotals(d.daySegments(data({ schedules: [] }), 'T001', date)).free,
    0,
  ));

test('técnico inicia y completa solo sus tareas sin alterar OT ni horario', () => {
  const state = data({
    assignments: [task({ status: 'pendiente', workOrderId: 'OT383' })],
  });
  const started = d.transitionAssignment(
    state,
    'a',
    'T001',
    'en_proceso',
    '2026-09-21T15:00:00Z',
  );
  assert.equal(started.error, null);
  assert.equal(started.data.assignments[0].status, 'en_proceso');
  assert.equal(started.data.assignments[0].startedAt, '2026-09-21T15:00:00Z');
  const done = d.transitionAssignment(
    started.data,
    'a',
    'T001',
    'completada',
    '2026-09-21T16:00:00Z',
  );
  assert.equal(done.error, null);
  assert.equal(done.data.assignments[0].completedAt, '2026-09-21T16:00:00Z');
  assert.equal(done.data.assignments[0].workOrderId, 'OT383');
  assert.equal(done.data.assignments[0].start, '09:00');
  assert.equal(state.assignments[0].status, 'pendiente');
});
test('rechaza actualizar tareas de otro técnico o inexistentes', () => {
  const state = data({ assignments: [task({ status: 'pendiente' })] });
  assert.ok(
    d.transitionAssignment(
      state,
      'a',
      'T002',
      'en_proceso',
      new Date().toISOString(),
    ).error,
  );
  assert.ok(
    d.transitionAssignment(
      state,
      'missing',
      'T001',
      'en_proceso',
      new Date().toISOString(),
    ).error,
  );
});
test('no permite saltar inicio, reabrir completadas ni iniciar canceladas', () => {
  for (const [status, target] of [
    ['pendiente', 'completada'],
    ['completada', 'en_proceso'],
    ['cancelada', 'en_proceso'],
    ['en_proceso', 'pendiente'],
    ['pendiente', 'cancelada'],
  ]) {
    assert.ok(
      d.transitionAssignment(
        data({ assignments: [task({ status })] }),
        'a',
        'T001',
        target,
        new Date().toISOString(),
      ).error,
    );
  }
});
test('impide iniciar dos tareas a la vez para el mismo técnico', () => {
  const state = data({
    assignments: [
      task({ status: 'pendiente' }),
      task({ id: 'b', start: '13:00', end: '14:00', status: 'en_proceso' }),
    ],
  });
  assert.ok(
    d.transitionAssignment(
      state,
      'a',
      'T001',
      'en_proceso',
      new Date().toISOString(),
    ).error,
  );
});
test('pendientes excluye completadas y canceladas', () => {
  assert.equal(d.isPending(task({ status: 'pendiente' })), true);
  assert.equal(d.isPending(task({ status: 'en_proceso' })), true);
  assert.equal(d.isPending(task({ status: 'completada' })), false);
  assert.equal(d.isPending(task({ status: 'cancelada' })), false);
});
test('agenda diaria incluye continuación nocturna y no duplica medianoche', () => {
  const state = data({
    assignments: [
      task({ start: '23:00', end: '01:00' }),
      task({ id: 'b', start: '22:00', end: '00:00' }),
      task({ id: 'c', technicianId: 'T002' }),
    ],
  });
  assert.equal(d.tasksForPeriod(state, 'T001', date, '2026-09-22').length, 2);
  assert.deepEqual(
    d
      .tasksForPeriod(state, 'T001', '2026-09-22', '2026-09-23')
      .map((t) => t.id),
    ['a'],
  );
});
test('mes incluye tarea iniciada el mes anterior una sola vez', () => {
  const state = data({
    assignments: [task({ date: '2026-08-31', start: '23:00', end: '01:00' })],
  });
  assert.equal(
    d.tasksForPeriod(state, 'T001', '2026-09-01', '2026-10-01').length,
    1,
  );
});
test('próxima tarea considera reloj, no vencidas, completadas ni otro técnico', () => {
  const state = data({
    assignments: [
      task({ status: 'pendiente' }),
      task({ id: 'b', start: '13:00', end: '14:00', status: 'completada' }),
      task({ id: 'c', start: '14:00', end: '15:00', status: 'pendiente' }),
      task({
        id: 'd',
        technicianId: 'T002',
        start: '12:00',
        end: '13:00',
        status: 'pendiente',
      }),
    ],
  });
  assert.equal(
    d.nextAssignment(state, 'T001', new Date('2026-09-21T18:00:00Z')).id,
    'c',
  );
  assert.equal(
    d.nextAssignment(state, 'T001', new Date('2026-09-22T18:00:00Z')),
    undefined,
  );
});
test('reloj de empresa reconoce el día anterior y actualiza sin zona del navegador', () => {
  const clock = d.companyClock(new Date('2026-09-22T05:30:00Z'));
  assert.equal(clock.date, '2026-09-21');
  assert.equal(clock.minutes, d.dayStart('2026-09-21') + 23 * 60 + 30);
});
test('cancelación libera disponibilidad y completada conserva reserva histórica', () => {
  const state = data({ assignments: [task({ status: 'cancelada' })] });
  assert.equal(
    d.validateAssignment(state, task({ id: 'b', status: 'pendiente' })),
    null,
  );
  assert.equal(d.dayTotals(d.daySegments(state, 'T001', date)).busy, 0);
  assert.equal(
    d.dayTotals(
      d.daySegments(
        data({ assignments: [task({ status: 'completada' })] }),
        'T001',
        date,
      ),
    ).busy,
    120,
  );
});
