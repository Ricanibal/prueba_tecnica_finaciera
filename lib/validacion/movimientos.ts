import { z } from 'zod';

export const esquemaCrearMovimiento = z.object({
  concepto: z
    .string()
    .min(1, 'El concepto es obligatorio')
    .max(500, 'Máximo 500 caracteres'),
  monto: z.number().positive('El monto debe ser mayor que 0'),
  fecha: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), 'Fecha inválida'),
  tipo: z.enum(['INGRESO', 'EGRESO']),
});

export type CrearMovimientoBody = z.infer<typeof esquemaCrearMovimiento>;
