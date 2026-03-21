'use client';

import React, { useState } from 'react';
import {
  ASSETS,
  TURNOS,
  CHECKLIST_ESTADOS,
  CHECKLIST_ESTADO_COLORES,
  SEVERIDADES,
  CHECKLIST_ITEMS_DEFAULT,
  PLANTILLAS_CHECKLIST,
} from '@/app/data';

import {
  Badge,
  KpiCard,
  Td,
  PageHeader,
  Card,
  CardTitle,
  RowData,
  BtnPrimary,
  BtnGhost,
  BtnBack,
  DataTable,
  Modal,
  Field,
  ModalFooter,
} from '@/components/ui';

type ChecklistItem = {
  itemId: string;
  valor: 'ok' | 'nok' | 'na' | null;
  nota: string;
};

type Checklist = {
  id: string;
  folio: string;
  plantillaId: string;
  plantillaName: string;
  activoId: string;
  activoCode: string;
  activoName: string;
  area: string;
  fecha: string;
  turno: string;
  responsable: string;
  horometro: number;
  estado: string;
  items: ChecklistItem[];
  createdAt: string;
};

type Hallazgo = {
  id: string;
  checklistId: string | null;
  checklistFolio: string | null;
  itemId: string | null;
  itemDescripcion: string | null;
  descripcion: string;
  severidad: string;
  status: string;
  activoId: string;
  activoCode: string;
  activoName: string;
  responsable: string;
  createdAt: string;
  otId: string | null;
  resolvedAt: string | null;
};

type PlantillaChecklist = {
  id: string;
  nombre: string;
  activoId: string;
  activoCode: string;
  activoName: string;
  items: { id: string; descripcion: string }[];
};

type Notificacion = {
  id: string;
  titulo: string;
  msg: string;
  tipo: string;
  leida: boolean;
  fecha: string;
};

export function InspeccionesScreen({
  checklists,
  setChecklists,
  hallazgos,
  setHallazgos,
  plantillas,
  setPlantillas,
}: {
  checklists: any[];
  setChecklists: any;
  hallazgos: any[];
  setHallazgos: any;
  plantillas: any[];
  setPlantillas: any;
}) {
  const [view, setView] = useState<'list' | 'execute'>('list');
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(
    null,
  );
  const [showCreateChecklist, setShowCreateChecklist] = useState(false);
  const [showCreatePlantilla, setShowCreatePlantilla] = useState(false);
  const [showCreateHallazgo, setShowCreateHallazgo] = useState(false);
  const [showVerPlantillas, setShowVerPlantillas] = useState(false);

  const [filterActivo, setFilterActivo] = useState('');
  const [filterFecha, setFilterFecha] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterResponsable, setFilterResponsable] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const pendingToday = checklists.filter(
    (c) => c.estado === 'pendiente' && c.fecha <= today,
  ).length;
  const completedToday = checklists.filter(
    (c) => c.estado === 'completado' && c.fecha === today,
  ).length;
  const openFindings = hallazgos.filter((h) => h.status === 'abierto').length;
  const overdue = checklists.filter(
    (c) => c.estado === 'pendiente' && c.fecha < today,
  ).length;

  const filteredChecklists = checklists.filter((c) => {
    return (
      ((!filterActivo || c.activoId === filterActivo) &&
        (!filterFecha || c.fecha === filterFecha) &&
        (!filterArea || c.area === filterArea)) ||
      ((!filterEstado || c.estado === filterEstado) &&
        (!filterResponsable || c.responsable === filterResponsable))
    );
  });

  const uniqueAreas = [...new Set(ASSETS.map((a) => a.area))];
  const uniqueResponsables = [...new Set(checklists.map((c) => c.responsable))];

  const handleExecuteChecklist = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setView('execute');
  };

  if (view === 'execute' && selectedChecklist) {
    return (
      <ExecuteChecklistScreen
        checklist={selectedChecklist}
        setChecklist={setSelectedChecklist}
        plantillas={plantillas}
        onBack={() => {
          setView('list');
          setSelectedChecklist(null);
        }}
        onSave={(updatedChecklist) => {
          setChecklists((prev) =>
            prev.map((c) =>
              c.id === updatedChecklist.id ? updatedChecklist : c,
            ),
          );
          if (updatedChecklist.items.some((i) => i.valor === 'nok')) {
            const newFindings = updatedChecklist.items
              .filter((i) => i.valor === 'nok')
              .map((i) => {
                const plantilla = plantillas.find(
                  (p) => p.id === updatedChecklist.plantillaId,
                );
                const itemDesc = plantilla?.items.find(
                  (it) => it.id === i.itemId,
                )?.descripcion;
                return {
                  id: `H${Date.now()}_${i.itemId}`,
                  checklistId: updatedChecklist.id,
                  checklistFolio: updatedChecklist.folio,
                  itemId: i.itemId,
                  itemDescripcion: itemDesc || null,
                  descripcion: i.nota,
                  severidad: 'media',
                  status: 'abierto',
                  activoId: updatedChecklist.activoId,
                  activoCode: updatedChecklist.activoCode,
                  activoName: updatedChecklist.activoName,
                  responsable: updatedChecklist.responsable,
                  createdAt: new Date().toISOString(),
                  otId: null,
                  resolvedAt: null,
                };
              });
            setHallazgos((prev) => [...prev, ...newFindings]);
          }
          setView('list');
          setSelectedChecklist(null);
        }}
      />
    );
  }

  return (
    <div className='h-full overflow-y-auto p-7'>
      <PageHeader
        title='Inspecciones'
        sub='Gestion de checklists y hallazgos'
      />

      <div className='mb-6 grid grid-cols-4 gap-3.5'>
        <KpiCard
          label='Pendientes Hoy'
          value={pendingToday}
          sub='Por ejecutar'
          color='#94a3b8'
          icon={<span>⏳</span>}
        />
        <KpiCard
          label='Completados Hoy'
          value={completedToday}
          sub='Ejecutados'
          color='#22c55e'
          icon={<span>✅</span>}
        />
        <KpiCard
          label='Hallazgos Abiertos'
          value={openFindings}
          sub='Sin resolver'
          color='#ef4444'
          icon={<span>⚠</span>}
        />
        <KpiCard
          label='Vencidos'
          value={overdue}
          sub='Sin ejecutar'
          color='#f97316'
          icon={<span>🚨</span>}
        />
      </div>

      <div className='mb-6 flex gap-3'>
        <BtnPrimary onClick={() => setShowCreateChecklist(true)}>
          + Nuevo Checklist
        </BtnPrimary>
        <BtnGhost onClick={() => setShowCreatePlantilla(true)}>
          Crear Plantilla
        </BtnGhost>
        <BtnGhost onClick={() => setShowCreateHallazgo(true)}>
          Registrar Hallazgo
        </BtnGhost>
        <BtnGhost onClick={() => setShowVerPlantillas(true)}>
          Ver Plantillas
        </BtnGhost>
      </div>

      <Card className='mb-4'>
        <div className='mb-4 flex gap-3'>
          <select
            value={filterActivo}
            onChange={(e) => setFilterActivo(e.target.value)}
            className='max-w-[200px]'
          >
            <option value=''>Todas las maquinas</option>
            {ASSETS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} - {a.name}
              </option>
            ))}
          </select>
          <input
            type='date'
            value={filterFecha}
            onChange={(e) => setFilterFecha(e.target.value)}
            className='max-w-[180px]'
          />
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className='max-w-[200px]'
          >
            <option value=''>Todas las areas</option>
            {uniqueAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className='max-w-[180px]'
          >
            <option value=''>Todos los estados</option>
            {Object.entries(CHECKLIST_ESTADOS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={filterResponsable}
            onChange={(e) => setFilterResponsable(e.target.value)}
            className='max-w-[180px]'
          >
            <option value=''>Todos los responsables</option>
            {uniqueResponsables.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <DataTable
          head={[
            'Folio',
            'Maquina',
            'Fecha',
            'Turno',
            'Responsable',
            'Estado',
            'Acciones',
          ]}
        >
          {filteredChecklists.map((c) => (
            <tr key={c.id}>
              <Td mono>{c.folio}</Td>
              <Td>
                <div className='text-xs text-slate-400'>{c.activoCode}</div>
                <div>{c.activoName}</div>
              </Td>
              <Td>{c.fecha}</Td>
              <Td>{c.turno}</Td>
              <Td>{c.responsable}</Td>
              <Td>
                <Badge
                  label={
                    CHECKLIST_ESTADOS[
                      c.estado as keyof typeof CHECKLIST_ESTADOS
                    ] || c.estado
                  }
                  color={
                    CHECKLIST_ESTADO_COLORES[
                      c.estado as keyof typeof CHECKLIST_ESTADO_COLORES
                    ] || '#3b82f6'
                  }
                />
              </Td>
              <Td>
                {c.estado === 'pendiente' && (
                  <BtnPrimary onClick={() => handleExecuteChecklist(c)}>
                    Ejecutar
                  </BtnPrimary>
                )}
                {c.estado === 'completado' && (
                  <BtnGhost onClick={() => handleExecuteChecklist(c)}>
                    Ver
                  </BtnGhost>
                )}
              </Td>
            </tr>
          ))}
        </DataTable>
      </Card>

      {showCreateChecklist && (
        <Modal
          title='Nuevo Checklist'
          onClose={() => setShowCreateChecklist(false)}
        >
          <CreateChecklistForm
            plantillas={plantillas}
            onClose={() => setShowCreateChecklist(false)}
            onSave={(newChecklist) => {
              setChecklists((prev) => [...prev, newChecklist]);
              setShowCreateChecklist(false);
            }}
          />
        </Modal>
      )}

      {showCreatePlantilla && (
        <Modal
          title='Crear Plantilla'
          onClose={() => setShowCreatePlantilla(false)}
        >
          <CreatePlantillaForm
            onClose={() => setShowCreatePlantilla(false)}
            onSave={(newPlantilla) => {
              setPlantillas((prev) => [...prev, newPlantilla]);
              setShowCreatePlantilla(false);
            }}
          />
        </Modal>
      )}

      {showVerPlantillas && (
        <Modal
          title='Plantillas de Checklist'
          onClose={() => setShowVerPlantillas(false)}
        >
          <div className='space-y-4'>
            {plantillas.map((p) => (
              <div
                key={p.id}
                className='border-shGray-600 bg-shGray-700 rounded-lg border p-4'
              >
                <div className='mb-2 flex items-start justify-between'>
                  <div>
                    <div className='font-bold text-slate-200'>{p.nombre}</div>
                    <div className='text-xs text-slate-500'>
                      {p.activoCode} - {p.activoName}
                    </div>
                  </div>
                  <Badge label={`${p.items.length} items`} color='#3b82f6' />
                </div>
                <div className='mt-2 text-xs text-slate-400'>
                  Items: {p.items.map((i) => i.descripcion).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {showCreateHallazgo && (
        <Modal
          title='Registrar Hallazgo'
          onClose={() => setShowCreateHallazgo(false)}
        >
          <CreateHallazgoForm
            onClose={() => setShowCreateHallazgo(false)}
            onSave={(newHallazgo) => {
              setHallazgos((prev) => [...prev, newHallazgo]);
              setShowCreateHallazgo(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function ExecuteChecklistScreen({
  checklist,
  setChecklist,
  plantillas,
  onBack,
  onSave,
}: {
  checklist: Checklist;
  setChecklist: React.Dispatch<React.SetStateAction<Checklist | null>>;
  plantillas: PlantillaChecklist[];
  onBack: () => void;
  onSave: (updatedChecklist: Checklist) => void;
}) {
  const [items, setItems] = useState<ChecklistItem[]>(
    checklist.items.length > 0
      ? checklist.items
      : plantillas
          .find((p) => p.id === checklist.plantillaId)
          ?.items.map((i) => ({
            itemId: String(i.id),
            valor: null,
            nota: '',
          })) || [],
  );
  const [horometro, setHorometro] = useState(checklist.horometro || 0);

  const plantilla = plantillas.find((p) => p.id === checklist.plantillaId);

  const handleValorChange = (itemId: string, valor: 'ok' | 'nok' | 'na') => {
    setItems((prev) =>
      prev.map((i) =>
        i.itemId === itemId
          ? { ...i, valor, nota: valor === 'nok' ? i.nota : '' }
          : i,
      ),
    );
  };

  const handleNotaChange = (itemId: string, nota: string) => {
    setItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, nota } : i)),
    );
  };

  const allItemsAnswered = items.every((i) => i.valor !== null);
  const hasNOK = items.some((i) => i.valor === 'nok');
  const allNOKWithNote = items
    .filter((i) => i.valor === 'nok')
    .every((i) => i.nota.trim() !== '');

  const canSave = allItemsAnswered && (!hasNOK || allNOKWithNote);

  const handleSave = () => {
    const updatedChecklist: Checklist = {
      ...checklist,
      items,
      horometro,
      estado: 'completado',
    };
    onSave(updatedChecklist);
  };

  return (
    <div className='h-full overflow-y-auto p-7'>
      <BtnBack onClick={onBack} />

      <Card className='mb-4'>
        <CardTitle>Encabezado</CardTitle>
        <div className='grid grid-cols-4 gap-4'>
          <div>
            <div className='text-xs tracking-wider text-slate-500 uppercase'>
              Folio
            </div>
            <div className='font-mono font-bold text-amber-500'>
              {checklist.folio}
            </div>
          </div>
          <div>
            <div className='text-xs tracking-wider text-slate-500 uppercase'>
              Fecha
            </div>
            <div>{checklist.fecha}</div>
          </div>
          <div>
            <div className='text-xs tracking-wider text-slate-500 uppercase'>
              Turno
            </div>
            <div>{checklist.turno}</div>
          </div>
          <div>
            <div className='text-xs tracking-wider text-slate-500 uppercase'>
              Responsable
            </div>
            <div>{checklist.responsable}</div>
          </div>
          <div>
            <div className='text-xs tracking-wider text-slate-500 uppercase'>
              Maquina
            </div>
            <div>
              {checklist.activoCode} - {checklist.activoName}
            </div>
          </div>
          <div>
            <div className='text-xs tracking-wider text-slate-500 uppercase'>
              Area
            </div>
            <div>{checklist.area}</div>
          </div>
          <div>
            <div className='text-xs tracking-wider text-slate-500 uppercase'>
              Horometro/Contador
            </div>
            <input
              type='number'
              value={horometro}
              onChange={(e) => setHorometro(Number(e.target.value))}
              className='max-w-[120px]'
            />
          </div>
          <div>
            <div className='text-xs tracking-wider text-slate-500 uppercase'>
              Estado
            </div>
            <Badge
              label={
                checklist.estado === 'pendiente' ? 'En Ejecucion' : 'Completado'
              }
              color={checklist.estado === 'pendiente' ? '#f59e0b' : '#22c55e'}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Items de Inspeccion</CardTitle>
        <div className='space-y-3'>
          {plantilla?.items.map((item, index) => {
            const itemData = items.find((i) => i.itemId === String(item.id));
            const valor = itemData?.valor || null;
            const nota = itemData?.nota || '';

            return (
              <div
                key={item.id}
                className='bg-shGray-700 flex flex-col gap-2 rounded-lg p-3'
              >
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>
                    {index + 1}. {item.descripcion}
                  </span>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleValorChange(String(item.id), 'ok')}
                      className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                        valor === 'ok'
                          ? 'border border-green-500 bg-green-500/20 text-green-500'
                          : 'bg-shGray-600 text-shGray-400 hover:bg-shGray-500'
                      }`}
                    >
                      OK
                    </button>
                    <button
                      onClick={() => handleValorChange(String(item.id), 'nok')}
                      className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                        valor === 'nok'
                          ? 'border border-red-500 bg-red-500/20 text-red-500'
                          : 'bg-shGray-600 text-shGray-400 hover:bg-shGray-500'
                      }`}
                    >
                      No OK
                    </button>
                    <button
                      onClick={() => handleValorChange(String(item.id), 'na')}
                      className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                        valor === 'na'
                          ? 'border border-slate-500 bg-slate-500/20 text-slate-400'
                          : 'bg-shGray-600 text-shGray-400 hover:bg-shGray-500'
                      }`}
                    >
                      N/A
                    </button>
                  </div>
                </div>
                {valor === 'nok' && (
                  <div className='ml-2'>
                    <textarea
                      value={nota}
                      onChange={(e) =>
                        handleNotaChange(String(item.id), e.target.value)
                      }
                      placeholder='Descripcion del problema (obligatorio)'
                      className='min-h-[60px] w-full text-sm'
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className='mt-4 flex justify-end gap-3'>
        <BtnGhost onClick={onBack}>Cancelar</BtnGhost>
        <BtnPrimary onClick={handleSave} disabled={!canSave}>
          {canSave ? 'Guardar Checklist' : 'Complete todos los items'}
        </BtnPrimary>
      </div>
    </div>
  );
}

function CreateChecklistForm({
  plantillas,
  onClose,
  onSave,
}: {
  plantillas: PlantillaChecklist[];
  onClose: () => void;
  onSave: (newChecklist: Checklist) => void;
}) {
  const [plantillaId, setPlantillaId] = useState(plantillas[0]?.id || '');
  const [turno, setTurno] = useState('Matutino');
  const [responsable, setResponsable] = useState('');
  const [horometro, setHorometro] = useState(0);

  const selectedPlantilla = plantillas.find((p) => p.id === plantillaId);
  const activo = selectedPlantilla
    ? ASSETS.find((a) => a.id === selectedPlantilla.activoId)
    : null;

  const handleSave = () => {
    if (!selectedPlantilla || !activo) return;

    const folio = `CHK-${new Date().getFullYear()}-${String(Date.now()).slice(
      -4,
    )}`;
    const today = new Date().toISOString().split('T')[0];

    const newChecklist: Checklist = {
      id: `CHK_${Date.now()}`,
      folio,
      plantillaId: selectedPlantilla.id,
      plantillaName: selectedPlantilla.nombre,
      activoId: activo.id,
      activoCode: activo.code,
      activoName: activo.name,
      area: activo.area,
      fecha: today,
      turno,
      responsable,
      horometro,
      estado: 'pendiente',
      items: [],
      createdAt: new Date().toISOString(),
    };

    onSave(newChecklist);
  };

  return (
    <div className='space-y-4'>
      <Field label='Plantilla'>
        <select
          value={plantillaId}
          onChange={(e) => setPlantillaId(e.target.value)}
        >
          {plantillas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} ({p.activoCode})
            </option>
          ))}
        </select>
      </Field>
      <Field label='Turno'>
        <select value={turno} onChange={(e) => setTurno(e.target.value)}>
          {TURNOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <Field label='Responsable'>
        <input
          value={responsable}
          onChange={(e) => setResponsable(e.target.value)}
          placeholder='Nombre del responsable'
        />
      </Field>
      <Field label='Horometro/Contador'>
        <input
          type='number'
          value={horometro}
          onChange={(e) => setHorometro(Number(e.target.value))}
        />
      </Field>
      <ModalFooter
        onCancel={onClose}
        onConfirm={handleSave}
        confirmLabel='Crear Checklist'
      />
    </div>
  );
}

function CreatePlantillaForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (newPlantilla: PlantillaChecklist) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [activoId, setActivoId] = useState('');
  const [items, setItems] = useState<{ id: string; descripcion: string }[]>(
    CHECKLIST_ITEMS_DEFAULT.map((i) => ({
      id: String(i.id),
      descripcion: i.descripcion,
    })),
  );
  const [newItem, setNewItem] = useState('');

  const activo = ASSETS.find((a) => a.id === activoId);

  const handleAddItem = () => {
    if (newItem.trim()) {
      setItems((prev) => [
        ...prev,
        { id: String(Date.now()), descripcion: newItem.trim() },
      ]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = () => {
    const newPlantilla: PlantillaChecklist = {
      id: `PL_${Date.now()}`,
      nombre,
      activoId,
      activoCode: activo?.code || '',
      activoName: activo?.name || '',
      items,
    };
    onSave(newPlantilla);
  };

  return (
    <div className='space-y-4'>
      <Field label='Nombre de Plantilla'>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder='Ej: Inspeccion Diaria - Compresor'
        />
      </Field>
      <Field label='Maquina'>
        <select value={activoId} onChange={(e) => setActivoId(e.target.value)}>
          <option value=''>Seleccionar maquina</option>
          {ASSETS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} - {a.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label='Items de Inspeccion'>
        <div className='max-h-[200px] space-y-2 overflow-y-auto'>
          {items.map((item, index) => (
            <div
              key={item.id}
              className='bg-shGray-600 flex items-center gap-2 rounded p-2'
            >
              <span className='w-6 text-xs text-slate-500'>{index + 1}.</span>
              <span className='flex-1 text-sm'>{item.descripcion}</span>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className='text-sm text-red-500 hover:text-red-400'
              >
                X
              </button>
            </div>
          ))}
        </div>
        <div className='mt-2 flex gap-2'>
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder='Nuevo item'
            className='flex-1'
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddItem();
            }}
          />
          <button
            onClick={handleAddItem}
            className='bg-shGray-500 hover:bg-shGray-400 rounded px-3 py-2'
          >
            +
          </button>
        </div>
      </Field>
      <ModalFooter
        onCancel={onClose}
        onConfirm={handleSave}
        confirmLabel='Crear Plantilla'
      />
    </div>
  );
}

function CreateHallazgoForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (newHallazgo: Hallazgo) => void;
}) {
  const [activoId, setActivoId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [severidad, setSeveridad] = useState('media');

  const activo = ASSETS.find((a) => a.id === activoId);

  const handleSave = () => {
    const newHallazgo: Hallazgo = {
      id: `H_${Date.now()}`,
      checklistId: null,
      checklistFolio: null,
      itemId: null,
      itemDescripcion: null,
      descripcion,
      severidad,
      status: 'abierto',
      activoId,
      activoCode: activo?.code || '',
      activoName: activo?.name || '',
      responsable: 'Manual',
      createdAt: new Date().toISOString(),
      otId: null,
      resolvedAt: null,
    };
    onSave(newHallazgo);
  };

  return (
    <div className='space-y-4'>
      <Field label='Maquina'>
        <select value={activoId} onChange={(e) => setActivoId(e.target.value)}>
          <option value=''>Seleccionar maquina</option>
          {ASSETS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} - {a.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label='Descripcion del Hallazgo'>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder='Describe el problema encontrado'
          className='min-h-[100px]'
        />
      </Field>
      <Field label='Severidad'>
        <select
          value={severidad}
          onChange={(e) => setSeveridad(e.target.value)}
        >
          {Object.entries(SEVERIDADES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <ModalFooter
        onCancel={onClose}
        onConfirm={handleSave}
        confirmLabel='Registrar Hallazgo'
      />
    </div>
  );
}

export { NotificationsScreen } from './screens2';
