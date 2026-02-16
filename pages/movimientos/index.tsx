import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth/client';
import PageHeader from '@/components/PageHeader';
import type { MovimientoDTO } from '@/lib/types/movimientos';
import type { ResumenReporte } from '@/lib/types/reportes';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const LIMIT = 10;

interface ListaRespuesta {
  items: MovimientoDTO[];
  total: number;
}

function formatearMonto(n: number): string {
  return new Intl.NumberFormat('es', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/* eslint-disable complexity -- página con cards, tabla, filtros y paginación */
const MovimientosPage = () => {
  const { data: sesion, isPending } = authClient.useSession();
  const [lista, setLista] = useState<ListaRespuesta | null>(null);
  const [resumen, setResumen] = useState<ResumenReporte | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<'INGRESO' | 'EGRESO' | ''>('');
  const [offset, setOffset] = useState(0);
  const rol = (sesion?.user as { rol?: string } | undefined)?.rol;
  const esAdmin = rol === 'ADMIN';

  useEffect(() => {
    if (isPending || !sesion) return;
    const params = new URLSearchParams();
    params.set('limit', String(LIMIT));
    params.set('offset', String(offset));
    params.set('order', 'fecha_desc');
    if (tipoFilter) params.set('tipo', tipoFilter);
    fetch(`/api/movimientos?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error('Error al cargar movimientos');
        return r.json();
      })
      .then(setLista)
      .catch((e) => setError(e.message));
  }, [sesion, isPending, offset, tipoFilter]);

  useEffect(() => {
    if (!esAdmin || !sesion || isPending) return;
    fetch('/api/reportes/resumen')
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then(setResumen)
      .catch(() => setResumen(null));
  }, [sesion, isPending, esAdmin]);

  const filteredItems = useMemo(() => {
    if (!lista?.items) return [];
    if (!search.trim()) return lista.items;
    const q = search.trim().toLowerCase();
    return lista.items.filter((m) => m.concepto?.toLowerCase().includes(q));
  }, [lista?.items, search]);

  const totalPages = lista ? Math.ceil(lista.total / LIMIT) : 0;
  const currentPage = Math.floor(offset / LIMIT) + 1;
  const from = offset + 1;
  const to = Math.min(offset + LIMIT, lista?.total ?? 0);

  if (isPending || !sesion) {
    return (
      <div>
        <p className='text-muted-foreground'>Cargando…</p>
      </div>
    );
  }

  const createAction = esAdmin ? (
    <Link
      href='/movimientos/nuevo'
      className='inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity'
    >
      + CREAR REGISTRO
    </Link>
  ) : null;

  return (
    <div>
      <PageHeader
        path='OPERACIONES / FINANZAS'
        title='Libro de movimientos'
        action={createAction}
      />

      {resumen && esAdmin && (
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
          <div className='rounded-lg border border-border bg-card p-4'>
            <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1'>
              Liquidez global
            </p>
            <p className='text-2xl font-bold text-foreground'>
              {formatearMonto(resumen.saldoActual)}
            </p>
          </div>
          <div className='rounded-lg border border-border bg-card p-4'>
            <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1'>
              Total ingresos
            </p>
            <p className='text-2xl font-bold text-success'>
              +{formatearMonto(resumen.totales.ingresos)}
            </p>
          </div>
          <div className='rounded-lg border border-border bg-card p-4'>
            <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1'>
              Total egresos
            </p>
            <p className='text-2xl font-bold text-destructive'>
              -{formatearMonto(resumen.totales.egresos)}
            </p>
          </div>
        </div>
      )}

      <div className='flex flex-wrap items-center gap-3 mb-4'>
        <div className='relative flex-1 min-w-[200px] max-w-sm'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <input
            type='search'
            placeholder='Buscar entradas…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground'
          />
        </div>
        <div className='flex items-center gap-2'>
          <Filter className='h-4 w-4 text-muted-foreground' />
          <select
            value={tipoFilter}
            onChange={(e) => {
              setTipoFilter(e.target.value as 'INGRESO' | 'EGRESO' | '');
              setOffset(0);
            }}
            className='py-2 px-3 rounded-md border border-input bg-background text-foreground text-sm'
          >
            <option value=''>Todos</option>
            <option value='INGRESO'>Ingreso</option>
            <option value='EGRESO'>Egreso</option>
          </select>
        </div>
      </div>

      {error && <p className='text-destructive mb-4'>{error}</p>}

      <div className='rounded-lg border border-border overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-muted/50'>
                <th className='border-b border-border p-3 text-left text-sm font-medium text-foreground'>
                  Concepto
                </th>
                <th className='border-b border-border p-3 text-left text-sm font-medium text-foreground'>
                  Clasificación
                </th>
                <th className='border-b border-border p-3 text-right text-sm font-medium text-foreground'>
                  Monto
                </th>
                <th className='border-b border-border p-3 text-left text-sm font-medium text-foreground'>
                  Fecha
                </th>
                <th className='border-b border-border p-3 text-left text-sm font-medium text-foreground'>
                  Usuario
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='p-6 text-center text-muted-foreground'
                  >
                    No hay movimientos
                  </td>
                </tr>
              ) : (
                filteredItems.map((m) => (
                  <tr
                    key={m.id}
                    className='border-b border-border last:border-0 hover:bg-muted/30'
                  >
                    <td className='p-3 text-sm text-foreground'>
                      {m.concepto}
                    </td>
                    <td className='p-3'>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          m.tipo === 'INGRESO'
                            ? 'bg-success/20 text-success'
                            : 'bg-destructive/20 text-destructive'
                        }`}
                      >
                        {m.tipo}
                      </span>
                    </td>
                    <td className='p-3 text-sm text-right font-medium'>
                      <span
                        className={
                          m.tipo === 'INGRESO'
                            ? 'text-success'
                            : 'text-destructive'
                        }
                      >
                        {m.tipo === 'EGRESO' ? '-' : '+'}
                        {formatearMonto(m.monto)}
                      </span>
                    </td>
                    <td className='p-3 text-sm text-muted-foreground'>
                      {m.fecha}
                    </td>
                    <td className='p-3 text-sm text-foreground'>
                      {m.usuarioNombre}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {lista && lista.total > 0 && (
          <div className='flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-sm text-muted-foreground'>
            <span>
              Mostrando {from} - {to} de {lista.total} registros
            </span>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setOffset((o) => Math.max(0, o - LIMIT))}
                disabled={offset === 0}
                className='p-1.5 rounded border border-border bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted'
              >
                <ChevronLeft className='h-4 w-4' />
              </button>
              <span className='min-w-[80px] text-center'>
                Página {currentPage} de {totalPages || 1}
              </span>
              <button
                type='button'
                onClick={() => setOffset((o) => o + LIMIT)}
                disabled={offset + LIMIT >= lista.total}
                className='p-1.5 rounded border border-border bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted'
              >
                <ChevronRight className='h-4 w-4' />
              </button>
            </div>
          </div>
        )}
      </div>

      {esAdmin && (
        <div className='mt-6 rounded-lg border border-border bg-card p-4 flex items-start gap-3'>
          <ShieldCheck className='h-5 w-5 text-primary shrink-0 mt-0.5' />
          <div className='text-sm text-muted-foreground'>
            <p className='font-medium text-foreground'>
              Sesión administrativa autorizada
            </p>
            <p>
              Autenticación GitHub. Rol ADMIN. El registro de auditoría está
              activo para las modificaciones de registros financieros.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovimientosPage;
