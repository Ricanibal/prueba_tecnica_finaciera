import Link from 'next/link';

const Pagina404 = () => (
  <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
    <h1 className='text-2xl font-bold text-foreground mb-4'>
      Página no encontrada (404)
    </h1>
    <p className='mb-4 text-muted-foreground'>
      La ruta a la que intentas acceder no existe. Puedes volver al inicio o a
      movimientos.
    </p>
    <div className='flex gap-4'>
      <Link
        href='/'
        className='px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90'
      >
        Ir al inicio
      </Link>
      <Link
        href='/movimientos'
        className='px-4 py-2 rounded-md border border-border bg-card text-foreground font-medium hover:bg-muted'
      >
        Ver movimientos
      </Link>
    </div>
  </div>
);

export default Pagina404;
