import { describe, it, expect } from 'vitest';
import { autorizarParaAdmin, esAdministrador } from '@/lib/auth/sesion';

describe('autorizarParaAdmin', () => {
  it('devuelve 401 cuando no hay sesión', () => {
    const resultado = autorizarParaAdmin(null);
    expect(resultado.permitido).toBe(false);
    expect(resultado.status).toBe(401);
    expect(resultado.body).toMatchObject({ error: 'No autenticado' });
  });

  it('devuelve 403 cuando la sesión tiene rol no admin', () => {
    const sesionMock = {
      user: { id: '1', name: 'U', email: 'u@u.com', rol: 'USUARIO' },
      session: {},
    };
    const resultado = autorizarParaAdmin(sesionMock as never);
    expect(resultado.permitido).toBe(false);
    expect(resultado.status).toBe(403);
    expect(resultado.body).toMatchObject({ error: expect.stringContaining('administrador') });
  });

  it('permite cuando la sesión tiene rol ADMIN', () => {
    const sesionMock = {
      user: { id: '1', name: 'A', email: 'a@a.com', rol: 'ADMIN' },
      session: {},
    };
    const resultado = autorizarParaAdmin(sesionMock as never);
    expect(resultado.permitido).toBe(true);
    expect(resultado.sesion).toBe(sesionMock);
  });
});

describe('esAdministrador', () => {
  it('devuelve false para sesión null', () => {
    expect(esAdministrador(null)).toBe(false);
  });

  it('devuelve false cuando el usuario no tiene rol admin', () => {
    expect(esAdministrador({ user: { rol: 'USUARIO' } } as never)).toBe(false);
  });

  it('devuelve true cuando el usuario tiene rol ADMIN', () => {
    expect(esAdministrador({ user: { rol: 'ADMIN' } } as never)).toBe(true);
  });
});
