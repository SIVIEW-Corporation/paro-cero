import { z } from 'zod';

export const newUserSchema = z.object({
  email: z.email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/\d/, 'Debe contener al menos un número')
    .regex(/[\W_]/, 'Debe contener al menos un carácter especial'),
  fullName: z
    .string()
    .min(1, 'Nombre completo requerido')
    .max(60, 'Nombre muy largo'),
  role: z.enum(['operator', 'viewer']),
  companyId: z.uuid('ID de empresa inválido'),
  area: z.string().min(1, 'Area requerida').max(40, 'Area muy larga'),
  jobTitle: z
    .string()
    .min(1, 'Posición requerida')
    .max(60, 'Posición muy larga'),
});

export type NewUserSchema = z.infer<typeof newUserSchema>;
