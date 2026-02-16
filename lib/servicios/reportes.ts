import type { ResumenReporte } from '@/lib/types/reportes';
import type { MovimientoDTO } from '@/lib/types/movimientos';
import { prisma } from '@/lib/db';
import { decimalANumero } from './decimal';

/** Monto y tipo para cálculo de saldo (ingresos - egresos). */
export interface MovimientoParaSaldo {
  monto: number;
  tipo: string;
}

/**
 * Calcula el saldo a partir de una lista de movimientos: suma ingresos, resta egresos.
 * Usa números de forma consistente (evita problemas con Decimal).
 */
export function calcularSaldo(movimientos: MovimientoParaSaldo[]): number {
  let saldo = 0;
  for (const m of movimientos) {
    const valor =
      typeof m.monto === 'number' ? m.monto : decimalANumero(m.monto);
    if (m.tipo === 'INGRESO') saldo += valor;
    else if (m.tipo === 'EGRESO') saldo -= valor;
  }
  return saldo;
}

export async function obtenerResumen(): Promise<ResumenReporte> {
  const movimientos = await prisma.movimiento.findMany({
    orderBy: { fecha: 'asc' },
    include: { usuario: { select: { email: true } } },
  });

  let totalIngresos = 0;
  let totalEgresos = 0;
  const porPeriodo = new Map<string, { ingresos: number; egresos: number }>();

  for (const m of movimientos) {
    const valor = decimalANumero(m.monto);
    const periodo = m.fecha.toISOString().slice(0, 7); // "YYYY-MM"
    if (!porPeriodo.has(periodo)) {
      porPeriodo.set(periodo, { ingresos: 0, egresos: 0 });
    }
    const p = porPeriodo.get(periodo)!;
    if (m.tipo === 'INGRESO') {
      totalIngresos += valor;
      p.ingresos += valor;
    } else {
      totalEgresos += valor;
      p.egresos += valor;
    }
  }

  const saldoActual = totalIngresos - totalEgresos;
  const serie = Array.from(porPeriodo.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periodo, tot]) => ({
      periodo,
      ingresos: tot.ingresos,
      egresos: tot.egresos,
    }));

  return {
    saldoActual,
    totales: { ingresos: totalIngresos, egresos: totalEgresos },
    serie,
  };
}

const SEPARADOR_CSV = ';';
const BOM_UTF8 = '\uFEFF';

/**
 * Genera el contenido CSV de movimientos: tipo, concepto, monto, fecha, usuario (email).
 * Encoding UTF-8; separador ";". Incluir BOM al inicio para Excel.
 */
export function generarCsvMovimientos(movimientos: MovimientoDTO[]): string {
  const encabezados = ['tipo', 'concepto', 'monto', 'fecha', 'usuario'];
  const filas = movimientos.map((m) => [
    m.tipo,
    escaparCsv(m.concepto),
    String(m.monto),
    m.fecha,
    escaparCsv(m.usuarioEmail),
  ]);
  const lineas = [
    encabezados.join(SEPARADOR_CSV),
    ...filas.map((f) => f.join(SEPARADOR_CSV)),
  ];
  return BOM_UTF8 + lineas.join('\r\n');
}

function escaparCsv(val: string): string {
  if (val.includes(SEPARADOR_CSV) || val.includes('"') || val.includes('\n'))
    return `"${val.replace(/"/g, '""')}"`;
  return val;
}

export async function obtenerMovimientosParaCsv(): Promise<MovimientoDTO[]> {
  const lista = await prisma.movimiento.findMany({
    orderBy: { fecha: 'desc' },
    include: { usuario: { select: { email: true, name: true } } },
  });
  return lista.map((m) => ({
    id: m.id,
    concepto: m.concepto,
    monto: decimalANumero(m.monto),
    fecha: m.fecha.toISOString().slice(0, 10),
    tipo: m.tipo,
    usuarioId: m.usuarioId,
    usuarioEmail: m.usuario.email,
    usuarioNombre: m.usuario.name,
  }));
}
