export interface ResumenReporte {
  saldoActual: number;
  totales: { ingresos: number; egresos: number };
  serie: Array<{
    periodo: string;
    ingresos: number;
    egresos: number;
  }>;
}
