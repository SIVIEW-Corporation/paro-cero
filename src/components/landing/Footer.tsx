import Link from 'next/link';

import { footerNavColumns } from '@/app/(footer-pages)/_content/footer-pages';

export default function Footer() {
  return (
    <footer
      id='contacto'
      className='border-app-border-soft bg-app-surface scroll-mt-24 border-t'
    >
      <div className='container py-16'>
        <div className='border-app-border-soft mb-10 flex flex-wrap items-center justify-between gap-4 border-b pb-8'>
          <div>
            <p className='text-app-text-primary text-lg font-bold tracking-[0.14em]'>
              PM0
            </p>
            <p className='text-app-text-secondary text-sm'>Paro Cero</p>
          </div>
          <p className='text-app-text-secondary text-sm'>
            Plataforma industrial para mantenimiento sin paros no planificados.
          </p>
        </div>

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
