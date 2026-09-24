'use client';

import { Field } from '@/components/ui';
import type {
  ApiAssetCriticality,
  ApiAssetStatus,
} from '@/services/assets-service';
import type { AssetFormState } from './asset-form';

interface AssetFormFieldsProps {
  value: AssetFormState;
  onChange: <K extends keyof AssetFormState>(
    field: K,
    value: AssetFormState[K],
  ) => void;
  editing?: boolean;
}

export default function AssetFormFields({
  value,
  onChange,
  editing = false,
}: AssetFormFieldsProps) {
  return (
    <>
      <Field label='Codigo de Equipo'>
        <input
          aria-label='Codigo de Equipo'
          maxLength={20}
          value={value.code}
          onChange={(event) => onChange('code', event.target.value)}
          placeholder='Ej: EQP-008'
        />
      </Field>
      <Field label='Nombre del Equipo'>
        <input
          aria-label='Nombre del Equipo'
          maxLength={100}
          value={value.name}
          onChange={(event) => onChange('name', event.target.value)}
          placeholder='Ej: Bomba centrifuga #3'
        />
      </Field>
      <div className='grid grid-cols-2 gap-3'>
        <Field label='Area'>
          <input
            aria-label='Area'
            maxLength={100}
            value={value.area}
            onChange={(event) => onChange('area', event.target.value)}
            placeholder='Ej: Planta de Utilidades'
          />
        </Field>
        <Field label='Criticidad'>
          <select
            aria-label='Criticidad'
            value={value.criticality}
            onChange={(event) =>
              onChange('criticality', event.target.value as ApiAssetCriticality)
            }
          >
            <option value='low'>Baja</option>
            <option value='medium'>Media</option>
            <option value='high'>Alta</option>
            <option value='critical'>Crítica</option>
          </select>
        </Field>
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <Field label='Fabricante'>
          <input
            aria-label='Fabricante'
            maxLength={100}
            value={value.manufacturer}
            onChange={(event) => onChange('manufacturer', event.target.value)}
            placeholder='Ej: Atlas Copco'
          />
        </Field>
        <Field label='Modelo'>
          <input
            aria-label='Modelo'
            maxLength={100}
            value={value.model}
            onChange={(event) => onChange('model', event.target.value)}
            placeholder='Ej: GA55'
          />
        </Field>
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <Field label='N de Serie'>
          <input
            aria-label='N de Serie'
            maxLength={20}
            value={value.serial}
            onChange={(event) => onChange('serial', event.target.value)}
            placeholder='Ej: ATC-2026-001'
          />
        </Field>
        <Field label='Fecha de Instalacion'>
          <input
            aria-label='Fecha de Instalacion'
            type='date'
            value={value.installedAt}
            onChange={(event) => onChange('installedAt', event.target.value)}
          />
        </Field>
      </div>
      {editing && (
        <div className='grid grid-cols-2 gap-3'>
          <Field label='Estado'>
            <select
              aria-label='Estado'
              value={value.status}
              onChange={(event) =>
                onChange('status', event.target.value as ApiAssetStatus)
              }
            >
              <option value='commissioning'>En puesta en marcha</option>
              <option value='operational'>Operativo</option>
              <option value='standby'>En espera</option>
              <option value='maintenance'>En mantenimiento</option>
              <option value='down'>Detenido</option>
              <option value='decommissioned'>Descomisionado</option>
            </select>
          </Field>
          <Field label='Costo'>
            <input
              aria-label='Costo'
              type='number'
              min='0'
              step='1'
              max='2147483647'
              value={value.cost}
              onChange={(event) => onChange('cost', event.target.value)}
            />
          </Field>
        </div>
      )}
    </>
  );
}
