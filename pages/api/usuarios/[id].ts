import type { NextApiRequest, NextApiResponse } from 'next';
import { requiereAdmin } from '@/lib/auth/sesion';
import {
  actualizarUsuario,
  obtenerUsuarioPorId,
} from '@/lib/servicios/usuarios';
import { esquemaActualizarUsuario } from '@/lib/validacion/usuarios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requiereAdmin(req);
  if (!auth.ok) {
    res.status(auth.res.status).json(auth.res.body);
    return;
  }
  const id = req.query.id as string;
  if (!id) {
    res.status(400).json({ error: 'ID de usuario requerido' });
    return;
  }

  if (req.method === 'GET') {
    const usuario = await obtenerUsuarioPorId(id);
    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.status(200).json(usuario);
    return;
  }

  if (req.method === 'PATCH') {
    const parseo = esquemaActualizarUsuario.safeParse(req.body);
    if (!parseo.success) {
      res.status(400).json({
        error: 'Datos inválidos',
        errors: parseo.error.flatten().fieldErrors,
      });
      return;
    }
    try {
      const usuario = await actualizarUsuario(id, parseo.data);
      res.status(200).json(usuario);
    } catch {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
    return;
  }

  res.setHeader('Allow', ['GET', 'PATCH']);
  res.status(405).json({ error: 'Método no permitido' });
}
