import type { Metadata } from 'next';

import DemoCaptureExperience from '@/components/demo/DemoCaptureExperience';
import DemoTopBar from '@/components/demo/DemoTopBar';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Solicitar demo | PM0 Paro Cero',
  description:
    'Solicita una demo ejecutiva de PM0 y desbloquea el recorrido completo de la plataforma.',
};

export default function DemoPage() {
  return (
    <main className='public-shell bg-app-bg text-app-text-primary'>
      <DemoTopBar />
      <DemoCaptureExperience />
      <Footer />
    </main>
  );
}
