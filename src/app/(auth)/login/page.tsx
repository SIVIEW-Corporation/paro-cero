import Image from 'next/image';
import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <main className='auth-shell login-page-shell bg-gradient-to-br from-shBackground to-shNeutral-100 text-shNeutral-900 relative min-h-screen overflow-hidden'>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .login-page-shell {
            animation: loginShellIn 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
          }

          .login-brand-panel {
            animation: loginBrandIn 660ms cubic-bezier(0.22, 1, 0.36, 1) 80ms both;
          }

          .login-card-panel {
            animation: loginCardPanelIn 640ms cubic-bezier(0.22, 1, 0.36, 1) 140ms both;
          }
        }

        @keyframes loginShellIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes loginBrandIn {
          from { opacity: 0; transform: translate3d(-14px, 0, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        @keyframes loginCardPanelIn {
          from { opacity: 0; transform: translate3d(0, 16px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
      `}</style>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(15_23_42_/_0.04)_1px,transparent_0)] bg-size-[28px_28px]' />
      <div className='bg-shAccent-500/10 absolute top-0 right-0 h-80 w-80 rounded-full blur-3xl' />
      <div className='bg-shPrimary-500/5 absolute top-1/2 right-6 h-72 w-72 -translate-y-1/2 rounded-full blur-3xl motion-reduce:translate-y-0 lg:right-24' />
      <div className='absolute bottom-0 left-0 h-96 w-96 rounded-full bg-white/40 blur-3xl' />

      <div className='relative grid min-h-screen grid-cols-1 lg:grid-cols-2'>
        <section className='bg-shPrimary-900 flex items-center justify-center px-6 pt-10 pb-6 sm:px-10 lg:px-16 lg:py-16 xl:px-24'>
          <div className='login-brand-panel mx-auto w-full max-w-xl lg:mx-0'>
            <div className='mb-10 flex items-center gap-3'>
              <div className='border-shPrimary-700 bg-shPrimary-800 rounded-2xl border p-2 shadow-sm'>
                <Image
                  src='/PM0-logo.webp'
                  alt='Logo PM0'
                  height={56}
                  width={56}
                  className='h-12 w-auto rounded-xl object-contain'
                  loading='eager'
                />
              </div>
              <div>
                <p className='text-shAccent-400 text-sm font-semibold tracking-[0.18em] uppercase'>
                  PM0
                </p>
                <p className='text-shNeutral-300 text-sm font-medium'>
                  Paro Cero
                </p>
              </div>
            </div>

            <div className='border-shPrimary-700 bg-shPrimary-800/80 text-shNeutral-200 mb-6 inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase shadow-sm backdrop-blur'>
              Gestión de Mantenimiento
            </div>

            <h1 className='text-white max-w-xl text-4xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-5xl xl:text-6xl'>
              Control operativo para mantenimiento industrial
            </h1>
            <p className='text-shNeutral-300 mt-6 max-w-xl text-base leading-7 sm:text-lg'>
              Accede a tu espacio de trabajo para gestionar activos, órdenes,
              preventivos, inspecciones y KPIs en una sola plataforma.
            </p>
          </div>
        </section>

        <section className='login-card-panel border-shNeutral-200 relative flex items-start justify-center px-6 pb-10 sm:px-10 lg:items-center lg:border-l lg:bg-white/60 lg:px-12 lg:py-16 lg:backdrop-blur-sm'>
          <div className='bg-shAccent-500/8 pointer-events-none absolute inset-x-0 top-1/2 mx-auto -mt-36 h-72 w-72 rounded-full blur-3xl' />
          <div className='w-full max-w-md'>
            <LoginForm />
            <p className='text-shNeutral-400 mt-8 text-center text-xs font-medium'>
              © 2026 SIVIEW. Todos los derechos reservados.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
