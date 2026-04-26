import { Check } from 'lucide-react';
import Link from 'next/link';

import { landingButtonVariants } from '@/components/landing/button-variants';
import ScrollReveal from '@/components/landing/ScrollReveal';
import { cn } from '@/lib/utils';

interface PricingPlan {
  name: string;
  initialPrice?: string;
  price?: string;
  secondaryText: string;
  monthly?: string;
  description: string;
  badge?: string;
  benefits: string[];
  cta: string;
  recommended?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Implementación completa',
    initialPrice: '$50,000 MXN',
    secondaryText: 'pago inicial',
    monthly: '+ $5,000 MXN / mes',
    description:
      'Para empresas que quieren arrancar con Paro Cero ya conectado a su operación real desde el primer día.',
    badge: 'Recomendado para operación industrial',
    benefits: [
      'Integración de datos existentes de la empresa',
      'Configuración inicial de activos, máquinas y personal',
      'Adaptación de dashboards a la operación',
      'Logo de la empresa en la plataforma',
      'Logo en dashboards e imprimibles',
      'Acompañamiento inicial de implementación',
      'Suscripción mensual incluida como servicio activo',
    ],
    cta: 'Solicitar implementación',
    recommended: true,
  },
  {
    name: 'Plataforma',
    price: '$5,000 MXN / mes',
    secondaryText: 'sin pago inicial',
    description:
      'Para empresas que quieren empezar rápido usando la plataforma y capturar manualmente su información.',
    benefits: [
      'Acceso a la plataforma Paro Cero',
      'Gestión de activos',
      'Órdenes de trabajo',
      'Mantenimiento preventivo',
      'Inspecciones y checklist',
      'KPIs y reportes operativos',
      'Carga manual de datos por el equipo del cliente',
    ],
    cta: 'Empezar con plataforma',
  },
];

export default function PricingSection() {
  return (
    <section
      id='precios'
      className='border-app-border-soft bg-app-bg relative overflow-hidden border-b'
    >
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(216,155,43,0.18),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(203,213,225,0.42),transparent_32%)]' />
      <div className='relative container py-12 md:py-16'>
        <ScrollReveal className='mx-auto max-w-xl text-center'>
          <p className='text-app-brand mb-2 text-xs font-semibold tracking-[0.24em] uppercase'>
            Planes PM0
          </p>
          <h1 className='text-app-text-primary text-2xl leading-tight font-bold md:text-3xl'>
            Planes simples para digitalizar tu mantenimiento
          </h1>
          <p className='text-app-text-secondary mt-2 text-sm leading-relaxed'>
            Elige entre una implementación completa con integración operativa o
            empieza solo con la plataforma y carga tus datos manualmente.
          </p>
        </ScrollReveal>

        <div className='mt-8 grid gap-4 lg:mx-auto lg:max-w-4xl lg:grid-cols-2 lg:items-stretch'>
          {pricingPlans.map((plan, index) => (
            <ScrollReveal key={plan.name} delay={index * 90}>
              <article
                className={cn(
                  'border-app-border-soft bg-app-surface hover:border-app-border flex h-full flex-col rounded-xl border p-4 shadow-lg shadow-slate-900/5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-xl sm:p-5',
                  plan.recommended &&
                    'border-app-brand/70 ring-app-brand/20 bg-[linear-gradient(145deg,#ffffff,#fff4db)] ring-1',
                )}
              >
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <div>
                    <p className='text-app-text-primary text-lg font-semibold'>
                      {plan.name}
                    </p>
                    <p className='text-app-text-secondary mt-1 text-sm leading-relaxed'>
                      {plan.description}
                    </p>
                  </div>
                  {plan.badge ? (
                    <span className='border-app-brand/30 bg-app-brand-soft text-app-brand-dark rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase'>
                      {plan.badge}
                    </span>
                  ) : null}
                </div>

                <div className='border-app-border-soft mt-4 border-t py-4'>
                  {plan.initialPrice ? (
                    <div>
                      <div className='flex flex-wrap items-end gap-x-1.5 gap-y-0.5'>
                        <p className='text-app-text-primary text-2xl font-bold tracking-tight md:text-3xl'>
                          {plan.initialPrice}
                        </p>
                        <p className='text-app-text-muted pb-0.5 text-xs font-medium uppercase'>
                          {plan.secondaryText}
                        </p>
                      </div>
                      <p className='text-app-brand mt-1 text-base font-semibold'>
                        {plan.monthly}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className='text-app-text-primary text-2xl font-bold tracking-tight md:text-3xl'>
                        {plan.price}
                      </p>
                      <p className='text-app-text-muted mt-1 text-xs font-medium uppercase'>
                        {plan.secondaryText}
                      </p>
                    </div>
                  )}
                </div>

                <ul className='mt-2 flex-1 space-y-1.5'>
                  {plan.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className='flex gap-1.5 text-xs leading-relaxed'
                    >
                      <Check className='text-app-brand mt-0.5 size-3 shrink-0' />
                      <span className='text-app-text-secondary'>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href='/demo'
                  className={cn(
                    landingButtonVariants({
                      variant: plan.recommended ? 'default' : 'outline',
                    }),
                    'mt-4 h-9 w-full px-3 text-sm font-semibold',
                  )}
                >
                  {plan.cta}
                </Link>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
