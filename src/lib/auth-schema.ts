import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/\d/, 'Debe contener al menos un número')
    .regex(/[\W_]/, 'Debe contener al menos un carácter especial'),
});

export type LoginInput = z.infer<typeof loginSchema>;
