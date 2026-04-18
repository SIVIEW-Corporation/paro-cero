import Link from 'next/link';

import { footerNavColumns } from '@/app/(footer-pages)/_content/footer-pages';

export default function Footer() {
  return (
    <footer id='contacto' className='scroll-mt-24'>
      <div className='container py-16'>
        <div className='border-shGray-700/70 mb-10 flex flex-wrap items-center justify-between gap-4 border-b pb-8'>
          <div>
            <p className='text-shGray-200 text-lg font-bold tracking-[0.14em]'>
              PM0
            </p>
            <p className='text-shGray-400 text-sm'>Paro Cero</p>
          </div>
          <p className='text-shGray-400 text-sm'>
            Plataforma industrial para mantenimiento sin paros no planificados.
          </p>
        </div>

        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {footerNavColumns.map((column) => (
            <div key={column.title}>
              <h3 className='text-shPrimary-300 mb-3 text-xs font-semibold tracking-[0.16em] uppercase'>
                {column.title}
              </h3>
              <ul className='text-shGray-400 space-y-2 text-sm'>
                {column.links.map((link) => (
                  <li key={link.href} className='hover:text-shGray-300'>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className='text-shGray-500 mt-12 text-xs'>
          (c) {new Date().getFullYear()} Paro Cero. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
