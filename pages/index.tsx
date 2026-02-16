import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth/client';
import PageHeader from '@/components/PageHeader';
import type { ResumenReporte } from '@/lib/types/reportes';

const Home = () => {
  const { data: sesion, isPending } = authClient.useSession();
  const [resumen, setResumen] = useState<ResumenReporte | null>(null);
  const rol = (sesion?.user as { rol?: string } | undefined)?.rol;
  const esAdmin = rol === 'ADMIN';

  useEffect(() => {
    if (!sesion || isPending || !esAdmin) return;
    fetch('/api/reportes/resumen')
      .then((r) => (r.ok ? r.json() : null))
      .then(setResumen)
      .catch(() => setResumen(null));
  }, [sesion, isPending, esAdmin]);

  if (isPending || !sesion) {
    return <p className='text-muted-foreground'>Cargando…</p>;
  }

  return (
    <div>
      <PageHeader title='Inicio' />
      <p className='mb-6 text-muted-foreground'>
        Bienvenido, {sesion.user.name}.
      </p>
      {resumen && esAdmin && (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8'>
          <div className='rounded-lg border border-border bg-card p-4'>
            <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1'>
              Saldo actual
            </p>
            <p className='text-2xl font-bold text-foreground'>
              {new Intl.NumberFormat('es', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(resumen.saldoActual)}
            </p>
          </div>
          <div className='rounded-lg border border-border bg-card p-4'>
            <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1'>
              Totales (ingresos / egresos)
            </p>
            <p className='text-lg font-medium text-foreground'>
              {new Intl.NumberFormat('es', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(resumen.totales.ingresos)}{' '}
              /{' '}
              {new Intl.NumberFormat('es', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(resumen.totales.egresos)}
            </p>
          </div>
        </div>
      )}
      <ul className='rounded-lg border border-border bg-card p-6 list-disc list-inside space-y-3 text-muted-foreground'>
        <li className='marker:text-muted-foreground'>
          <Link
            href='/movimientos'
            className='text-muted-foreground hover:text-foreground hover:underline font-medium transition-colors'
          >
            Gestión de ingresos y gastos
          </Link>
        </li>
        {esAdmin && (
          <>
            <li className='marker:text-muted-foreground'>
              <Link
                href='/usuarios'
                className='text-muted-foreground hover:text-foreground hover:underline font-medium transition-colors'
              >
                Gestión de usuarios
              </Link>
            </li>
            <li className='marker:text-muted-foreground'>
              <Link
                href='/reportes'
                className='text-muted-foreground hover:text-foreground hover:underline font-medium transition-colors'
              >
                Reportes
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Home;
