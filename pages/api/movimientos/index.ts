import type { NextApiRequest, NextApiResponse } from 'next';
import { requiereAuth, requiereAdmin } from '@/lib/auth/sesion';
import {
  obtenerMovimientos,
  crearMovimiento,
} from '@/lib/servicios/movimientos';
import { esquemaCrearMovimiento } from '@/lib/validacion/movimientos';
import { esquemaQueryMovimientos } from '@/lib/validacion/query-movimientos';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const auth = await requiereAuth(req);
    if (!auth.ok) {
      res.status(auth.res.status).json(auth.res.body);
      return;
    }
    const parseo = esquemaQueryMovimientos.safeParse(req.query);
    const filtros = parseo.success ? parseo.data : {};
    const resultado = await obtenerMovimientos(filtros);
    res.status(200).json(resultado);
    return;
  }

  if (req.method === 'POST') {
    const auth = await requiereAdmin(req);
    if (!auth.ok) {
      res.status(auth.res.status).json(auth.res.body);
      return;
    }
    const parseo = esquemaCrearMovimiento.safeParse(req.body);
    if (!parseo.success) {
      res.status(400).json({
        error: 'Datos inválidos',
        errors: parseo.error.flatten().fieldErrors,
      });
      return;
    }
    const usuarioId = auth.sesion.user.id;
    const movimiento = await crearMovimiento(parseo.data, usuarioId);
    res.status(201).json(movimiento);
    return;
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({ error: 'Método no permitido' });
}
