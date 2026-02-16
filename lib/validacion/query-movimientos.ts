import { z } from 'zod';

export const esquemaQueryMovimientos = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  order: z.enum(['fecha_asc', 'fecha_desc']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  tipo: z.enum(['INGRESO', 'EGRESO']).optional(),
});

export type QueryMovimientos = z.infer<typeof esquemaQueryMovimientos>;
