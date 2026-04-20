import { z } from 'zod';

export const demoLeadSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Ingresa tu nombre completo')
    .max(120, 'El nombre es demasiado largo'),
  companyName: z
    .string()
    .trim()
    .min(2, 'Ingresa el nombre de la empresa')
    .max(120, 'El nombre de la empresa es demasiado largo'),
  email: z
    .string()
    .trim()
    .pipe(z.email('Ingresa un correo valido'))
    .transform((value) => value.toLowerCase()),
  phone: z
    .string()
    .trim()
    .max(30, 'El telefono es demasiado largo')
    .regex(/^[+()\d\s-]*$/, 'Ingresa un telefono valido')
    .optional()
    .or(z.literal('')),
  interestMessage: z
    .string()
    .trim()
    .max(1000, 'El mensaje no puede superar 1000 caracteres')
    .optional()
    .or(z.literal('')),
});

export type DemoLeadInput = z.infer<typeof demoLeadSchema>;

export type DemoLeadField = keyof DemoLeadInput;
