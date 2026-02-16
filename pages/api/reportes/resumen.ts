import type { NextApiRequest, NextApiResponse } from 'next';
import { requiereAdmin } from '@/lib/auth/sesion';
import { obtenerResumen } from '@/lib/servicios/reportes';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  const auth = await requiereAdmin(req);
  if (!auth.ok) {
    res.status(auth.res.status).json(auth.res.body);
    return;
  }
  const resumen = await obtenerResumen();
  res.status(200).json(resumen);
}
