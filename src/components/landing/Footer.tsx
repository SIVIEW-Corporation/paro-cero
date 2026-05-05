import Link from 'next/link';

import { footerNavColumns } from '@/app/(footer-pages)/_content/footer-pages';

export default function Footer() {
  return (
    <footer
      id='contacto'
      className='bg-app-surface scroll-mt-24'
    >
      {/* Brand band - full-width dark section */}
      <div className='bg-zinc-950'>
        <div className='mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:gap-8'>
          <div className='flex flex-col gap-1'>
            <p className='text-white text-3xl font-bold tracking-[0.14em] sm:text-4xl'>
              PM0
            </p>
            <p className='text-zinc-400 text-base sm:text-lg'>Paro Cero</p>
          </div>
          <p className='text-zinc-300 max-w-md text-lg leading-relaxed sm:text-xl'>
            Plataforma industrial para mantenimiento sin paros no
            planificados.
          </p>
        </div>
      </div>

      <div className='container border-app-border-soft border-t py-16'>
        {/* Columns and copyright remain below */}

        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {footerNavColumns.map((column) => (
            <div key={column.title}>
              <h3 className='text-app-brand mb-3 text-xs font-semibold tracking-[0.16em] uppercase'>
                {column.title}
              </h3>
              <ul className='text-app-text-secondary space-y-2 text-sm'>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className='hover:text-app-text-primary transition-colors duration-200'
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className='text-app-text-muted mt-12 text-xs'>
          (c) {new Date().getFullYear()} Paro Cero. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
