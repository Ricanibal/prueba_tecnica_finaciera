import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/db';

// La ruta API auth importa @/lib/load-env antes de este módulo para que tengan valor
const githubClientId = process.env.GITHUB_CLIENT_ID?.trim() ?? '';
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET?.trim() ?? '';

if (
  process.env.NODE_ENV === 'development' &&
  (!githubClientId || !githubClientSecret)
) {
  // eslint-disable-next-line no-console -- aviso en desarrollo para vars GitHub
  console.warn(
    '[Better Auth] GitHub OAuth: faltan variables. Revisa que en .env tengas GITHUB_CLIENT_ID y GITHUB_CLIENT_SECRET (sin espacios alrededor del =). Reinicia el servidor (npm run dev).'
  );
}

export const auth = betterAuth({
  trustHost: true,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    additionalFields: {
      rol: {
        type: 'string',
        required: true,
        defaultValue: 'ADMIN',
        input: false,
      },
      telefono: {
        type: 'string',
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const rolActual = (user as { rol?: string | null }).rol;
          if (
            rolActual === null ||
            rolActual === undefined ||
            rolActual === ''
          ) {
            await prisma.user.update({
              where: { id: user.id },
              data: { rol: 'ADMIN' },
            });
          }
        },
      },
    },
  },
  socialProviders: {
    github: {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
