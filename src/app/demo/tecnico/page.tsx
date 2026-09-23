import Link from 'next/link';
import TechnicianScreen from '@/features/technician/technician-screen';

export default function TechnicianDemoPage() {
  return (
    <div className='auth-shell bg-app-bg text-app-text-primary min-h-screen'>
      <main className='mx-auto max-w-7xl px-4 py-5 sm:px-6'>
        <nav
          aria-label='Demo del técnico'
          className='border-app-border-soft flex items-center justify-between border-b pb-3 text-sm'
        >
          <Link
            href='/demo/planeacion'
            className='text-shPrimary-800 font-semibold'
          >
            ← Planeación demo
          </Link>
          <span className='text-app-text-secondary'>
            Vista de prueba · sin datos reales
          </span>
        </nav>
        <TechnicianScreen demoMode />
      </main>
    </div>
  );
}
