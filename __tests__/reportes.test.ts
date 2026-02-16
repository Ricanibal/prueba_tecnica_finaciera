import { describe, it, expect } from 'vitest';
import { calcularSaldo, generarCsvMovimientos } from '@/lib/servicios/reportes';
import type { MovimientoDTO } from '@/lib/types/movimientos';

describe('calcularSaldo', () => {
  it('devuelve 0 cuando no hay movimientos', () => {
    expect(calcularSaldo([])).toBe(0);
  });

  it('suma ingresos y resta egresos correctamente', () => {
    const movs = [
      { monto: 1000, tipo: 'INGRESO' },
      { monto: 300, tipo: 'EGRESO' },
      { monto: 200, tipo: 'INGRESO' },
    ];
    expect(calcularSaldo(movs)).toBe(1000 - 300 + 200);
  });

  it('maneja solo egresos como saldo negativo', () => {
    expect(calcularSaldo([{ monto: 50, tipo: 'EGRESO' }])).toBe(-50);
  });

  it('maneja decimales correctamente', () => {
    const movs = [
      { monto: 10.5, tipo: 'INGRESO' },
      { monto: 2.25, tipo: 'EGRESO' },
    ];
    expect(calcularSaldo(movs)).toBeCloseTo(8.25);
  });
});

describe('generarCsvMovimientos', () => {
  it('incluye encabezados: tipo, concepto, monto, fecha, usuario', () => {
    const movs: MovimientoDTO[] = [
      {
        id: '1',
        concepto: 'Prueba',
        monto: 100,
        fecha: '2026-02-15',
        tipo: 'INGRESO',
        usuarioId: 'u1',
        usuarioEmail: 'u@ejemplo.com',
        usuarioNombre: 'Usuario',
      },
    ];
    const csv = generarCsvMovimientos(movs);
    expect(csv).toContain('tipo');
    expect(csv).toContain('concepto');
    expect(csv).toContain('monto');
    expect(csv).toContain('fecha');
    expect(csv).toContain('usuario');
  });

  it('usa punto y coma como separador', () => {
    const movs: MovimientoDTO[] = [
      {
        id: '1',
        concepto: 'A',
        monto: 1,
        fecha: '2026-02-15',
        tipo: 'INGRESO',
        usuarioId: 'u1',
        usuarioEmail: 'a@b.com',
        usuarioNombre: 'N',
      },
    ];
    const csv = generarCsvMovimientos(movs);
    const primeraFila = csv.split('\r\n')[1];
    expect(primeraFila).toContain(';');
    expect(primeraFila?.split(';').length).toBe(5);
  });

  it('incluye BOM UTF-8 al inicio para Excel', () => {
    const csv = generarCsvMovimientos([]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });
});
