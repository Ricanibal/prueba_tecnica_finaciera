import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { authClient } from '@/lib/auth/client';
import PageHeader from '@/components/PageHeader';
import type { Rol } from '@prisma/client';

interface FormularioEditarUsuarioProps {
  name: string;
  rol: Rol;
  setName: (v: string) => void;
  setRol: (v: Rol) => void;
  enviar: (e: React.FormEvent) => void;
  enviando: boolean;
}

const FormularioEditarUsuario = ({
  name,
  rol,
  setName,
  setRol,
  enviar,
  enviando,
}: FormularioEditarUsuarioProps) => (
  <form onSubmit={enviar} className='max-w-md space-y-4'>
    <div>
      <label className='block text-sm font-medium text-foreground mb-1'>
        Nombre
      </label>
      <input
        type='text'
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className='w-full border border-input rounded-md px-3 py-2 bg-background text-foreground'
      />
    </div>
    <div>
      <label className='block text-sm font-medium text-foreground mb-1'>
        Rol
      </label>
      <select
        value={rol}
        onChange={(e) => setRol(e.target.value as Rol)}
        className='w-full border border-input rounded-md px-3 py-2 bg-background text-foreground'
      >
        <option value='ADMIN'>ADMIN</option>
        <option value='USUARIO'>USUARIO</option>
      </select>
    </div>
    <button
      type='submit'
      disabled={enviando}
      className='px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity'
    >
      {enviando ? 'Guardando…' : 'Guardar'}
    </button>
  </form>
);

/* eslint-disable complexity -- página de edición con auth, carga y formulario */
const EditarUsuarioPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: sesion, isPending } = authClient.useSession();
  const [name, setName] = useState('');
  const [rol, setRol] = useState<Rol>('ADMIN');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const rolUsuario = (sesion?.user as { rol?: string } | undefined)?.rol;
  const esAdmin = rolUsuario === 'ADMIN';

  useEffect(() => {
    if (!id || typeof id !== 'string' || !esAdmin || !sesion) return;
    fetch(`/api/usuarios/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Usuario no encontrado');
        return r.json();
      })
      .then((u: { name: string; rol: Rol }) => {
        setName(u.name);
        setRol(u.rol);
      })
      .catch(() => setError('Usuario no encontrado'))
      .finally(() => setCargando(false));
  }, [id, esAdmin, sesion]);

  useEffect(() => {
    if (isPending) return;
    if (sesion && !esAdmin) router.replace('/');
  }, [sesion, isPending, esAdmin, router]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof id !== 'string') return;
    setError(null);
    setEnviando(true);
    const res = await fetch(`/api/usuarios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), rol }),
    });
    const data = await res.json().catch(() => ({}));
    setEnviando(false);
    if (!res.ok) {
      setError(data.error || 'Error al guardar');
      return;
    }
    router.push('/usuarios');
  };

  if (isPending || !sesion || !esAdmin)
    return <p className='text-muted-foreground'>Cargando…</p>;
  if (!id || typeof id !== 'string')
    return <p className='text-muted-foreground'>ID inválido</p>;

  const mostrarFormulario = !cargando && !error;

  const backLink = (
    <Link href='/usuarios' className='text-sm text-primary hover:underline'>
      Volver a usuarios
    </Link>
  );

  return (
    <div>
      <PageHeader
        path='ADMINISTRACIÓN'
        title='Editar usuario'
        action={backLink}
      />
      {cargando && <p className='text-muted-foreground'>Cargando usuario…</p>}
      {error && !cargando && <p className='text-destructive mb-4'>{error}</p>}
      {mostrarFormulario && (
        <FormularioEditarUsuario
          name={name}
          rol={rol}
          setName={setName}
          setRol={setRol}
          enviar={enviar}
          enviando={enviando}
        />
      )}
    </div>
  );
};

export default EditarUsuarioPage;
