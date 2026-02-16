import ThemeToggle from '@/components/ThemeToggle';

interface PageHeaderProps {
  /** Ruta contextual, ej. "OPERACIONES / FINANZAS" */
  path?: string;
  /** Título de la página */
  title: string;
  /** Botón o elemento de acción principal (ej. "+ CREAR REGISTRO") */
  action?: React.ReactNode;
}

const PageHeader = ({ path, title, action }: PageHeaderProps) => (
    <header className='flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 mb-4'>
      <div>
        {path && (
          <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5'>
            {path}
          </p>
        )}
        <h1 className='text-xl font-bold text-foreground'>{title}</h1>
      </div>
      <div className='flex items-center gap-2'>
        {action}
        <ThemeToggle />
      </div>
    </header>
);

export default PageHeader;
