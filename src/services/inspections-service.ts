import { apiClient, type ApiClientOptions } from '@/lib/api-client';
import type {
  Checklist,
  ChecklistItemRespuesta,
  Hallazgo,
  PlantillaChecklist,
  Turno,
} from '@/app/data/types';
import type { Activo } from '@/app/data/types';

export interface ApiInspectionItem {
  item_id: number;
  description: string;
}

export interface ApiInspectionAnswer {
  item_id: number;
  value: ChecklistItemRespuesta['valor'];
  note: string;
}

export interface ApiInspectionTemplate {
  id: string;
  company_id: string;
  asset_id: string;
  name: string;
  items: ApiInspectionItem[];
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface ApiInspection {
  id: string;
  name: string;
  company_id: string;
  template_id: string | null;
  template_name: string;
  folio: string;
  asset_id: string;
  asset_code: string;
  asset_name: string;
  area: string;
  inspection_date: string;
  shift: Turno;
  responsible: string;
  meter: number | null;
  status: Checklist['estado'];
  items: ApiInspectionAnswer[];
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
  deleted_at: string | null;
}

export interface ApiInspectionFinding {
  id: string;
  company_id: string;
  inspection_id: string | null;
  inspection_folio: string | null;
  item_id: number | null;
  item_description: string | null;
  description: string;
  severity: Hallazgo['severidad'];
  status: Hallazgo['status'];
  asset_id: string;
  asset_code: string;
  asset_name: string;
  responsible: string;
  work_order_id: string | null;
  created_at: string;
  resolved_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface InspectionBundle {
  templates: ApiInspectionTemplate[];
  inspections: ApiInspection[];
  findings: ApiInspectionFinding[];
}

export interface InspectionTemplateCreateInput {
  name: string;
  assetId: string;
  items: ApiInspectionItem[];
}

export interface InspectionCreateInput {
  templateId: string;
  folio: string;
  inspectionDate: string;
  shift: Turno;
  responsible: string;
  meter: number | null;
}

export interface InspectionExecutionInput {
  items: ApiInspectionAnswer[];
  status: Checklist['estado'];
  meter: number | null;
  completedAt: string | null;
}

export interface InspectionFindingCreateInput {
  inspectionId: string | null;
  itemId: number | null;
  itemDescription: string | null;
  description: string;
  severity: Hallazgo['severidad'];
  assetId: string;
  responsible: string;
}

export function mapInspectionTemplate(
  template: ApiInspectionTemplate,
  assets: Activo[],
): PlantillaChecklist {
  const asset = assets.find((item) => item.id === template.asset_id);
  return {
    id: template.id,
    nombre: template.name,
    activoId: template.asset_id,
    activoCode: asset?.code ?? '',
    activoName: asset?.name ?? '',
    items: template.items.map((item) => ({
      id: item.item_id,
      descripcion: item.description,
    })),
  };
}

export function mapInspection(inspection: ApiInspection): Checklist {
  return {
    id: inspection.id,
    empresaId: inspection.company_id,
    folio: inspection.folio,
    plantillaId: inspection.template_id ?? '',
    plantillaName: inspection.template_name,
    activoId: inspection.asset_id,
    activoCode: inspection.asset_code,
    activoName: inspection.asset_name,
    area: inspection.area,
    fecha: inspection.inspection_date,
    turno: inspection.shift,
    responsable: inspection.responsible,
    horometro: inspection.meter ?? undefined,
    estado: inspection.status,
    items: inspection.items.map((item) => ({
      itemId: item.item_id,
      valor: item.value,
      nota: item.note,
    })),
    createdAt: inspection.created_at,
  };
}

export function mapInspectionFinding(finding: ApiInspectionFinding): Hallazgo {
  return {
    id: finding.id,
    empresaId: finding.company_id,
    checklistId: finding.inspection_id,
    checklistFolio: finding.inspection_folio,
    itemId: finding.item_id,
    itemDescripcion: finding.item_description,
    descripcion: finding.description,
    severidad: finding.severity,
    status: finding.status,
    activoId: finding.asset_id,
    activoCode: finding.asset_code,
    activoName: finding.asset_name,
    responsable: finding.responsible,
    createdAt: finding.created_at,
    otId: finding.work_order_id,
    resolvedAt: finding.resolved_at,
  };
}

function assertCurrent(options?: ApiClientOptions) {
  if (options?.isRequestCurrent && !options.isRequestCurrent()) {
    throw new Error('La sesión cambió. Vuelve a abrir las inspecciones.');
  }
}

function getData<T>(
  response: Awaited<ReturnType<typeof apiClient<T>>>,
  message: string,
) {
  if (!response.ok) throw new Error(response.error?.message || message);
  return response.data as T;
}

export const inspectionsService = {
  async getBundle(options?: ApiClientOptions): Promise<InspectionBundle> {
    const response = await apiClient<InspectionBundle>(
      '/inspections/',
      options,
    );
    assertCurrent(options);
    return getData(response, 'No se pudieron cargar las inspecciones.');
  },

  async createTemplate(
    input: InspectionTemplateCreateInput,
    options?: ApiClientOptions,
  ) {
    const response = await apiClient<ApiInspectionTemplate>(
      '/inspections/templates',
      {
        ...options,
        method: 'POST',
        body: JSON.stringify({
          name: input.name,
          asset_id: input.assetId,
          items: input.items,
        }),
      },
    );
    assertCurrent(options);
    return getData(response, 'No se pudo crear la plantilla.');
  },

  async createInspection(
    input: InspectionCreateInput,
    options?: ApiClientOptions,
  ) {
    const response = await apiClient<ApiInspection>('/inspections/', {
      ...options,
      method: 'POST',
      body: JSON.stringify({
        template_id: input.templateId,
        folio: input.folio,
        inspection_date: input.inspectionDate,
        shift: input.shift,
        responsible: input.responsible,
        meter: input.meter,
      }),
    });
    assertCurrent(options);
    return getData(response, 'No se pudo crear la inspección.');
  },

  async updateExecution(
    id: string,
    input: InspectionExecutionInput,
    options?: ApiClientOptions,
  ) {
    const response = await apiClient<ApiInspection>(
      `/inspections/${id}/execution`,
      {
        ...options,
        method: 'PATCH',
        body: JSON.stringify({
          items: input.items,
          status: input.status,
          meter: input.meter,
          completed_at: input.completedAt,
        }),
      },
    );
    assertCurrent(options);
    return getData(response, 'No se pudo guardar la inspección.');
  },

  async createFindings(
    inputs: InspectionFindingCreateInput[],
    options?: ApiClientOptions,
  ) {
    const response = await apiClient<ApiInspectionFinding[]>(
      '/inspections/findings',
      {
        ...options,
        method: 'POST',
        body: JSON.stringify(
          inputs.map((input) => ({
            inspection_id: input.inspectionId,
            item_id: input.itemId,
            item_description: input.itemDescription,
            description: input.description,
            severity: input.severity,
            asset_id: input.assetId,
            responsible: input.responsible,
          })),
        ),
      },
    );
    assertCurrent(options);
    return getData(response, 'No se pudieron guardar los hallazgos.');
  },

  async updateFinding(
    id: string,
    input: {
      status?: Hallazgo['status'];
      workOrderId?: string | null;
      resolvedAt?: string | null;
    },
    options?: ApiClientOptions,
  ) {
    const response = await apiClient<ApiInspectionFinding>(
      `/inspections/findings/${id}`,
      {
        ...options,
        method: 'PATCH',
        body: JSON.stringify({
          status: input.status,
          work_order_id: input.workOrderId,
          resolved_at: input.resolvedAt,
        }),
      },
    );
    assertCurrent(options);
    return getData(response, 'No se pudo actualizar el hallazgo.');
  },
};
