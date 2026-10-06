import { z } from 'zod';

export const newAssetSchema = z.object({
  /*
    name: str = Field(..., min_length=4, max_length=100, description="Asset name")
    area: str = Field(..., min_length=1, max_length=100, description="Area name")
    code: str = Field(
        ..., min_length=3, max_length=20, description="Equipment identification code"
    )
    serial: str | None = Field(
        default=None,
        min_length=3,
        max_length=20,
        description="Equipment serial number or code",
    )
    model: str | None = Field(
        default=None,
        min_length=3,
        max_length=100,
        description="Asset official model",
    )
    manufacturer: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
        description="Asset manufacturer or label",
    )
    # -- Nullable integer fields --
    cost: int | None = Field(
        default=None, description="Acquisition or replacement cost"
    )
    # -- Enumerated fields using Literal type aliases --
    status: AssetStatus = Field(
        default="operational",
        max_length=30,
        description="Current operational status of the asset",
    )
    criticality: AssetCriticality = Field(
        default="medium",
        max_length=20,
        description="Criticality level indicating how essential the asset is to operations",
    )
    # -- Datetime fields --
    installed_at: datetime | None = Field(
        default=None,
        description="Date when the asset was installed (ISO 8601 with timezone)",
    )
    # -- Boolean fields --
    is_active: bool = Field(default=True, description="Whether the asset is active")
  */

  name: z.string().min(4, 'Nombre muy corto').max(100, 'Nombre muy largo'),
  area: z.string().min(1, 'Area muy corta').max(100, 'Area muy larga'),
  code: z.string().min(3, 'Código muy corto').max(20, 'Código muy largo'),
  serial: z
    .string()
    .min(3, 'Serial muy corto')
    .max(20, 'Serial muy largo')
    .optional(),
  model: z
    .string()
    .min(3, 'Modelo muy corto')
    .max(100, 'Modelo muy largo')
    .optional(),
  manufacturer: z
    .string()
    .min(2, 'Fabricante muy corto')
    .max(100, 'Fabricante muy largo')
    .optional(),
  cost: z.number().min(1, 'Costo requerido').optional(),
  companyId: z.uuid('ID de empresa inválido'),
  status: z
    .enum([
      'commissioning',
      'operational',
      'standby',
      'maintenance',
      'down',
      'decommissioned',
    ])
    .default('operational'),
  criticality: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  installedAt: z.date().nullable().optional(),
});

export type NewAssetSchema = z.infer<typeof newAssetSchema>;
