/**
 * Convierte Prisma Decimal (u otro) a number de forma consistente para DTOs y saldo.
 */
export function decimalANumero(valor: unknown): number {
  if (valor === null || valor === undefined) return 0;
  if (typeof valor === 'number' && !Number.isNaN(valor)) return valor;
  if (typeof valor === 'string') return parseFloat(valor) || 0;
  const d = valor as { toNumber?: () => number };
  if (typeof d?.toNumber === 'function') return d.toNumber();
  return Number(valor) || 0;
}
