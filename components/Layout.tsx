import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authClient } from '@/lib/auth/client';
import Sidebar from '@/components/Sidebar';

const ANCHO_FIJO = 1200;

function esAdministrador(rol: string | undefined): boolean {
  return rol === 'ADMIN';
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { data: sesion, isPending } = authClient.useSession();
  const rol = (sesion?.user as { rol?: string } | undefined)?.rol;
  const esAdmin = esAdministrador(rol);

  useEffect(() => {
    if (isPending) return;
    if (!sesion) {
      const returnTo = router.asPath || '/';
      router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    }
  }, [sesion, isPending, router]);

  if (!isPending && !sesion) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <p className='text-muted-foreground'>Redirigiendo a login…</p>
      </div>
    );
  }

  return (
    <div
      className='flex min-h-screen bg-background'
      style={{
        maxWidth: ANCHO_FIJO,
        margin: '0 auto',
      }}
    >
      <Sidebar
        esAdmin={esAdmin ?? false}
        userName={sesion?.user?.name ?? 'Usuario'}
      />
      <main className='flex-1 min-w-0 overflow-auto p-6'>{children}</main>
    </div>
  );
};

export default Layout;
