import Link from 'next/link';

import { landingButtonVariants } from '@/components/landing/button-variants';
import { cn } from '@/lib/utils';

const navigation = [
  { href: '#solucion', label: 'Solucion' },
  { href: '#modulos', label: 'Modulos' },
  { href: '#industrias', label: 'Industrias' },
  { href: '#beneficios', label: 'Beneficios' },
  { href: '#demo', label: 'Demo' },
  { href: '#contacto', label: 'Contacto' },
] as const;

export default function Header() {
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

        <nav className='text-shGray-300 hidden items-center gap-6 text-sm lg:flex'>
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className='hover:text-shPrimary-300 transition-colors'
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className='hidden items-center gap-2 lg:flex'>
          <Link
            href='/login'
            className={cn(
              landingButtonVariants({ variant: 'outline' }),
              'border-shGray-600 text-shGray-200 hover:bg-shGray-700/40 h-10 bg-transparent px-4',
            )}
          >
            Iniciar sesion
          </Link>
          <a
            href='#demo'
            className={cn(
              landingButtonVariants(),
              'bg-shPrimary-400 text-shBackground hover:bg-shPrimary-300 h-10 px-5 font-semibold',
            )}
          >
            Solicitar demo
          </a>
        </div>

        <details className='group relative lg:hidden'>
          <summary className='border-shGray-700 text-shGray-200 list-none rounded-md border px-3 py-2 text-sm font-medium marker:content-none'>
            Menu
          </summary>
          <div className='border-shGray-700 bg-shBackground absolute right-0 mt-2 w-72 rounded-xl border p-4 shadow-2xl'>
            <div className='mb-4 grid gap-3 text-sm'>
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className='text-shGray-300 hover:bg-shGray-700/40 hover:text-shPrimary-300 rounded-md px-2 py-1 transition-colors'
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className='grid gap-2'>
              <Link
                href='/login'
                className={cn(
                  landingButtonVariants({ variant: 'outline' }),
                  'border-shGray-600 text-shGray-200 hover:bg-shGray-700/40 h-10 bg-transparent',
                )}
              >
                Iniciar sesion
              </Link>
              <a
                href='#demo'
                className={cn(
                  landingButtonVariants(),
                  'bg-shPrimary-400 text-shBackground hover:bg-shPrimary-300 h-10 font-semibold',
                )}
              >
                Solicitar demo
              </a>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
