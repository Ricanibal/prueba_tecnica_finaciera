import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { authClient } from '@/lib/auth/client';
import PageHeader from '@/components/PageHeader';

const NuevoMovimientoPage = () => {
  const router = useRouter();
  const { data: sesion, isPending } = authClient.useSession();
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [tipo, setTipo] = useState<'INGRESO' | 'EGRESO'>('INGRESO');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const rol = (sesion?.user as { rol?: string } | undefined)?.rol;
  const esAdmin = rol === 'ADMIN';

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const num = parseFloat(monto);
    if (Number.isNaN(num) || num <= 0) {
      setError('Monto debe ser mayor que 0');
      return;
    }
    setEnviando(true);
    const res = await fetch('/api/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concepto: concepto.trim(),
        monto: num,
        fecha,
        tipo,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setEnviando(false);
    if (!res.ok) {
      setError(
        data.error || data.errors
          ? JSON.stringify(data.errors)
          : 'Error al guardar'
      );
      return;
    }
    router.push('/movimientos');
  };

  if (isPending) return <p className='text-muted-foreground'>Cargando…</p>;
  if (!sesion)
    return <p className='text-muted-foreground'>Debes iniciar sesión.</p>;
  if (!esAdmin)
    return (
      <p className='text-muted-foreground'>
        No tienes permiso para agregar movimientos.
      </p>
    );

  const backLink = (
    <Link href='/movimientos' className='text-sm text-primary hover:underline'>
      Volver a movimientos
    </Link>
  );

  return (
    <div>
      <PageHeader
        path='OPERACIONES / FINANZAS'
        title='Nuevo ingreso o egreso'
        action={backLink}
      />
      <form onSubmit={enviar} className='max-w-md space-y-4'>
        <div>
          <label className='block text-sm font-medium text-foreground mb-1'>
            Concepto
          </label>
          <input
            type='text'
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            required
            className='w-full border border-input rounded-md px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-foreground mb-1'>
            Monto
          </label>
          <input
            type='number'
            step='0.01'
            min='0.01'
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
            className='w-full border border-input rounded-md px-3 py-2 bg-background text-foreground'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-foreground mb-1'>
            Fecha
          </label>
          <input
            type='date'
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className='w-full border border-input rounded-md px-3 py-2 bg-background text-foreground'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-foreground mb-1'>
            Tipo
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'INGRESO' | 'EGRESO')}
            className='w-full border border-input rounded-md px-3 py-2 bg-background text-foreground'
          >
            <option value='INGRESO'>Ingreso</option>
            <option value='EGRESO'>Egreso</option>
          </select>
        </div>
        {error && <p className='text-destructive text-sm'>{error}</p>}
        <button
          type='submit'
          disabled={enviando}
          className='px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity'
        >
          {enviando ? 'Guardando…' : 'Guardar'}
        </button>
      </form>
    </div>
  );
};

export default NuevoMovimientoPage;
