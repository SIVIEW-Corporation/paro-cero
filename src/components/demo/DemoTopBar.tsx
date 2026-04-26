import Link from 'next/link';

import { landingButtonVariants } from '@/components/landing/button-variants';
import { cn } from '@/lib/utils';

export default function DemoTopBar() {
  return (
    <header className='border-app-border-soft bg-app-surface/90 sticky top-0 z-50 border-b shadow-sm shadow-slate-900/5 backdrop-blur-xl'>
      <div className='container flex h-16 items-center justify-between'>
        <Link
          href='/'
          className='flex items-baseline gap-2 transition-opacity duration-200 hover:opacity-80'
        >
          <span className='text-app-text-primary text-lg font-bold tracking-[0.14em]'>
            PM0
          </span>
          <span className='text-app-text-secondary text-sm font-medium tracking-wide'>
            Paro Cero
          </span>
        </Link>

        <div className='flex items-center gap-2'>
          <Link
            href='/login'
            className={cn(
              landingButtonVariants({ variant: 'outline' }),
              'hidden h-10 px-4 sm:inline-flex',
            )}
          >
            Iniciar sesion
          </Link>
          <Link
            href='/'
            className={cn(
              landingButtonVariants({ variant: 'outline' }),
              'h-10 px-4',
            )}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </header>
  );
}
