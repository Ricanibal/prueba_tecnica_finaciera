import '@/lib/load-env'; // Antes de auth, para que GITHUB_* tengan valor
import { toNodeHandler } from 'better-auth/node';
import { auth } from '@/lib/auth';

export const config = { api: { bodyParser: false } };
export default toNodeHandler(auth.handler);
