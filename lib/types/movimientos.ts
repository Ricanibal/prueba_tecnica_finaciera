import type { TipoMovimiento } from '@prisma/client';

export type { TipoMovimiento };

export interface MovimientoDTO {
  id: string;
  concepto: string;
  monto: number;
  fecha: string;
  tipo: TipoMovimiento;
  usuarioId: string;
  usuarioEmail: string;
  usuarioNombre: string;
}

export interface FiltrosMovimientos {
  limit?: number;
  offset?: number;
  order?: 'fecha_asc' | 'fecha_desc';
  from?: string;
  to?: string;
  tipo?: TipoMovimiento;
}

export interface ListaMovimientosRespuesta {
  items: MovimientoDTO[];
  total: number;
}

export interface CrearMovimientoDatos {
  concepto: string;
  monto: number;
  fecha: string;
  tipo: TipoMovimiento;
}
