import Link from 'next/link';

import { landingButtonVariants } from '@/components/landing/button-variants';
import { cn } from '@/lib/utils';

const navigation = [
  { href: '/#solucion', label: 'Solucion' },
  { href: '/#modulos', label: 'Modulos' },
  { href: '/#industrias', label: 'Industrias' },
  { href: '/#beneficios', label: 'Beneficios' },
  { href: '/precios', label: 'Precios' },
  { href: '/blog', label: 'Blog' },
  { href: '/demo', label: 'Demo' },
  { href: '/#contacto', label: 'Contacto' },
] as const;

export default function Header() {
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

        <nav className='text-app-text-secondary hidden items-center gap-1 text-sm lg:flex'>
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className='hover:bg-app-surface-subtle hover:text-app-text-primary rounded-full px-3 py-2 transition-[background-color,color] duration-200'
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className='hidden items-center gap-2 lg:flex'>
          <Link
            href='/login'
            className={cn(
              landingButtonVariants({ variant: 'outline' }),
              'h-10 px-4',
            )}
          >
            Iniciar sesion
          </Link>
          <Link
            href='/demo'
            className={cn(landingButtonVariants(), 'h-10 px-5 font-semibold')}
          >
            Solicitar demo
          </Link>
        </div>

        <details className='group relative lg:hidden'>
          <summary className='text-app-text-primary border-app-border-soft bg-app-surface hover:border-app-border hover:bg-app-surface-subtle list-none rounded-md border px-3 py-2 text-sm font-medium transition-[background-color,border-color] duration-200 marker:content-none'>
            Menu
          </summary>
          <div className='border-app-border-soft bg-app-surface absolute right-0 mt-2 w-72 rounded-xl border p-4 shadow-2xl shadow-slate-900/10'>
            <div className='mb-4 grid gap-3 text-sm'>
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='text-app-text-secondary hover:bg-app-surface-subtle hover:text-app-text-primary rounded-md px-2 py-1 transition-[background-color,color] duration-200'
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className='grid gap-2'>
              <Link
                href='/login'
                className={cn(
                  landingButtonVariants({ variant: 'outline' }),
                  'h-10',
                )}
              >
                Iniciar sesion
              </Link>
              <Link
                href='/demo'
                className={cn(landingButtonVariants(), 'h-10 font-semibold')}
              >
                Solicitar demo
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
