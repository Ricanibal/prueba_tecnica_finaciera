import Link from 'next/link';
import { useRouter } from 'next/router';

const SIDEBAR_WIDTH = 240;

interface SidebarProps {
  esAdmin: boolean;
  userName: string;
}

const Sidebar = ({ esAdmin, userName }: SidebarProps) => {
  const router = useRouter();

  const linkClass = (path: string) =>
    `block py-2 px-3 rounded-md text-sm font-medium transition-colors ${
      router.pathname === path
        ? 'bg-primary text-primary-foreground'
        : 'text-foreground hover:bg-muted'
    }`;

  const initials = userName
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className='shrink-0 flex flex-col border-r border-border bg-card'
      style={{ width: SIDEBAR_WIDTH }}
    >
      <div className='p-4 border-b border-border'>
        <span className='font-bold text-lg text-foreground'>Prueba_Financiera</span>
      </div>
      <nav className='flex-1 p-3 space-y-1'>
        <Link href='/' className={linkClass('/')}>
          Inicio
        </Link>
        <Link href='/movimientos' className={linkClass('/movimientos')}>
          Movimientos
        </Link>
        {esAdmin && (
          <>
            <Link href='/usuarios' className={linkClass('/usuarios')}>
              Usuarios
            </Link>
            <Link href='/reportes' className={linkClass('/reportes')}>
              Reportes
            </Link>
          </>
        )}
      </nav>
      <div className='p-4 border-t border-border'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground'>
            {initials}
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-medium text-foreground truncate'>
              {userName}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
