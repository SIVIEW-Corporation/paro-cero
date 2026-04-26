import type { Metadata } from 'next';

import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';
import PricingSection from '@/components/landing/PricingSection';

export const metadata: Metadata = {
  title: 'Precios | PM0 Paro Cero',
  description:
    'Planes simples para digitalizar mantenimiento industrial con Paro Cero.',
};

export default function PricingPage() {
  return (
    <main className='public-shell bg-app-bg text-app-text-primary'>
      <Header />
      <PricingSection />
      <Footer />
    </main>
  );
}
