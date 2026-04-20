import Image from 'next/image';
import Link from 'next/link';

import {
  DEMO_MEDIA_CONFIG,
  hasRealDemoVideo,
} from '@/components/demo/demo-config';

interface DemoVideoPanelProps {
  isUnlocked: boolean;
  leadName: string;
}

export default function DemoVideoPanel({
  isUnlocked,
  leadName,
}: DemoVideoPanelProps) {
  return (
    <section className='border-shGray-700/80 rounded-2xl border bg-[linear-gradient(140deg,rgba(53,31,9,0.86),rgba(29,27,22,0.94))] p-6 sm:p-7'>
      <p className='text-shPrimary-300 text-xs font-semibold tracking-[0.2em] uppercase'>
        Paso 2
      </p>

      {!isUnlocked ? (
        <>
          <h2 className='text-shGray-200 mt-3 text-2xl leading-tight font-semibold'>
            Preview de la experiencia demo
          </h2>
          <p className='text-shGray-400 mt-3 text-sm leading-relaxed'>
            Despues de enviar el formulario podras ver el recorrido completo de
            PM0 aplicado a una operacion industrial.
          </p>

          <div className='border-shGray-700/80 relative mt-6 overflow-hidden rounded-xl border'>
            <div className='relative aspect-video'>
              <Image
                src={DEMO_MEDIA_CONFIG.previewImageSrc}
                alt='Vista previa de la demo de PM0'
                fill
                className='object-cover'
              />
              <div className='absolute inset-0 bg-[linear-gradient(110deg,rgba(18,17,15,0.88),rgba(18,17,15,0.48))]' />
              <div className='absolute right-3 bottom-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white'>
                {DEMO_MEDIA_CONFIG.previewDurationLabel}
              </div>
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='border-shPrimary-300/70 bg-shBackground/70 rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase'>
                  Bloqueado
                </div>
              </div>
            </div>
          </div>

          <h3 className='text-shGray-200 mt-5 text-lg font-semibold'>
            {DEMO_MEDIA_CONFIG.previewTitle}
          </h3>
          <p className='text-shGray-400 mt-2 text-sm'>
            {DEMO_MEDIA_CONFIG.previewDescription}
          </p>
        </>
      ) : (
        <>
          <div className='border-shPrimary-400/40 bg-shPrimary-800/60 text-shPrimary-200 rounded-lg border px-4 py-3 text-sm'>
            Gracias{leadName ? `, ${leadName}` : ''}. Ya tienes acceso a la demo
            completa.
          </div>
          <h2 className='text-shGray-200 mt-4 text-2xl leading-tight font-semibold'>
            Demo desbloqueada
          </h2>
          <p className='text-shGray-400 mt-3 text-sm leading-relaxed'>
            Este espacio queda listo para embebido final de video comercial y se
            habilita despues de registrar tu lead en la base de datos.
          </p>

          <div className='border-shGray-700/80 bg-shBackground/40 mt-6 overflow-hidden rounded-xl border'>
            {hasRealDemoVideo ? (
              <iframe
                src={DEMO_MEDIA_CONFIG.fullVideoUrl}
                title={DEMO_MEDIA_CONFIG.fullVideoTitle}
                className='aspect-video w-full'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                allowFullScreen
              />
            ) : (
              <div className='flex aspect-video flex-col items-center justify-center px-6 text-center'>
                <p className='text-shPrimary-300 text-xs font-semibold tracking-[0.18em] uppercase'>
                  Placeholder profesional
                </p>
                <h3 className='text-shGray-200 mt-3 text-xl font-semibold'>
                  Aqui se mostrara el video final de la demo
                </h3>
                <p className='text-shGray-400 mt-3 max-w-md text-sm leading-relaxed'>
                  Configura la URL del embed en
                  <code className='text-shPrimary-200 px-1'>
                    src/components/demo/demo-config.ts
                  </code>
                  para activar el video completo de forma inmediata.
                </p>
              </div>
            )}
          </div>

          <div className='mt-5 flex flex-wrap gap-3'>
            <Link
              href='/empresa/contacto'
              className='bg-shPrimary-400 text-shBackground hover:bg-shPrimary-300 inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-semibold transition-colors'
            >
              Hablar con ventas
            </Link>
            <Link
              href='/login'
              className='border-shGray-500 text-shGray-200 hover:bg-shGray-700/40 inline-flex h-10 items-center justify-center rounded-lg border px-5 text-sm font-medium transition-colors'
            >
              Iniciar sesion
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
