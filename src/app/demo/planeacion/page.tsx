import Link from 'next/link';
import PlanningScreen from '@/features/planning/planning-screen';

/** Public preview: exclusively browser-local mock data, no backend requests. */
export default function PlanningDemoPage() {
  return (
    <div className='auth-shell bg-app-bg text-app-text-primary min-h-screen'>
      <main className='mx-auto max-w-7xl px-4 py-5 sm:px-6'>
        <nav
          aria-label='Demo de Planeación'
          className='border-app-border-soft flex items-center justify-between border-b pb-3 text-sm'
        >
          <Link href='/demo' className='text-shPrimary-800 font-semibold'>
            ← Demo PM0
          </Link>
          <span className='text-app-text-secondary'>
            Vista de prueba · sin acceso a datos reales
          </span>
        </nav>
        <PlanningScreen />
      </main>
    </div>
  );
}
