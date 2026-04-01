import Image from 'next/image';
import LoginForm from './login-form';
import { AnimatePresence } from 'motion/react';
import * as motion from 'motion/react-client';

export default function LoginPage() {
  return (
    <AnimatePresence>
      <main className='relative flex min-h-screen w-full flex-col overflow-x-hidden lg:flex-row'>
        {/* Left Panel - Branding */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className='bg-shPrimary-800/50 relative flex w-full flex-col items-center justify-center overflow-hidden p-12 text-white lg:w-5/12'
        >
          <div className='bg-pattern absolute inset-0 opacity-10' />
          <div className='relative z-20 flex flex-col items-center text-center'>
            <div className='from-shPrimary-800/50 mb-8 hidden rounded-2xl bg-linear-to-t to-black/25 p-4 brightness-105 backdrop-blur-sm md:p-6 lg:block'>
              <Image
                src='/PM0-512.png'
                alt='Logo PM0'
                height={120}
                width={120}
                className='h-20 w-auto'
                priority
              />
            </div>
            <h1 className='max-w-md text-2xl leading-tight font-bold tracking-tight md:text-3xl lg:text-4xl'>
              Portal para Gestión de Mantenimiento
            </h1>{' '}
            <p className='text-shPrimary-200 mt-6 max-w-sm md:text-lg'>
              Control inteligente y seguro de tus activos
            </p>
          </div>
          {/* Decorative circles */}
          <div className='bg-shPrimary-700/20 absolute -right-24 -bottom-24 h-96 w-96 rounded-full blur-3xl' />
          <div className='bg-shPrimary-700/20 absolute -top-24 -left-24 h-96 w-96 animate-pulse rounded-full blur-3xl' />
        </motion.div>
        <div className='bg-shPrimary-600/5 absolute -right-24 -bottom-24 z-10 h-64 w-64 animate-pulse rounded-full blur-3xl sm:-top-24' />

        {/* Right Panel - Login Form */}
        <div className='bg-shBackground relative flex w-full flex-col items-center justify-center p-6 lg:w-7/12'>
          <div className='absolute inset-0 bg-[radial-gradient(#252323_1px,transparent_1px)] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-size-[16px_16px]' />

          {/* Mobile Logo (only visible on small screens) */}
          <div className='relative z-20 mb-8 lg:hidden'>
            <Image
              src='/PM0-512.png'
              alt='Logo PM0'
              height={64}
              width={64}
              className='h-16 w-auto object-contain'
            />
          </div>

          <div className='relative z-20 w-full max-w-md'>
            <LoginForm />
            <p className='mt-8 text-center text-sm text-zinc-400'>
              © 2026 SIVIEW. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </main>
    </AnimatePresence>
  );
}
