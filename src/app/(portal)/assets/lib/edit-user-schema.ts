import { z } from 'zod';

export const editUserSchema = z.object({
  email: z.email('Email inválido').or(z.literal('')).optional(),
  fullName: z
    .string()
    .min(1, 'Nombre completo requerido')
    .max(60, 'Nombre muy largo')
    .or(z.literal(''))
    .optional(),
  role: z.enum(['admin', 'supervisor', 'operator', 'viewer']).optional(),
  area: z
    .string()
    .min(1, 'Área requerida')
    .max(40, 'Área muy larga')
    .or(z.literal(''))
    .optional(),
  jobTitle: z
    .string()
    .min(1, 'Puesto requerido')
    .max(60, 'Puesto muy largo')
    .or(z.literal(''))
    .optional(),
  profileImage: z.string().or(z.literal('')).optional(),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/\d/, 'Debe contener al menos un número')
    .regex(/[\W_]/, 'Debe contener al menos un carácter especial')
    .or(z.literal(''))
    .optional(),
});

export type EditUserSchema = z.infer<typeof editUserSchema>;
