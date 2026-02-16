import { z } from 'zod';

export const esquemaActualizarUsuario = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(200).optional(),
  rol: z.enum(['ADMIN', 'USUARIO']).optional(),
});

export type ActualizarUsuarioBody = z.infer<typeof esquemaActualizarUsuario>;
