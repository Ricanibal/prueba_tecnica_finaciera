import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authClient } from '@/lib/auth/client';
import { Check, Github } from 'lucide-react';

const APP_VERSION = '1.0.0';

const LoginPage = () => {
  const router = useRouter();
  const { data: sesion, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;
    if (sesion) {
      const returnTo =
        typeof router.query.returnTo === 'string' ? router.query.returnTo : '/';
      router.replace(returnTo);
    }
  }, [sesion, isPending, router]);

  const handleLogin = () => {
    authClient.signIn.social({
      provider: 'github',
      callbackURL:
        typeof router.query.returnTo === 'string' ? router.query.returnTo : '/',
    });
  };

  if (isPending || sesion) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <p className='text-muted-foreground'>Cargando…</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col bg-background text-foreground'>
      <div className='flex-1 flex flex-col items-center justify-center px-4 py-12'>
        <div className='w-full max-w-md flex flex-col items-center text-center mb-8'>
          <div className='w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mb-4'>
            F
          </div>
          <h1 className='text-2xl font-bold text-foreground mb-1'>
            Prueba_Financiera
          </h1>
          <p className='text-sm text-muted-foreground'>
            Sistema de ingresos y gastos
          </p>
        </div>

        <div className='w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm'>
          <h2 className='text-lg font-semibold text-card-foreground mb-2'>
            Entorno de prueba técnica
          </h2>
          <p className='text-sm text-muted-foreground mb-6'>
            Accede al sistema de gestión protegido por RBAC. Autentícate con tu
            cuenta de desarrollador para continuar.
          </p>
          <button
            type='button'
            onClick={handleLogin}
            className='w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity'
          >
            <Github className='h-5 w-5' />
            Login with GitHub
          </button>
          <div className='mt-6 flex items-start gap-2 text-xs text-muted-foreground'>
            <Check className='h-4 w-4 text-success shrink-0 mt-0.5' />
            <p>
              Autenticación segura vía GitHub OAuth 2.0. Al iniciar sesión
              aceptas las políticas de control de acceso por roles (RBAC) de
              este entorno.
            </p>
          </div>
        </div>
      </div>

      <footer className='py-4 px-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border'>
        <span className='flex items-center gap-2'>
          <span className='w-2 h-2 rounded-full bg-success' />
          SYSTEM OPERATIONAL
        </span>
        <span>V{APP_VERSION}-BETA</span>
        <span className='px-2 py-1 rounded bg-primary/20 text-primary text-[10px] font-medium'>
          FULLSTACK TECHNICAL ASSESSMENT
        </span>
      </footer>
    </div>
  );
};

export default LoginPage;
