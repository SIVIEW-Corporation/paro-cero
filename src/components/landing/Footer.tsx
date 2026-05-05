import Link from 'next/link';
import Image from 'next/image';

import { footerNavColumns } from '@/app/(footer-pages)/_content/footer-pages';

export default function Footer() {
  return (
    <footer
      id='contacto'
      className='from-shNeutral-950 scroll-mt-24 bg-linear-to-b to-black'
    >
      {/* Brand band - full-width dark section */}
      <div>
        <div className='container flex flex-col gap-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:gap-8 lg:py-16'>
          <Image
            src='/PM0-logo.webp'
            alt='PM0 logo'
            width={100}
            height={100}
            className='rounded-xl object-contain shadow-md'
          />
          <p className='text-shNeutral-300 text-lg leading-relaxed sm:text-xl'>
            Plataforma industrial para mantenimiento sin paros no planificados.
          </p>
        </div>
      </div>

      <div className='border-shNeutral-800 container border-t py-12 lg:py-16'>
        {/* Columns and copyright remain below */}

        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {footerNavColumns.map((column) => (
            <div key={column.title}>
              <h3 className='text-shAccent-500 mb-3 text-xs font-bold tracking-[0.16em] uppercase'>
                {column.title}
              </h3>
              <ul className='text-shNeutral-400 space-y-2 text-sm'>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className='transition-colors duration-200 hover:text-white hover:underline'
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className='text-app-text-muted mx-auto mt-12 text-center text-xs'>
        (c) {new Date().getFullYear()} Paro Cero. Todos los derechos reservados.
      </p>
    </footer>
  );
}
