'use server';

import { headers } from 'next/headers';
import { backendFetch } from '@/server/auth/backend';
import { apiBaseUrl } from '@/server/auth/config';
import { resolveClientIp } from '@/server/auth/request-guards';
import type { DemoLeadField } from '@/components/demo/demo-lead-schema';
import { demoLeadSchema } from '@/components/demo/demo-lead-schema';

export interface CreateDemoLeadResult {
  success: boolean;
  message: string;
  id?: string;
  fieldErrors?: Partial<Record<DemoLeadField, string>>;
}

interface DemoRequestPayload {
  name: string;
  company: string;
  email: string;
  phone?: string;
  message?: string;
}

interface DemoRequestSuccessResponse {
  message: string;
  id: string;
}

interface DemoRequestErrorResponse {
  message?: string;
  error?: string;
  detail?: string;
}

function buildDemoLeadsEndpoint(): string | null {
  const path = process.env.DEMO_LEADS_API_PATH ?? '/api/v1/demo-requests';

  try {
    return new URL(path, apiBaseUrl()).toString();
  } catch {
    return null;
  }
}

function extractFieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Partial<Record<DemoLeadField, string>> {
  const errors: Partial<Record<DemoLeadField, string>> = {};

  for (const issue of issues) {
    const firstPath = issue.path[0];
    if (typeof firstPath !== 'string') {
      continue;
    }

    if (!(firstPath in errors)) {
      errors[firstPath as DemoLeadField] = issue.message;
    }
  }

  return errors;
}

export async function createDemoLeadAction(
  rawInput: unknown,
): Promise<CreateDemoLeadResult> {
  const parsed = demoLeadSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Revisa los campos del formulario',
      fieldErrors: extractFieldErrors(parsed.error.issues),
    };
  }

  const endpoint = buildDemoLeadsEndpoint();

  if (!endpoint) {
    return {
      success: false,
      message: 'Falta configurar API_URL para guardar leads de demo',
    };
  }

  try {
    const payload: DemoRequestPayload = {
      name: parsed.data.fullName,
      company: parsed.data.companyName,
      email: parsed.data.email,
      ...(parsed.data.phone ? { phone: parsed.data.phone } : {}),
      ...(parsed.data.interestMessage
        ? { message: parsed.data.interestMessage }
        : {}),
    };

    const response = await backendFetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      clientIp: resolveClientIp(await headers()),
    });

    if (!response.ok) {
      let backendMessage = 'No pudimos guardar tu solicitud en este momento';

      try {
        const json = (await response.json()) as DemoRequestErrorResponse;

        backendMessage =
          json.message || json.error || json.detail || backendMessage;
      } catch {
        // Ignore JSON parsing errors and keep default message.
      }

      return {
        success: false,
        message: backendMessage,
      };
    }

    let data: DemoRequestSuccessResponse;

    try {
      data = (await response.json()) as DemoRequestSuccessResponse;
    } catch {
      return {
        success: false,
        message:
          'La API respondio sin un JSON valido. Intenta nuevamente en unos minutos.',
      };
    }

    if (!data.id || !data.message) {
      return {
        success: false,
        message:
          'La API respondio con un formato inesperado. Intenta nuevamente en unos minutos.',
      };
    }

    return {
      success: true,
      message: data.message,
      id: data.id,
    };
  } catch {
    return {
      success: false,
      message:
        'No pudimos conectarnos con el servidor. Intenta nuevamente en unos minutos.',
    };
  }
}
