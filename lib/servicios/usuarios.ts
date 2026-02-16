import type { Rol } from '@prisma/client';
import { prisma } from '@/lib/db';

export interface UsuarioListaDTO {
  id: string;
  name: string;
  email: string;
  telefono: string | null;
  rol: Rol;
}

export async function listarUsuarios(): Promise<UsuarioListaDTO[]> {
  const usuarios = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      telefono: true,
      rol: true,
    },
  });
  return usuarios;
}

export interface ActualizarUsuarioDatos {
  name?: string;
  rol?: Rol;
}

export async function actualizarUsuario(
  id: string,
  datos: ActualizarUsuarioDatos
): Promise<UsuarioListaDTO | null> {
  const actualizado = await prisma.user.update({
    where: { id },
    data: {
      ...(datos.name !== undefined && { name: datos.name }),
      ...(datos.rol !== undefined && { rol: datos.rol }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      telefono: true,
      rol: true,
    },
  });
  return actualizado;
}

export async function obtenerUsuarioPorId(
  id: string
): Promise<UsuarioListaDTO | null> {
  const u = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, telefono: true, rol: true },
  });
  return u;
}
