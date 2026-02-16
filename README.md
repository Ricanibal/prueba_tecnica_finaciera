# Prueba_Financiera

## Despliegue en Vercel

Para desplegar el proyecto en Vercel y cumplir con los requisitos de entrega:

### Requisitos previos

- Cuenta en [Vercel](https://vercel.com).
- Repositorio del proyecto en GitHub (código subido).
- Proyecto de Supabase con la base de datos creada y migraciones aplicadas (en local o en un entorno de staging).
- OAuth App de GitHub con al menos el callback de producción configurado.

### Pasos para desplegar

1. **Importar el proyecto en Vercel**
   - Entra en [vercel.com](https://vercel.com) e inicia sesión.
   - Click en **Add New** → **Project**.
   - Importa el repositorio de GitHub (autoriza a Vercel si es la primera vez).
   - Selecciona el repositorio y la rama a desplegar (por ejemplo `main`).

2. **Configurar variables de entorno**
   - En la pantalla de configuración del proyecto, ve a **Environment Variables**.
   - Añade las siguientes variables (marca **Production**, y opcionalmente **Preview** si quieres que los previews usen la misma config):

   | Variable | Descripción | Ejemplo (producción) |
   |----------|-------------|----------------------|
   | `DATABASE_URL` | Connection string de PostgreSQL (Supabase). Usa la URI del pooler si aplica. | `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres` |
   | `NEXT_PUBLIC_BETTER_AUTH_URL` | URL base de la app en producción. | `https://tu-app.vercel.app` |
   | `GITHUB_CLIENT_ID` | Client ID de la GitHub OAuth App. | (valor de la app en GitHub) |
   | `GITHUB_CLIENT_SECRET` | Client Secret de la GitHub OAuth App. | (valor de la app en GitHub) |

   - **Importante:** Sustituye `https://tu-app.vercel.app` por la URL real que te asigne Vercel tras el primer despliegue; si es la primera vez, puedes usar un dominio temporal y luego editar la variable y redeployar.

3. **Configurar GitHub OAuth para producción**
   - En [GitHub → OAuth Apps](https://github.com/settings/developers), abre tu aplicación (o crea una para producción).
   - En **Authorization callback URL** añade: `https://[tu-dominio-vercel].vercel.app/api/auth/callback/github`.
   - Guarda los cambios.

4. **Build y despliegue**
   - Vercel detecta Next.js y usa `npm run build` por defecto.
   - Para que Prisma funcione en el build, en **Settings** → **General** → **Build & Development Settings** puedes dejar **Build Command** en blanco (usa `next build`) y añadir en tu `package.json` un script `"postinstall": "prisma generate"`, o bien definir **Build Command** como: `npx prisma generate && npm run build`.
   - Asegúrate de que las migraciones estén aplicadas en la base de datos que usa `DATABASE_URL` de producción (desde local: `DATABASE_URL="url-produccion" npx prisma migrate deploy`).
   - Click en **Deploy**. Tras el build, anota la URL (ej. `https://prueba-financiera-xxx.vercel.app`).

5. **Ajustar URL en variables (si usaste placeholder)**
   - Si en el paso 2 pusiste una URL provisional, en Vercel → Project → **Settings** → **Environment Variables** edita `NEXT_PUBLIC_BETTER_AUTH_URL` con la URL real del despliegue.
   - En GitHub OAuth, verifica que el callback sea exactamente esa URL + `/api/auth/callback/github`.
   - Realiza un **Redeploy** desde la pestaña **Deployments**.

6. **Comprobar el despliegue**
   - Abre la URL de producción.
   - Deberías ser redirigido a la página de login; inicia sesión con GitHub y comprueba que puedes acceder a Inicio, Movimientos y (como ADMIN) Usuarios y Reportes.

### Notas para el despliegue

- **Base de datos:** Las migraciones de Prisma deben estar aplicadas en la base de datos de producción antes de usar la app. Puedes ejecutar `npx prisma migrate deploy` desde local con `DATABASE_URL` de producción.
- **Secrets:** No subas `.env` al repositorio. Todas las variables sensibles se configuran solo en Vercel (y en local en tu `.env`).
- **Entregables:** Según los criterios, debes proporcionar la URL del proyecto desplegado en Vercel y, si se indica, compartir acceso al repositorio y al `.env` (o a los valores necesarios) con los correos indicados en la prueba.
# Prueba_Tecnica_Finaciera
