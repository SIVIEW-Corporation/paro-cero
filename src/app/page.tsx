import BenefitsSection from '@/components/landing/BenefitsSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import IndustriesSection from '@/components/landing/IndustriesSection';
import ModulesSection from '@/components/landing/ModulesSection';

export default function Page() {
  return (
    <main className='public-shell bg-app-bg text-app-text-primary'>
      <Header />
      <Hero />
      <BenefitsSection />
      <ModulesSection />
      <HowItWorksSection />
      <IndustriesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
