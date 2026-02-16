import type { NextApiRequest, NextApiResponse } from 'next';
import { requiereAdmin } from '@/lib/auth/sesion';
import {
  obtenerMovimientosParaCsv,
  generarCsvMovimientos,
} from '@/lib/servicios/reportes';

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
  const movimientos = await obtenerMovimientosParaCsv();
  const csv = generarCsvMovimientos(movimientos);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="reporte-movimientos.csv"'
  );
  res.status(200).send(csv);
}
