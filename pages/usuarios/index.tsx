import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authClient } from '@/lib/auth/client';
import PageHeader from '@/components/PageHeader';
import type { Rol } from '@prisma/client';

interface UsuarioDTO {
  id: string;
  name: string;
  email: string;
  telefono: string | null;
  rol: Rol;
}

const UsuariosPage = () => {
  const router = useRouter();
  const { data: sesion, isPending } = authClient.useSession();
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const rol = (sesion?.user as { rol?: string } | undefined)?.rol;
  const esAdmin = rol === 'ADMIN';

  useEffect(() => {
    if (!esAdmin || isPending) return;
    if (!sesion) return;
    fetch('/api/usuarios')
      .then((r) => {
        if (!r.ok) throw new Error('Error al cargar usuarios');
        return r.json();
      })
      .then(setUsuarios)
      .catch((e) => setError(e.message));
  }, [sesion, isPending, esAdmin]);

  useEffect(() => {
    if (isPending) return;
    if (sesion && !esAdmin) router.replace('/');
  }, [sesion, isPending, esAdmin, router]);

  if (isPending) return <p className='text-muted-foreground'>Cargando…</p>;
  if (!sesion)
    return <p className='text-muted-foreground'>Debes iniciar sesión.</p>;
  if (!esAdmin) return null;

  return (
    <div>
      <PageHeader path='ADMINISTRACIÓN' title='Gestión de usuarios' />
      {error && <p className='text-destructive mb-4'>{error}</p>}
      <div className='rounded-lg border border-border overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-muted/50'>
                <th className='border-b border-border p-3 text-left text-sm font-medium text-foreground'>
                  Nombre
                </th>
                <th className='border-b border-border p-3 text-left text-sm font-medium text-foreground'>
                  Correo
                </th>
                <th className='border-b border-border p-3 text-left text-sm font-medium text-foreground'>
                  Teléfono
                </th>
                <th className='border-b border-border p-3 text-left text-sm font-medium text-foreground'>
                  Rol
                </th>
                <th className='border-b border-border p-3 text-left text-sm font-medium text-foreground'>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr
                  key={u.id}
                  className='border-b border-border last:border-0 hover:bg-muted/30'
                >
                  <td className='p-3 text-sm text-foreground'>{u.name}</td>
                  <td className='p-3 text-sm text-muted-foreground'>
                    {u.email}
                  </td>
                  <td className='p-3 text-sm text-muted-foreground'>
                    {u.telefono ?? '-'}
                  </td>
                  <td className='p-3 text-sm text-foreground'>{u.rol}</td>
                  <td className='p-3'>
                    <Link
                      href={`/usuarios/editar/${u.id}`}
                      className='text-sm text-primary hover:underline'
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsuariosPage;
