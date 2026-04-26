'use client';

import { useState } from 'react';

import { createDemoLeadAction } from '@/app/actions/demo-leads';
import DemoCaptureForm, {
  DEMO_FORM_SUBMIT_STATUS,
  type DemoFormSubmitStatus,
  type DemoFormValues,
} from '@/components/demo/DemoCaptureForm';
import type { DemoLeadField } from '@/components/demo/demo-lead-schema';
import DemoVideoPanel from '@/components/demo/DemoVideoPanel';
import ScrollReveal from '@/components/landing/ScrollReveal';

type DemoFormFieldErrors = Partial<Record<DemoLeadField, string>>;

export default function DemoCaptureExperience() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [submitStatus, setSubmitStatus] = useState<DemoFormSubmitStatus>(
    DEMO_FORM_SUBMIT_STATUS.IDLE,
  );
  const [submitError, setSubmitError] = useState('');
  const [serverFieldErrors, setServerFieldErrors] =
    useState<DemoFormFieldErrors>({});

  const handleSubmit = async (values: DemoFormValues) => {
    setSubmitStatus(DEMO_FORM_SUBMIT_STATUS.SUBMITTING);
    setSubmitError('');
    setServerFieldErrors({});

    const result = await createDemoLeadAction(values);

    if (!result.success) {
      setSubmitStatus(DEMO_FORM_SUBMIT_STATUS.ERROR);
      setSubmitError(result.message);
      setServerFieldErrors(result.fieldErrors || {});
      return;
    }

    setLeadName(values.fullName);
    setSubmitStatus(DEMO_FORM_SUBMIT_STATUS.SUCCESS);
    setIsUnlocked(true);
  };

  return (
    <section className='bg-app-bg py-14 md:py-20'>
      <div className='container'>
        <div className='mx-auto max-w-6xl'>
          <ScrollReveal className='mb-10 max-w-3xl space-y-4'>
            <p className='text-app-brand text-xs font-semibold tracking-[0.22em] uppercase'>
              Solicitar demo
            </p>
            <h1 className='text-app-text-primary text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl'>
              Conoce PM0 en un recorrido enfocado en resultados operativos
              reales
            </h1>
            <p className='text-app-text-secondary text-base leading-relaxed sm:text-lg'>
              Mostramos como equipos industriales centralizan mantenimiento,
              trazabilidad y priorizacion para reducir paradas no planificadas.
            </p>
          </ScrollReveal>

          <div className='grid gap-6 lg:grid-cols-2'>
            <ScrollReveal>
              <DemoCaptureForm
                onSubmit={handleSubmit}
                submitStatus={submitStatus}
                submitError={submitError}
                serverFieldErrors={serverFieldErrors}
              />
            </ScrollReveal>
            <ScrollReveal delay={90}>
              <DemoVideoPanel isUnlocked={isUnlocked} leadName={leadName} />
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
