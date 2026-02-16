/**
 * Carga .env con override. Importar ESTE archivo primero en rutas API que usen
 * GITHUB_CLIENT_ID/SECRET (p. ej. auth), para que no queden vacíos en Windows/Next.
 */
import path from 'path';
import { config } from 'dotenv';
config({ path: path.join(process.cwd(), '.env'), override: true });
