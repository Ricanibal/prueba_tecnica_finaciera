import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authClient } from '@/lib/auth/client';
import PageHeader from '@/components/PageHeader';
import type { ResumenReporte } from '@/lib/types/reportes';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function formatearMonto(n: number): string {
  return new Intl.NumberFormat('es', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

const ReportesPage = () => {
  const router = useRouter();
  const { data: sesion, isPending } = authClient.useSession();
  const [resumen, setResumen] = useState<ResumenReporte | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rol = (sesion?.user as { rol?: string } | undefined)?.rol;
  const esAdmin = rol === 'ADMIN';

  useEffect(() => {
    if (!esAdmin || !sesion || isPending) return;
    fetch('/api/reportes/resumen')
      .then((r) => {
        if (!r.ok) throw new Error('Error al cargar reportes');
        return r.json();
      })
      .then(setResumen)
      .catch((e) => setError(e.message));
  }, [sesion, isPending, esAdmin]);

  useEffect(() => {
    if (isPending) return;
    if (sesion && !esAdmin) router.replace('/');
  }, [sesion, isPending, esAdmin, router]);

  const descargarCsv = () => {
    window.open('/api/reportes/csv', '_blank');
  };

  if (isPending || !sesion)
    return <p className='text-muted-foreground'>Cargando…</p>;
  if (!esAdmin) return null;

  const csvAction = (
    <button
      type='button'
      onClick={descargarCsv}
      className='inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity'
    >
      Descargar reporte CSV
    </button>
  );

  return (
    <div>
      <PageHeader title='Reportes' action={csvAction} />
      {error && <p className='text-destructive mb-4'>{error}</p>}
      {resumen && (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
            <div className='rounded-lg border border-border bg-card p-4'>
              <h2 className='text-sm font-semibold text-muted-foreground mb-1'>
                Saldo actual
              </h2>
              <p className='text-2xl font-bold text-foreground'>
                {formatearMonto(resumen.saldoActual)}
              </p>
            </div>
            <div className='rounded-lg border border-border bg-card p-4'>
              <h2 className='text-sm font-semibold text-muted-foreground mb-1'>
                Ingresos
              </h2>
              <p className='text-xl font-bold text-success'>
                {formatearMonto(resumen.totales.ingresos)}
              </p>
            </div>
            <div className='rounded-lg border border-border bg-card p-4'>
              <h2 className='text-sm font-semibold text-muted-foreground mb-1'>
                Egresos
              </h2>
              <p className='text-xl font-bold text-destructive'>
                {formatearMonto(resumen.totales.egresos)}
              </p>
            </div>
          </div>
          {resumen.serie.length > 0 && (
            <div className='mb-6 rounded-lg border border-border bg-card p-4'>
              <h2 className='text-lg font-semibold text-foreground mb-4'>
                Movimientos por período
              </h2>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={resumen.serie}>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      className='stroke-border'
                    />
                    <XAxis
                      dataKey='periodo'
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      tickFormatter={formatearMonto}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(v: number | undefined) =>
                        formatearMonto(v ?? 0)
                      }
                    />
                    <Legend />
                    <Bar
                      dataKey='ingresos'
                      fill='hsl(142 55% 35%)'
                      name='Ingresos'
                    />
                    <Bar
                      dataKey='egresos'
                      fill='hsl(0 65% 48%)'
                      name='Egresos'
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportesPage;
