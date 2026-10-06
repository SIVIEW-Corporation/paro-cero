import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { BACKEND_AUTH_ENDPOINT, backendAuthPost } from '@/server/auth/backend';
import { setSessionCookies } from '@/server/auth/cookies';
import { clientIpOf, guardRequest, jsonError } from '@/server/auth/http';
import { parseTokenResponse } from '@/server/auth/refresh-core';

// Password policy is enforced by the login form and the backend; the BFF only
// checks the shape so it never leaks a different validation message.
const loginRequestSchema = z.object({
  email: z.string().trim().min(1).max(320),
  password: z.string().min(1).max(256),
  remember_me: z.boolean().optional().default(false),
});

const LOGIN_MESSAGES = {
  INVALID_BODY: 'Revisa el correo y la contraseña.',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
  INACTIVE: 'Tu cuenta está inactiva. Contacta a tu administrador.',
  RATE_LIMITED:
    'Demasiados intentos de inicio de sesión. Espera unos minutos e inténtalo de nuevo.',
  UNAVAILABLE:
    'No pudimos iniciar sesión en este momento. Inténtalo más tarde.',
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const blocked = guardRequest(request, raw.length > 0);
  if (blocked) return blocked;

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return jsonError(400, LOGIN_MESSAGES.INVALID_BODY);
  }
  const parsed = loginRequestSchema.safeParse(json);
  if (!parsed.success) return jsonError(400, LOGIN_MESSAGES.INVALID_BODY);

  let backend: Response;
  try {
    backend = await backendAuthPost(
      BACKEND_AUTH_ENDPOINT.LOGIN,
      parsed.data,
      clientIpOf(request),
    );
  } catch {
    return jsonError(503, LOGIN_MESSAGES.UNAVAILABLE);
  }

  switch (backend.status) {
    case 200:
      break;
    case 401:
      return jsonError(401, LOGIN_MESSAGES.INVALID_CREDENTIALS);
    case 403:
      return jsonError(403, LOGIN_MESSAGES.INACTIVE);
    case 422:
      return jsonError(422, LOGIN_MESSAGES.INVALID_BODY);
    case 429: {
      const retryAfter = backend.headers.get('retry-after');
      return jsonError(
        429,
        LOGIN_MESSAGES.RATE_LIMITED,
        retryAfter ? { 'Retry-After': retryAfter } : {},
      );
    }
    default:
      return jsonError(502, LOGIN_MESSAGES.UNAVAILABLE);
  }

  const body: unknown = await backend.json().catch(() => null);
  const tokens = parseTokenResponse(body);
  if (!tokens || !isRecord(body) || !isRecord(body.user))
    return jsonError(502, LOGIN_MESSAGES.UNAVAILABLE);

  // Tokens stay in httpOnly cookies; the browser only receives the user.
  const response = NextResponse.json({ user: body.user });
  response.headers.set('Cache-Control', 'no-store');
  setSessionCookies(response.cookies, tokens, parsed.data.remember_me);
  return response;
}
