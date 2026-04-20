import Link from 'next/link';

import { landingButtonVariants } from '@/components/landing/button-variants';
import { cn } from '@/lib/utils';

export default function DemoTopBar() {
  return (
    <header className='border-shGray-700/70 bg-shBackground/90 sticky top-0 z-50 border-b backdrop-blur-md'>
      <div className='container flex h-16 items-center justify-between'>
        <Link href='/' className='flex items-baseline gap-2'>
          <span className='text-shGray-200 text-lg font-bold tracking-[0.14em]'>
            PM0
          </span>
          <span className='text-shGray-400 text-sm font-medium tracking-wide'>
            Paro Cero
          </span>
        </Link>

        <div className='flex items-center gap-2'>
          <Link
            href='/login'
            className={cn(
              landingButtonVariants({ variant: 'outline' }),
              'border-shGray-600 text-shGray-200 hover:bg-shGray-700/40 hidden h-10 bg-transparent px-4 sm:inline-flex',
            )}
          >
            Iniciar sesion
          </Link>
          <Link
            href='/'
            className={cn(
              landingButtonVariants({ variant: 'outline' }),
              'border-shGray-600 text-shGray-300 hover:bg-shGray-700/40 h-10 bg-transparent px-4',
            )}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </header>
  );
}
