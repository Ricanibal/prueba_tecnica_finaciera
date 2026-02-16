import { type Prisma } from '@prisma/client';
import type { TipoMovimiento } from '@prisma/client';
import type {
  FiltrosMovimientos,
  ListaMovimientosRespuesta,
  MovimientoDTO,
  CrearMovimientoDatos,
} from '@/lib/types/movimientos';
import { prisma } from '@/lib/db';
import { decimalANumero } from './decimal';

function construirWhereMovimientos(
  from?: Date,
  to?: Date,
  tipo?: TipoMovimiento
): Prisma.MovimientoWhereInput {
  if (!from && !to && !tipo) return {};
  const fecha =
    from || to
      ? { ...(from && { gte: from }), ...(to && { lte: to }) }
      : undefined;
  return {
    ...(fecha && { fecha }),
    ...(tipo && { tipo }),
  };
}

function movimientoADTO(m: {
  id: string;
  concepto: string;
  monto: unknown;
  fecha: Date;
  tipo: string;
  usuarioId: string;
  usuario: { email: string; name: string };
}): MovimientoDTO {
  return {
    id: m.id,
    concepto: m.concepto,
    monto: decimalANumero(m.monto),
    fecha: m.fecha.toISOString().slice(0, 10),
    tipo: m.tipo as MovimientoDTO['tipo'],
    usuarioId: m.usuarioId,
    usuarioEmail: m.usuario.email,
    usuarioNombre: m.usuario.name,
  };
}

export async function obtenerMovimientos(
  filtros: FiltrosMovimientos
): Promise<ListaMovimientosRespuesta> {
  const {
    limit: limitParam,
    offset: offsetParam,
    order: orderParam,
    from: fromParam,
    to: toParam,
    tipo,
  } = filtros;
  const limit = Math.min(Math.max(limitParam ?? 50, 1), 100);
  const offset = Math.max(offsetParam ?? 0, 0);
  const order = orderParam ?? 'fecha_desc';
  const from = fromParam ? new Date(fromParam) : undefined;
  const to = toParam ? new Date(toParam) : undefined;

  const where = construirWhereMovimientos(from, to, tipo);

  const [items, total] = await Promise.all([
    prisma.movimiento.findMany({
      where,
      orderBy: { fecha: order === 'fecha_desc' ? 'desc' : 'asc' },
      take: limit,
      skip: offset,
      include: { usuario: { select: { email: true, name: true } } },
    }),
    prisma.movimiento.count({ where }),
  ]);

  return {
    items: items.map(movimientoADTO),
    total,
  };
}

export async function crearMovimiento(
  datos: CrearMovimientoDatos,
  usuarioId: string
): Promise<MovimientoDTO> {
  const mov = await prisma.movimiento.create({
    data: {
      concepto: datos.concepto,
      monto: datos.monto,
      fecha: new Date(datos.fecha),
      tipo: datos.tipo,
      usuarioId,
    },
    include: { usuario: { select: { email: true, name: true } } },
  });
  return movimientoADTO(mov);
}
