import type { IncomingMessage } from 'http';
import { auth } from './index';

export type Sesion = Awaited<ReturnType<typeof auth.api.getSession>>;

/**
 * Convierte headers de Node (IncomingMessage) a Web API Headers para Better Auth.
 */
function headersDesdeRequest(req: IncomingMessage): Headers {
  const h = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v !== undefined) h.set(k, Array.isArray(v) ? v.join(', ') : String(v));
  }
  return h;
}

/**
 * Obtiene la sesión desde el request (cookies/headers).
 * Usar en API routes de Next (Pages Router). Devuelve null si no hay sesión.
 */
export async function obtenerSesion(
  req: IncomingMessage
): Promise<Sesion | null> {
  try {
    const sesion = await auth.api.getSession({
      headers: headersDesdeRequest(req),
    });
    return sesion ?? null;
  } catch {
    return null;
  }
}

/**
 * Exige que haya sesión. Si no hay, devuelve objeto para responder 401.
 * Uso: const resultado = await requiereAuth(req); if (resultado.error) return resultado.res;
 */
export async function requiereAuth(
  req: IncomingMessage
): Promise<
  | { ok: true; sesion: NonNullable<Sesion> }
  | { ok: false; res: { status: number; body: unknown } }
> {
  const sesion = await obtenerSesion(req);
  if (!sesion) {
    return {
      ok: false,
      res: {
        status: 401,
        body: { error: 'No autenticado' },
      },
    };
  }
  return { ok: true, sesion };
}

const ROL_ADMIN = 'ADMIN';

/**
 * Exige que el usuario sea administrador. Primero comprueba auth (401), luego rol (403).
 * Uso: const resultado = await requiereAdmin(req); if (resultado.error) return resultado.res;
 */
export async function requiereAdmin(
  req: IncomingMessage
): Promise<
  | { ok: true; sesion: NonNullable<Sesion> }
  | { ok: false; res: { status: number; body: unknown } }
> {
  const authResult = await requiereAuth(req);
  if (!authResult.ok) return authResult;

  const rol = (authResult.sesion.user as { rol?: string })?.rol;
  if (rol !== ROL_ADMIN) {
    return {
      ok: false,
      res: {
        status: 403,
        body: { error: 'Sin permiso. Se requiere rol administrador.' },
      },
    };
  }
  return authResult;
}

/**
 * Para uso en UI: indica si la sesión corresponde a un administrador.
 */
export function esAdministrador(sesion: Sesion | null): boolean {
  if (!sesion?.user) return false;
  const rol = (sesion.user as { rol?: string })?.rol;
  return rol === ROL_ADMIN;
}

/**
 * Dado una sesión (o null), determina si está autorizado como admin.
 * Útil para tests y para reutilizar lógica sin repetir obtenerSesion.
 */
export function autorizarParaAdmin(
  sesion: Sesion | null
):
  | { permitido: true; sesion: NonNullable<Sesion> }
  | { permitido: false; status: 401 | 403; body: unknown } {
  if (!sesion) {
    return { permitido: false, status: 401, body: { error: 'No autenticado' } };
  }
  const rol = (sesion.user as { rol?: string })?.rol;
  if (rol !== ROL_ADMIN) {
    return {
      permitido: false,
      status: 403,
      body: { error: 'Sin permiso. Se requiere rol administrador.' },
    };
  }
  return { permitido: true, sesion };
}
